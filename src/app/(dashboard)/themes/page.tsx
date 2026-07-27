"use client";

import { useState, useEffect, useRef } from "react";
import { getProfile, updateTheme } from "@/lib/actions/profile";
import { THEMES } from "@/lib/constants";
import type { Theme } from "@/lib/types";
import { Check, Loader2 } from "lucide-react";

const themePreviews: Record<Theme, { bg: string; card: string; text: string; muted: string; dot: string }> = {
  light: { bg: "bg-white", card: "bg-gray-50 border-gray-200", text: "text-gray-900", muted: "text-gray-500", dot: "bg-gray-900" },
  dark: { bg: "bg-gray-950", card: "bg-gray-900 border-gray-800", text: "text-gray-100", muted: "text-gray-400", dot: "bg-gray-100" },
  gradient: { bg: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400", card: "bg-white/10 border-white/20", text: "text-white", muted: "text-white/70", dot: "bg-white" },
  glass: { bg: "bg-gray-900", card: "bg-white/5 border-white/10", text: "text-gray-100", muted: "text-gray-400", dot: "bg-gray-100" },
};

export default function ThemesPage() {
  const [currentTheme, setCurrentTheme] = useState<Theme>("light");
  const [saving, setSaving] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    getProfile().then((profile) => {
      if (!mounted.current || !profile) return;
      setCurrentTheme(profile.theme);
      setUsername(profile.username);
    });
    return () => { mounted.current = false; };
  }, []);

  const [themeError, setThemeError] = useState<string | null>(null);

  async function handleSelectTheme(value: Theme) {
    setSaving(value);
    setThemeError(null);
    const formData = new FormData();
    formData.set("theme", value);
    const result = await updateTheme(formData);
    if (result?.error) {
      if (mounted.current) setThemeError(result.error);
      setSaving(null);
      return;
    }
    if (mounted.current) {
      setCurrentTheme(value);
      setSaving(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Themes</h1>
        <p className="text-sm text-muted-foreground">Choose a look for your public profile page</p>
      </div>

      {themeError && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{themeError}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {THEMES.map(({ value, label, description }) => {
          const preview = themePreviews[value];
          const isActive = currentTheme === value;
          const isLoading = saving === value;

          return (
            <button
              key={value}
              onClick={() => handleSelectTheme(value)}
              disabled={saving !== null}
              className={`relative w-full overflow-hidden rounded-xl border-2 p-5 text-left shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${
                isActive ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-foreground/20"
              }`}
            >
              {isLoading && (
                <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              )}
              {isActive && !isLoading && (
                <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              )}
              <div className={`mb-3 rounded-lg ${preview.bg} p-4 shadow-sm`}>
                <div className={`mx-auto mb-2 h-8 w-8 rounded-full ${preview.dot}`} />
                <div className={`mb-2 h-3 w-24 rounded ${preview.dot} opacity-60`} />
                <div className={`mb-2 h-2 w-full rounded ${preview.dot} opacity-30`} />
                <div className={`h-2 w-3/4 rounded ${preview.dot} opacity-30`} />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{label}</h3>
              <p className="text-xs text-muted-foreground">{description}</p>
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-foreground">Preview</h2>
        <p className="text-xs text-muted-foreground">
          Your selected theme will be applied to your public profile page at{username && (
            <span className="text-foreground"> /{username}</span>
          )}. Visitors will see your links and social icons styled with this theme.
        </p>
      </div>
    </div>
  );
}
