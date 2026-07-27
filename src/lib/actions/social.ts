"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SocialPlatform } from "@/lib/types";

export async function getSocialLinks() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("social_links")
    .select("*")
    .eq("user_id", user.id)
    .order("position");

  return data ?? [];
}

export async function upsertSocialLink(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const id = formData.get("id") as string | null;
  const platform = formData.get("platform") as SocialPlatform;
  const url = formData.get("url") as string;

  if (!platform || !url) return { error: "Platform and URL are required" };

  if (id) {
    const { error } = await supabase
      .from("social_links")
      .update({ url })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { error: error.message };
  } else {
    const { data: maxPos } = await supabase
      .from("social_links")
      .select("position")
      .eq("user_id", user.id)
      .order("position", { ascending: false })
      .limit(1)
      .single();

    const position = (maxPos?.position ?? -1) + 1;

    const { error } = await supabase.from("social_links").insert({
      user_id: user.id,
      platform,
      url,
      position,
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/editor");
  revalidatePath(`/${user.user_metadata?.username}`);
  return { success: true };
}

export async function deleteSocialLink(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("social_links")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/editor");
  revalidatePath(`/${user.user_metadata?.username}`);
  return { success: true };
}
