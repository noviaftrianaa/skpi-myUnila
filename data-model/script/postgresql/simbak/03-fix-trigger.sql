-- Fix trigger function: remove hardcoded id_pengajuan fallback
CREATE OR REPLACE FUNCTION log.fn_catat_aktivitas_data()
RETURNS TRIGGER AS $$
DECLARE
    v_id_record     UUID;
    v_data_lama     TEXT := NULL;
    v_data_baru     TEXT := NULL;
    v_kolom_berubah TEXT := NULL;
    v_id_pengguna   UUID := NULL;
    v_ip_address    VARCHAR(45) := NULL;
BEGIN
    BEGIN
        v_id_pengguna := current_setting('simbak.id_pengguna', true)::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_id_pengguna := NULL;
    END;
    BEGIN
        v_ip_address := current_setting('simbak.ip_address', true);
    EXCEPTION WHEN OTHERS THEN
        v_ip_address := NULL;
    END;

    IF TG_OP = 'INSERT' THEN
        EXECUTE format('SELECT ($1).%I', TG_ARGV[0]) INTO v_id_record USING NEW;
        v_data_baru := row_to_json(NEW)::TEXT;
        INSERT INTO log.aktivitas_data (nm_schema, nm_tabel, id_record, operasi, data_lama, data_baru, kolom_berubah, id_pengguna, ip_address)
        VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, v_id_record, 'INSERT', NULL, v_data_baru, NULL, v_id_pengguna, v_ip_address);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        EXECUTE format('SELECT ($1).%I', TG_ARGV[0]) INTO v_id_record USING NEW;
        v_data_lama := row_to_json(OLD)::TEXT;
        v_data_baru := row_to_json(NEW)::TEXT;
        INSERT INTO log.aktivitas_data (nm_schema, nm_tabel, id_record, operasi, data_lama, data_baru, kolom_berubah, id_pengguna, ip_address)
        VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, v_id_record, 'UPDATE', v_data_lama, v_data_baru, NULL, v_id_pengguna, v_ip_address);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        EXECUTE format('SELECT ($1).%I', TG_ARGV[0]) INTO v_id_record USING OLD;
        v_data_lama := row_to_json(OLD)::TEXT;
        INSERT INTO log.aktivitas_data (nm_schema, nm_tabel, id_record, operasi, data_lama, data_baru, kolom_berubah, id_pengguna, ip_address)
        VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, v_id_record, 'DELETE', v_data_lama, NULL, NULL, v_id_pengguna, v_ip_address);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
