"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

/**
 * Share buttons floating di bottom-right utk berita/artikel public.
 * Support: WhatsApp, Twitter/X, Facebook, Telegram, Copy Link, Native Share API.
 */
export default function ShareButtons({
  title,
  text,
  url,
}: {
  title: string;
  text?: string;
  url?: string;
}) {
  const [open, setOpen] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareText = `${title}${text ? " — " + text : ""}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link disalin ke clipboard");
      setOpen(false);
    } catch {
      toast.error("Gagal salin link");
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      handleCopy();
      return;
    }
    try {
      await navigator.share({ title, text: shareText, url: shareUrl });
      setOpen(false);
    } catch (e: any) {
      if (e?.name !== "AbortError") toast.error("Gagal share");
    }
  };

  const platforms = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: "logos:whatsapp-icon",
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
      color: "bg-emerald-500 hover:bg-emerald-600",
    },
    {
      key: "twitter",
      label: "X / Twitter",
      icon: "ri:twitter-x-fill",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      color: "bg-black hover:bg-gray-800",
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: "logos:facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      key: "telegram",
      label: "Telegram",
      icon: "logos:telegram",
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      color: "bg-sky-500 hover:bg-sky-600",
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: "logos:linkedin-icon",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: "bg-blue-700 hover:bg-blue-800",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-gray-200 animate-in slide-in-from-bottom-2 fade-in dark:bg-slate-800 dark:ring-slate-700">
          <div className="px-2 pb-1 text-xs font-semibold text-gray-500 dark:text-slate-400">
            Bagikan ke:
          </div>
          {platforms.map((p) => (
            <a
              key={p.key}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white ${p.color} transition-shadow shadow-md hover:shadow-lg`}
            >
              <Icon icon={p.icon} className="h-4 w-4" />
              {p.label}
            </a>
          ))}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            <Icon icon="heroicons:clipboard-document" className="h-4 w-4" />
            Salin Link
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          // Prioritize Native Share API (mobile), fallback ke menu
          if (typeof navigator !== "undefined" && (navigator as any).share && /Mobi|Android/i.test(navigator.userAgent)) {
            handleNativeShare();
          } else {
            setOpen((p) => !p);
          }
        }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg ring-4 ring-white transition-transform hover:scale-110 hover:shadow-xl dark:ring-slate-900"
        aria-label="Bagikan"
      >
        <Icon icon={open ? "heroicons:x-mark" : "heroicons:share"} className="h-5 w-5" />
      </button>
    </div>
  );
}
