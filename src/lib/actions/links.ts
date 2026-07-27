"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getLinks() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", user.id)
    .order("position");

  return data ?? [];
}

export async function createLink(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const title = formData.get("title") as string;
  const url = formData.get("url") as string;
  const description = formData.get("description") as string | null;
  const icon = formData.get("icon") as string | null;

  if (!title || !url) return { error: "Title and URL are required" };

  const { data: maxPos } = await supabase
    .from("links")
    .select("position")
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const position = (maxPos?.position ?? -1) + 1;

  const { error } = await supabase.from("links").insert({
    user_id: user.id,
    title,
    url,
    description: description || null,
    icon: icon || null,
    position,
  });

  if (error) return { error: error.message };
  revalidatePath("/editor");
  revalidatePath(`/${user.user_metadata?.username}`);
  return { success: true };
}

export async function updateLink(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const title = formData.get("title") as string;
  const url = formData.get("url") as string;
  const description = formData.get("description") as string | null;
  const icon = formData.get("icon") as string | null;
  const is_active = formData.get("is_active") === "true";

  if (!title || !url) return { error: "Title and URL are required" };

  const { error } = await supabase
    .from("links")
    .update({ title, url, description: description || null, icon: icon || null, is_active })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/editor");
  revalidatePath(`/${user.user_metadata?.username}`);
  return { success: true };
}

export async function deleteLink(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("links")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/editor");
  revalidatePath(`/${user.user_metadata?.username}`);
  return { success: true };
}
