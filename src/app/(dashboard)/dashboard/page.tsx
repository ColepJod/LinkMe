import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDashboardStats, getProfile } from "@/lib/actions/profile";
import { redirect } from "next/navigation";
import type { LinkClickWithLink } from "@/lib/types";
import { Link2, Eye, MousePointerClick, Plus, ExternalLink, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile();
  const stats = await getDashboardStats();

  const cards = [
    { label: "Total Links", value: stats?.linkCount ?? 0, icon: Link2, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Profile Views", value: stats?.viewCount ?? 0, icon: Eye, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Link Clicks", value: stats?.clickCount ?? 0, icon: MousePointerClick, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, {profile?.display_name || user.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg ${card.bg} p-2.5`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{card.label}</p>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/editor" className="flex items-center justify-between rounded-md bg-accent/50 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent">
              <span className="flex items-center gap-2"><Plus className="h-4 w-4" /> Add New Link</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            {profile && (
              <Link href={`/${profile.username}`} target="_blank" className="flex items-center justify-between rounded-md bg-accent/50 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent">
                <span className="flex items-center gap-2"><ExternalLink className="h-4 w-4" /> View Public Profile</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Recent Link Clicks</h2>
          {stats?.recentClicks && stats.recentClicks.length > 0 ? (
            <div className="space-y-2">
              {stats.recentClicks.map((click: LinkClickWithLink) => (
                <div key={click.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{click.links?.title || "Unknown link"}</span>
                  <span className="text-xs text-muted-foreground">{new Date(click.clicked_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No clicks yet. Share your profile to get started!</p>
          )}
        </div>
      </div>
    </div>
  );
}
