"""
FOTOMHS extractor + MinIO uploader.

Streams photos out of FOTOMHS.zip (containing daily tar.gz backups), maps each
NPM to id_pd via the SQL Server staging DB, and uploads to MinIO at
  photos/pd/{id_pd}.jpg
mirroring the convention used by sister-service for dosen (photos/sdm/...).

Idempotent: progress is tracked in a local SQLite state DB so reruns skip
already-uploaded NPMs. Newest tar.gz is processed first so the most recent
photo wins.

Usage:
    python extract_upload.py                 # full run
    python extract_upload.py --dry-run       # plan only, no upload
    python extract_upload.py --limit 100     # cap entries (debug)
    python extract_upload.py --retry-errors  # retry rows previously errored
    python extract_upload.py --check-minio   # also stat MinIO before upload
"""
from __future__ import annotations

import argparse
import io
import logging
import os
import re
import sqlite3
import sys
import tarfile
import threading
import time
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from dotenv import load_dotenv
from minio import Minio
from minio.error import S3Error
from tqdm import tqdm

HERE = Path(__file__).resolve().parent
load_dotenv(HERE / ".env")

LOG_FILE = HERE / os.environ.get("LOG_FILE", "run.log")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[logging.FileHandler(LOG_FILE, encoding="utf-8"), logging.StreamHandler(sys.stdout)],
)
log = logging.getLogger("fotomhs")

NPM_RE = re.compile(r"(\d{6,14})\.jpe?g$", re.IGNORECASE)
ARCHIVE_DATE_RE = re.compile(r"(\d{8})\.tar\.gz$")


def env(k: str, default: str | None = None) -> str:
    v = os.environ.get(k, default)
    if v is None:
        raise SystemExit(f"missing env: {k}")
    return v


# ---------- state ----------

STATE_SCHEMA = """
CREATE TABLE IF NOT EXISTS processed (
    npm        TEXT PRIMARY KEY,
    id_pd      TEXT,
    status     TEXT NOT NULL,        -- uploaded | no_id_pd | error
    archive    TEXT,                  -- source tar.gz
    size       INTEGER,
    error      TEXT,
    updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_processed_status ON processed(status);
"""


class State:
    def __init__(self, path: Path):
        self.path = path
        self.conn = sqlite3.connect(path, check_same_thread=False, isolation_level=None)
        self.conn.executescript(STATE_SCHEMA)
        self.conn.execute("PRAGMA journal_mode=WAL;")
        self.conn.execute("PRAGMA synchronous=NORMAL;")
        self.lock = threading.Lock()

    def already(self, npm: str, retry_errors: bool) -> bool:
        cur = self.conn.execute("SELECT status FROM processed WHERE npm=?", (npm,))
        row = cur.fetchone()
        if row is None:
            return False
        if row[0] == "uploaded":
            return True
        if row[0] == "no_id_pd":
            # do not retry these unless DB cache changes — main() handles that
            return True
        if row[0] == "error" and not retry_errors:
            return True
        return False

    def record(self, npm: str, status: str, *, id_pd: str | None = None,
               archive: str | None = None, size: int | None = None, error: str | None = None):
        ts = time.strftime("%Y-%m-%dT%H:%M:%S")
        with self.lock:
            self.conn.execute(
                "INSERT INTO processed(npm,id_pd,status,archive,size,error,updated_at) "
                "VALUES(?,?,?,?,?,?,?) "
                "ON CONFLICT(npm) DO UPDATE SET id_pd=excluded.id_pd, status=excluded.status, "
                "archive=excluded.archive, size=excluded.size, error=excluded.error, updated_at=excluded.updated_at",
                (npm, id_pd, status, archive, size, error, ts),
            )

    def counts(self) -> dict[str, int]:
        rows = self.conn.execute("SELECT status, COUNT(*) FROM processed GROUP BY status").fetchall()
        return {r[0]: r[1] for r in rows}


# ---------- DB lookup ----------

def _pick_odbc_driver(requested: str) -> str:
    import pyodbc

    avail = pyodbc.drivers()
    # accept user-given name if it's a valid installed ODBC driver
    if requested and requested.strip("{}") in avail:
        return requested if requested.startswith("{") else "{" + requested + "}"
    # otherwise auto-pick: prefer 18 → 17 → SQL Server
    for cand in ("ODBC Driver 18 for SQL Server", "ODBC Driver 17 for SQL Server", "SQL Server"):
        if cand in avail:
            return "{" + cand + "}"
    raise SystemExit(f"no usable ODBC driver. installed: {avail}")


def load_npm_to_idpd() -> dict[str, str]:
    import pyodbc

    driver = _pick_odbc_driver(env("DB_DRIVER", ""))
    host = env("DB_HOST")
    port = env("DB_PORT", "1433")
    database = env("DB_DATABASE")
    user = env("DB_USERNAME")
    pwd = env("DB_PASSWORD")
    trust = env("DB_TRUST_SERVER_CERTIFICATE", "true").lower() == "true"

    conn_str = (
        f"DRIVER={driver};SERVER={host},{port};DATABASE={database};"
        f"UID={user};PWD={pwd};"
        f"TrustServerCertificate={'yes' if trust else 'no'};Encrypt=yes;"
    )
    log.info("connecting SQL Server %s:%s/%s", host, port, database)
    conn = pyodbc.connect(conn_str, timeout=30)
    cur = conn.cursor()

    # Try denormalized siakadu.mahasiswa first (preferred per CLAUDE.md/SIMBAK notes).
    queries = [
        "SELECT nim, id_pd FROM siakadu.mahasiswa WHERE nim IS NOT NULL AND id_pd IS NOT NULL AND ISNULL(soft_delete,0)=0",
        # fallback: raw reg_pd
        "SELECT nipd AS nim, id_pd FROM pdrd.reg_pd WHERE nipd IS NOT NULL AND id_pd IS NOT NULL",
    ]
    rows: list[tuple[str, str]] = []
    for q in queries:
        try:
            cur.execute(q)
            rows = cur.fetchall()
            log.info("loaded %d rows via: %s", len(rows), q.split("FROM")[1].strip())
            if rows:
                break
        except Exception as e:  # noqa: BLE001
            log.warning("query failed (%s): %s", q[:60], e)
    cur.close()
    conn.close()

    mapping: dict[str, str] = {}
    dups = 0
    for nim, id_pd in rows:
        if nim is None or id_pd is None:
            continue
        nim = str(nim).strip()
        id_pd = str(id_pd).strip()
        if not nim or not id_pd:
            continue
        if nim in mapping and mapping[nim] != id_pd:
            dups += 1
            continue  # keep first
        mapping[nim] = id_pd
    log.info("npm->id_pd cache: %d unique (%d duplicate NIMs ignored)", len(mapping), dups)
    return mapping


# ---------- MinIO ----------

def make_minio() -> tuple[Minio, str, str]:
    endpoint = env("MINIO_ENDPOINT")
    access = env("MINIO_ACCESS_KEY")
    secret = env("MINIO_SECRET_KEY")
    bucket = env("MINIO_BUCKET", "myunila-storage")
    secure = env("MINIO_USE_SSL", "false").lower() == "true"
    prefix = env("MINIO_PREFIX", "photos/pd").strip("/")

    cli = Minio(endpoint, access_key=access, secret_key=secret, secure=secure)
    if not cli.bucket_exists(bucket):
        raise SystemExit(f"bucket not found: {bucket}")
    log.info("MinIO ready: endpoint=%s bucket=%s prefix=%s", endpoint, bucket, prefix)
    return cli, bucket, prefix


# ---------- archive iteration ----------

@dataclass
class PhotoEntry:
    npm: str
    archive: str
    data: bytes
    size: int


def list_archives(zip_path: Path) -> list[str]:
    z = zipfile.ZipFile(zip_path)
    names = [n for n in z.namelist() if n.endswith(".tar.gz")]

    def sort_key(n: str) -> str:
        m = ARCHIVE_DATE_RE.search(n)
        return m.group(1) if m else ""

    # newest first → first hit wins (we record once per NPM)
    names.sort(key=sort_key, reverse=True)
    z.close()
    return names


def iter_photos(zip_path: Path, archives: list[str]) -> Iterable[PhotoEntry]:
    z = zipfile.ZipFile(zip_path)
    try:
        for arc in archives:
            log.info("opening archive: %s", arc)
            with z.open(arc) as zfp:
                # streaming gzip+tar
                t = tarfile.open(fileobj=zfp, mode="r|gz")
                for m in t:
                    if not m.isfile():
                        continue
                    base = os.path.basename(m.name)
                    mm = NPM_RE.search(base)
                    if not mm:
                        continue
                    npm = mm.group(1)
                    f = t.extractfile(m)
                    if f is None:
                        continue
                    data = f.read()
                    yield PhotoEntry(npm=npm, archive=arc, data=data, size=len(data))
                t.close()
    finally:
        z.close()


# ---------- main ----------

def upload_one(cli: Minio, bucket: str, prefix: str, id_pd: str, data: bytes) -> None:
    path = f"{prefix}/{id_pd}.jpg"
    cli.put_object(
        bucket_name=bucket,
        object_name=path,
        data=io.BytesIO(data),
        length=len(data),
        content_type="image/jpeg",
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--limit", type=int, default=0, help="cap entries iterated (0=all)")
    ap.add_argument("--retry-errors", action="store_true")
    ap.add_argument("--check-minio", action="store_true",
                    help="stat MinIO before upload (skip existing). Slower, network-bound.")
    ap.add_argument("--archive", default=None, help="regex filter on archive name (debug)")
    args = ap.parse_args()

    zip_path = Path(env("FOTOMHS_ZIP"))
    if not zip_path.exists():
        raise SystemExit(f"zip not found: {zip_path}")

    state = State(HERE / env("STATE_DB", "state.db"))
    log.info("state: %s", state.counts())

    npm_map = load_npm_to_idpd()

    cli, bucket, prefix = (None, None, None)
    if not args.dry_run:
        cli, bucket, prefix = make_minio()

    archives = list_archives(zip_path)
    if args.archive:
        rx = re.compile(args.archive)
        archives = [a for a in archives if rx.search(a)]
    log.info("archives to process (newest-first): %d", len(archives))

    workers = int(env("UPLOAD_WORKERS", "8"))
    pool = ThreadPoolExecutor(max_workers=workers) if not args.dry_run else None

    stats = {"seen": 0, "uploaded": 0, "skipped_state": 0, "no_id_pd": 0,
             "skipped_minio": 0, "error": 0}

    pending: list = []

    def submit(npm: str, id_pd: str, data: bytes, archive: str):
        def _do():
            try:
                if args.check_minio and cli is not None:
                    try:
                        cli.stat_object(bucket, f"{prefix}/{id_pd}.jpg")
                        state.record(npm, "uploaded", id_pd=id_pd, archive=archive,
                                     size=len(data), error="already_in_minio")
                        stats["skipped_minio"] += 1
                        return
                    except S3Error as e:
                        if e.code != "NoSuchKey":
                            raise
                upload_one(cli, bucket, prefix, id_pd, data)
                state.record(npm, "uploaded", id_pd=id_pd, archive=archive, size=len(data))
                stats["uploaded"] += 1
            except Exception as e:  # noqa: BLE001
                state.record(npm, "error", id_pd=id_pd, archive=archive,
                             size=len(data), error=str(e)[:500])
                stats["error"] += 1
                log.warning("upload failed npm=%s id_pd=%s: %s", npm, id_pd, e)

        return pool.submit(_do)

    pbar = tqdm(unit="photo", smoothing=0.05)
    try:
        for entry in iter_photos(zip_path, archives):
            stats["seen"] += 1
            pbar.update(1)

            if args.limit and stats["seen"] > args.limit:
                break

            if state.already(entry.npm, retry_errors=args.retry_errors):
                stats["skipped_state"] += 1
                continue

            id_pd = npm_map.get(entry.npm)
            if not id_pd:
                state.record(entry.npm, "no_id_pd", archive=entry.archive, size=entry.size)
                stats["no_id_pd"] += 1
                continue

            if args.dry_run:
                stats["uploaded"] += 1  # would-be
                continue

            pending.append(submit(entry.npm, id_pd, entry.data, entry.archive))

            # backpressure: keep at most 4*workers in flight
            if len(pending) >= workers * 4:
                done_idx = []
                for i, fut in enumerate(pending):
                    if fut.done():
                        done_idx.append(i)
                for i in reversed(done_idx):
                    pending.pop(i)

        if pool is not None:
            for fut in as_completed(pending):
                fut.result()
            pool.shutdown(wait=True)
    finally:
        pbar.close()

    log.info("DONE stats=%s", stats)
    log.info("state totals: %s", state.counts())


if __name__ == "__main__":
    main()
