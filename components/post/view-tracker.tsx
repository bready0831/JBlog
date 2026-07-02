"use client";

import { useEffect } from "react";
import { recordView } from "@/lib/actions/record-view";

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    recordView(slug);
  }, [slug]);

  return null;
}
