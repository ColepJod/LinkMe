export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  theme: Theme;
  created_at: string;
  updated_at: string;
}

export type Theme =
  | "light"
  | "dark"
  | "gradient"
  | "glass";

export interface Link {
  id: string;
  user_id: string;
  title: string;
  url: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  is_active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface SocialLink {
  id: string;
  user_id: string;
  platform: SocialPlatform;
  url: string;
  position: number;
}

export type SocialPlatform =
  | "twitter"
  | "instagram"
  | "github"
  | "linkedin"
  | "youtube"
  | "tiktok"
  | "email"
  | "discord"
  | "threads";

export interface ProfileView {
  id: string;
  user_id: string;
  viewed_at: string;
  referrer: string | null;
  country: string | null;
}

export interface LinkClick {
  id: string;
  link_id: string;
  user_id: string;
  clicked_at: string;
  referrer: string | null;
}

export interface LinkClickWithLink extends LinkClick {
  links: { title: string } | null;
}
