import type { Metadata } from "next";
import type { ElementType } from "react";
import type { Theme } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicProfile } from "@/lib/actions/profile";
import { Globe, Mail, MessageCircle, Music, Video, Briefcase, AtSign, ImageIcon } from "lucide-react";

const themeStyles: Record<Theme, { bg: string; card: string; text: string; muted: string }> = {
  light: { bg: "bg-white", card: "bg-gray-50 border-gray-200", text: "text-gray-900", muted: "text-gray-500" },
  dark: { bg: "bg-gray-950", card: "bg-gray-900 border-gray-800", text: "text-gray-100", muted: "text-gray-400" },
  gradient: { bg: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400", card: "bg-white/10 border-white/20 backdrop-blur-md", text: "text-white", muted: "text-white/70" },
  glass: { bg: "bg-gray-900", card: "bg-white/5 border-white/10 backdrop-blur-xl", text: "text-gray-100", muted: "text-gray-400" },
};

const hoverText: Record<Theme, string> = {
  light: "hover:text-gray-900",
  dark: "hover:text-gray-100",
  gradient: "hover:text-white",
  glass: "hover:text-gray-100",
};

const socialIcons: Record<string, ElementType> = {
  twitter: AtSign,
  github: Globe,
  email: Mail,
  discord: MessageCircle,
  youtube: Video,
  tiktok: Music,
  linkedin: Briefcase,
  threads: AtSign,
  instagram: ImageIcon,
};

function getDomain(url: string) {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const data = await getPublicProfile(username);
  if (!data) return {};
  return {
    title: `${data.profile.display_name} (@${data.profile.username}) — LinkMe`,
    description: data.profile.bio || `Check out ${data.profile.display_name}'s links`,
    openGraph: {
      title: `${data.profile.display_name} — LinkMe`,
      description: data.profile.bio || undefined,
      ...(data.profile.avatar_url && { images: [data.profile.avatar_url] }),
    },
  };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const data = await getPublicProfile(username);
  if (!data) notFound();

  const { profile, links, socialLinks } = data;
  const theme = themeStyles[profile.theme as Theme];

  return (
    <div className={`flex min-h-screen items-start justify-center ${theme.bg} px-4 py-16`}>
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-4">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.display_name} width={96} height={96} className="h-24 w-24 rounded-full object-cover ring-2 ring-white/20" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-3xl font-bold text-white ring-2 ring-white/20">
              {profile.display_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="text-center">
            <h1 className={`text-xl font-bold ${theme.text}`}>{profile.display_name}</h1>
            {profile.bio && <p className={`mt-1 text-sm ${theme.muted}`}>{profile.bio}</p>}
          </div>
        </div>

        <div className="space-y-3">
          {links.map((link) => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 rounded-xl border ${theme.card} px-4 py-3.5 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]`}>
              <div className={`shrink-0 rounded-lg ${link.image_url ? "" : "bg-white/10"} p-2`}>
                {link.image_url ? (
                  <Image src={link.image_url} alt="" width={32} height={32} className="h-8 w-8 rounded object-cover" />
                ) : link.icon ? (
                  <span className="text-lg">{link.icon}</span>
                ) : (
                  <Globe className={`h-4 w-4 ${theme.muted}`} />
                )}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className={`truncate text-sm font-medium ${theme.text}`}>{link.title}</p>
                <p className={`truncate text-xs ${theme.muted}`}>{link.description || getDomain(link.url)}</p>
              </div>
            </a>
          ))}
        </div>

        {socialLinks.length > 0 && (
          <div className="flex items-center justify-center gap-6 pt-2">
            {socialLinks.map((social) => {
              const Icon = socialIcons[social.platform] ?? Globe;
              return (
                <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className={`${theme.muted} ${hoverText[profile.theme as Theme]} transition-all hover:scale-110`} title={social.platform}>
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        )}

        <p className={`pt-4 text-center text-xs ${theme.muted}`}>
          <Link href="/" className="hover:underline">LinkMe</Link>
        </p>
      </div>
    </div>
  );
}
