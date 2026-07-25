import type { Theme, SocialPlatform } from "./types";

export const APP_NAME = "LinkMe";
export const APP_DESCRIPTION = "Your digital identity, one link away.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const THEMES: { value: Theme; label: string; description: string }[] = [
  {
    value: "light",
    label: "Light",
    description: "Clean and minimal",
  },
  {
    value: "dark",
    label: "Dark",
    description: "Easy on the eyes",
  },
  {
    value: "gradient",
    label: "Gradient",
    description: "Vibrant and bold",
  },
  {
    value: "glass",
    label: "Glass",
    description: "Modern and sleek",
  },
];

export const SOCIAL_PLATFORMS: {
  value: SocialPlatform;
  label: string;
  placeholder: string;
}[] = [
  { value: "twitter", label: "Twitter / X", placeholder: "https://x.com/username" },
  { value: "instagram", label: "Instagram", placeholder: "https://instagram.com/username" },
  { value: "github", label: "GitHub", placeholder: "https://github.com/username" },
  { value: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
  { value: "youtube", label: "YouTube", placeholder: "https://youtube.com/@username" },
  { value: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@username" },
  { value: "discord", label: "Discord", placeholder: "discord.gg/invite" },
  { value: "threads", label: "Threads", placeholder: "https://threads.net/@username" },
  { value: "email", label: "Email", placeholder: "you@example.com" },
];
