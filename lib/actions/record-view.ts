"use server";

import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";

export async function recordView(slug: string) {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const user_agent = hdrs.get("user-agent") ?? null;

  await supabase.from("post_views").insert({ slug, ip, user_agent });
}
