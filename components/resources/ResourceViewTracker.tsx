"use client";

import { useEffect } from "react";

export default function ResourceViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `pem-resource-view:${slug}`;
    if (window.sessionStorage.getItem(key)) return;

    window.sessionStorage.setItem(key, "1");
    void fetch(`/api/resources/${encodeURIComponent(slug)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "view" }),
      keepalive: true,
    });
  }, [slug]);

  return null;
}
