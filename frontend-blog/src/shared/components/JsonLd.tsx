// JsonLd — renders <script type="application/ld+json"> inline.
// Use in server components / page components untuk inject Schema.org structured data.
// Pass either a single object or array of objects (Google supports both).

import React from "react";

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

function pruneUndefined(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(pruneUndefined).filter((v) => v !== undefined);
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const pruned = pruneUndefined(v);
      if (pruned !== undefined) out[k] = pruned;
    }
    return out;
  }
  return value;
}

export function JsonLd({ data }: JsonLdProps) {
  const cleaned = pruneUndefined(data);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleaned) }}
    />
  );
}
