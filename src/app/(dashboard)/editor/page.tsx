"use client";

import { useState, useEffect, useRef } from "react";
import { getLinks, createLink, updateLink, deleteLink } from "@/lib/actions/links";
import { getSocialLinks, upsertSocialLink, deleteSocialLink } from "@/lib/actions/social";
import { getProfile, updateProfile, uploadAvatar, uploadSupportQr, removeSupportQr } from "@/lib/actions/profile";
import { SOCIAL_PLATFORMS } from "@/lib/constants";
import type { Link, SocialLink, User } from "@/lib/types";
import { Loader2, Plus, Pencil, Trash2, GripVertical, EyeOff, Trash, QrCode } from "lucide-react";

export default function EditorPage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);

  async function loadData() {
    const [profileData, linksData, socialData] = await Promise.all([
      getProfile(),
      getLinks(),
      getSocialLinks(),
    ]);
    if (!mounted.current) return;
    setProfile(profileData);
    setLinks(linksData);
    setSocialLinks(socialData);
    setLoading(false);
  }

  useEffect(() => {
    mounted.current = true;
    loadData();
    return () => { mounted.current = false; };
  }, []);

  async function handleUpdateProfile(formData: FormData) {
    setSaving(true);
    setError(null);
    const result = await updateProfile(formData);
    if (result?.error) { setError(result.error); setSaving(false); return; }
    await loadData();
    setSaving(false);
  }

  async function handleUploadAvatar(formData: FormData) {
    setSaving(true);
    setError(null);
    const result = await uploadAvatar(formData);
    if (result?.error) { setError(result.error); setSaving(false); return; }
    await loadData();
    setSaving(false);
  }

  async function handleUploadQr(formData: FormData) {
    setSaving(true);
    setError(null);
    const result = await uploadSupportQr(formData);
    if (result?.error) { setError(result.error); setSaving(false); return; }
    await loadData();
    setSaving(false);
  }

  async function handleRemoveQr() {
    setSaving(true);
    setError(null);
    const result = await removeSupportQr();
    if (result?.error) { setError(result.error); setSaving(false); return; }
    await loadData();
    setSaving(false);
  }

  async function handleCreateLink(formData: FormData) {
    setSaving(true);
    setError(null);
    const result = await createLink(formData);
    if (result?.error) { setError(result.error); setSaving(false); return; }
    await loadData();
    setSaving(false);
  }

  async function handleUpdateLink(id: string, formData: FormData) {
    setSaving(true);
    setError(null);
    const result = await updateLink(id, formData);
    if (result?.error) { setError(result.error); setSaving(false); return; }
    await loadData();
    setSaving(false);
  }

  async function handleDeleteLink(id: string) {
    setSaving(true);
    setError(null);
    const result = await deleteLink(id);
    if (result?.error) { setError(result.error); setSaving(false); return; }
    await loadData();
    setSaving(false);
  }

  async function handleUpsertSocial(formData: FormData) {
    setSaving(true);
    setError(null);
    const result = await upsertSocialLink(formData);
    if (result?.error) { setError(result.error); setSaving(false); return; }
    await loadData();
    setSaving(false);
  }

  async function handleDeleteSocial(id: string) {
    setSaving(true);
    setError(null);
    const result = await deleteSocialLink(id);
    if (result?.error) { setError(result.error); setSaving(false); return; }
    await loadData();
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile Editor</h1>
        <p className="text-sm text-muted-foreground">Customize your public profile and manage your links</p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Profile</h2>
        <form action={handleUpdateProfile} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="display_name" className="text-sm font-medium text-foreground">Display Name</label>
            <input id="display_name" name="display_name" type="text" required defaultValue={profile?.display_name ?? ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium text-foreground">Bio</label>
            <textarea id="bio" name="bio" rows={3} defaultValue={profile?.bio ?? ""} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-2">
            <label htmlFor="avatar_url" className="text-sm font-medium text-foreground">Avatar URL</label>
            <input id="avatar_url" name="avatar_url" type="url" defaultValue={profile?.avatar_url ?? ""} placeholder="https://..." className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button type="submit" disabled={saving} className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Profile"}</button>
        </form>
        <form action={handleUploadAvatar} className="mt-6 space-y-2 border-t border-border pt-4">
          <label className="text-sm font-medium text-foreground">Or upload an image</label>
          <div className="flex items-center gap-3">
            <input type="file" name="avatar" accept="image/*" required className="text-sm text-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-accent/80" />
            <button type="submit" disabled={saving} className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}</button>
          </div>
          {profile?.avatar_url && (
            <div className="flex items-center gap-3">
              <img src={profile.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
              <span className="truncate text-xs text-muted-foreground">{profile.avatar_url}</span>
            </div>
          )}
        </form>
      </section>

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-foreground"><QrCode className="h-5 w-5" /> Support Me</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Upload your UPI / payment app QR code so visitors can support you.
        </p>
        <form action={handleUploadQr} className="space-y-2">
          <div className="flex items-center gap-3">
            <input type="file" name="qr" accept="image/*" required className="text-sm text-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-accent/80" />
            <button type="submit" disabled={saving} className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload QR"}</button>
          </div>
          {profile?.support_qr_url && (
            <div className="flex items-center gap-4 rounded-md border border-border bg-accent/30 p-3">
              <img src={profile.support_qr_url} alt="Support QR code" className="h-24 w-24 rounded-md object-contain" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">QR code is live</p>
                <p className="text-xs text-muted-foreground">It will appear in a &quot;Support Me&quot; section on your public page.</p>
                <button
                  type="button"
                  onClick={handleRemoveQr}
                  disabled={saving}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-destructive hover:underline disabled:opacity-50"
                >
                  <Trash className="h-3.5 w-3.5" /> Remove QR code
                </button>
              </div>
            </div>
          )}
        </form>
      </section>

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Links</h2>
        </div>
        <div className="space-y-3">
          {links.map((link) => (
            <LinkEditor key={link.id} link={link} onUpdate={handleUpdateLink} onDelete={handleDeleteLink} />
          ))}
        </div>
        <details className="group mt-4">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <Plus className="h-4 w-4" /> Add Link
          </summary>
          <form action={handleCreateLink} className="mt-3 space-y-3 rounded-md border border-border bg-accent/30 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="title" className="text-xs font-medium text-foreground">Title</label>
                <input id="title" name="title" type="text" required placeholder="My Website" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="space-y-1">
                <label htmlFor="url" className="text-xs font-medium text-foreground">URL</label>
                <input id="url" name="url" type="url" required placeholder="https://..." className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="description" className="text-xs font-medium text-foreground">Description (optional)</label>
              <input id="description" name="description" type="text" placeholder="A short description" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <button type="submit" disabled={saving} className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Link"}</button>
          </form>
        </details>
      </section>

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Social Links</h2>
        </div>
        <div className="space-y-2">
          {socialLinks.map((social) => (
            <div key={social.id} className="flex items-center gap-3 rounded-md border border-border bg-accent/30 p-3">
              <span className="w-24 text-sm font-medium capitalize text-foreground">{social.platform}</span>
              <span className="flex-1 truncate text-sm text-muted-foreground">{social.url}</span>
              <form action={async (formData: FormData) => { await handleDeleteSocial(formData.get("id") as string); }}>
                <input type="hidden" name="id" value={social.id} />
                <button type="submit" className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </div>
          ))}
        </div>
        <details className="group mt-4">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <Plus className="h-4 w-4" /> Add Social Link
          </summary>
          <form action={handleUpsertSocial} className="mt-3 space-y-3 rounded-md border border-border bg-accent/30 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="platform" className="text-xs font-medium text-foreground">Platform</label>
                <select id="platform" name="platform" required className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select platform</option>
                  {SOCIAL_PLATFORMS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="surl" className="text-xs font-medium text-foreground">URL</label>
                <input id="surl" name="url" type="url" required placeholder="https://..." className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Social Link"}</button>
          </form>
        </details>
      </section>
    </div>
  );
}

function LinkEditor({ link, onUpdate, onDelete }: { link: Link; onUpdate: (id: string, data: FormData) => Promise<void>; onDelete: (id: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleUpdate(formData: FormData) {
    setSaving(true);
    await onUpdate(link.id, formData);
    setSaving(false);
    setEditing(false);
  }

  async function handleToggleActive() {
    const formData = new FormData();
    formData.set("title", link.title);
    formData.set("url", link.url);
    formData.set("description", link.description ?? "");
    formData.set("icon", link.icon ?? "");
    formData.set("is_active", String(!link.is_active));
    await onUpdate(link.id, formData);
  }

  return (
    <div className="rounded-md border border-border bg-accent/20 p-3">
      <div className="flex items-center gap-3">
        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium text-foreground ${!link.is_active && "line-through opacity-50"}`}>{link.title}</span>
            {!link.is_active && <EyeOff className="h-3 w-3 text-muted-foreground" />}
          </div>
          <p className="truncate text-xs text-muted-foreground">{link.url}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleToggleActive} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            <EyeOff className="h-4 w-4" />
          </button>
          <button onClick={() => setEditing(!editing)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            <Pencil className="h-4 w-4" />
          </button>
          <form action={async (formData: FormData) => { await onDelete(formData.get("id") as string); }}>
            <input type="hidden" name="id" value={link.id} />
            <button type="submit" className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
      {editing && (
        <form action={handleUpdate} className="mt-3 space-y-3 border-t border-border pt-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor={`title-${link.id}`} className="text-xs font-medium text-foreground">Title</label>
              <input id={`title-${link.id}`} name="title" type="text" required defaultValue={link.title} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-1">
              <label htmlFor={`url-${link.id}`} className="text-xs font-medium text-foreground">URL</label>
              <input id={`url-${link.id}`} name="url" type="url" required defaultValue={link.url} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor={`desc-${link.id}`} className="text-xs font-medium text-foreground">Description</label>
            <input id={`desc-${link.id}`} name="description" type="text" defaultValue={link.description ?? ""} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
