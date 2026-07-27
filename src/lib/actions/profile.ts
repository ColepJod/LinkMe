"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const display_name = formData.get("display_name") as string;
  const bio = formData.get("bio") as string | null;
  const avatar_url = formData.get("avatar_url") as string | null;

  if (!display_name) return { error: "Display name is required" };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name, bio: bio || null, avatar_url: avatar_url || null })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/editor");
  revalidatePath(`/${user.user_metadata?.username}`);
  return { success: true };
}

export async function getDashboardStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { count: linkCount } = await supabase
    .from("links")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: viewCount } = await supabase
    .from("profile_views")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: clickCount } = await supabase
    .from("link_clicks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data: recentClicks } = await supabase
    .from("link_clicks")
    .select("*, links(title)")
    .eq("user_id", user.id)
    .order("clicked_at", { ascending: false })
    .limit(5);

  return {
    linkCount: linkCount ?? 0,
    viewCount: viewCount ?? 0,
    clickCount: clickCount ?? 0,
    recentClicks: recentClicks ?? [],
  };
}

export async function updateTheme(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const theme = formData.get("theme") as string;
  if (!["light", "dark", "gradient", "glass"].includes(theme)) {
    return { error: "Invalid theme" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ theme })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/themes");
  revalidatePath(`/${user.user_metadata?.username}`);
  return { success: true };
}

export async function getPublicProfile(username: string) {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profile) {
    return null;
  }

  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("position");

  const { data: socialLinks } = await supabase
    .from("social_links")
    .select("*")
    .eq("user_id", profile.id)
    .order("position");

  return {
    profile,
    links: links ?? [],
    socialLinks: socialLinks ?? [],
  };
}
