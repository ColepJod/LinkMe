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

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("avatar") as File;
  if (!file) return { error: "No file provided" };
  if (!file.type.startsWith("image/")) return { error: "File must be an image" };
  if (file.size > 2 * 1024 * 1024) return { error: "File must be under 2MB" };

  const ext = file.name.split(".").pop() ?? "jpg";
  const filePath = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    if (uploadError.message.includes("bucket")) {
      return { error: "Storage bucket 'avatars' not found. Create it in Supabase Dashboard → Storage." };
    }
    return { error: uploadError.message };
  }

  const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) return { error: updateError.message };
  revalidatePath("/editor");
  revalidatePath(`/${user.user_metadata?.username}`);
  return { avatar_url: publicUrl, success: true };
}

export async function uploadSupportQr(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("qr") as File;
  if (!file) return { error: "No file provided" };
  if (!file.type.startsWith("image/")) return { error: "File must be an image" };
  if (file.size > 2 * 1024 * 1024) return { error: "File must be under 2MB" };

  const ext = file.name.split(".").pop() ?? "jpg";
  const filePath = `${user.id}/qrcodes/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    if (uploadError.message.includes("bucket")) {
      return { error: "Storage bucket 'avatars' not found. Create it in Supabase Dashboard → Storage." };
    }
    return { error: uploadError.message };
  }

  const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ support_qr_url: publicUrl })
    .eq("id", user.id);

  if (updateError) return { error: updateError.message };
  revalidatePath("/editor");
  revalidatePath(`/${user.user_metadata?.username}`);
  return { support_qr_url: publicUrl, success: true };
}

export async function removeSupportQr() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ support_qr_url: null })
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
