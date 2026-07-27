import type { LinkClickWithLink } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { getAnalytics } from "@/lib/actions/analytics";
import { redirect } from "next/navigation";
import { Eye, MousePointerClick, Globe, ExternalLink } from "lucide-react";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const data = await getAnalytics();
  if (!data) redirect("/login");

  const summaryCards = [
    { label: "Total Views", value: data.totalViews, icon: Eye, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Total Clicks", value: data.totalClicks, icon: MousePointerClick, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Referrers", value: data.referrers.length, icon: ExternalLink, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Countries", value: data.countries.length, icon: Globe, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  const maxViews = Math.max(...data.viewsByDay.map((d) => d.count), 1);
  const maxClicks = Math.max(...data.clicksByDay.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Track your page views and link clicks</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg ${card.bg} p-2.5`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground"><Eye className="h-4 w-4" /> Views by Day</h2>
          {data.viewsByDay.length > 0 ? (
            <div className="space-y-2">
              {data.viewsByDay.slice(-14).map((d) => (
                <div key={d.date} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-xs text-muted-foreground">{d.date}</span>
                  <div className="flex-1">
                    <div className="h-5 rounded bg-purple-500/20" style={{ width: `${(d.count / maxViews) * 100}%` }}>
                      <div className="h-full rounded bg-purple-500" style={{ width: `${(d.count / maxViews) * 100}%` }} />
                    </div>
                  </div>
                  <span className="w-8 text-right text-xs font-medium text-foreground">{d.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No views yet. Share your profile!</p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground"><MousePointerClick className="h-4 w-4" /> Clicks by Day</h2>
          {data.clicksByDay.length > 0 ? (
            <div className="space-y-2">
              {data.clicksByDay.slice(-14).map((d) => (
                <div key={d.date} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-xs text-muted-foreground">{d.date}</span>
                  <div className="flex-1">
                    <div className="h-5 rounded bg-emerald-500/20" style={{ width: `${(d.count / maxClicks) * 100}%` }}>
                      <div className="h-full rounded bg-emerald-500" style={{ width: `${(d.count / maxClicks) * 100}%` }} />
                    </div>
                  </div>
                  <span className="w-8 text-right text-xs font-medium text-foreground">{d.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No clicks yet. Share your profile!</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Top Links</h2>
          {data.topLinks.length > 0 ? (
            <div className="space-y-2">
              {data.topLinks.map((link, i) => (
                <div key={link.linkId} className="flex items-center justify-between text-sm">
                  <span className="flex-1 truncate text-foreground">{link.title}</span>
                  <span className="ml-2 text-xs font-medium text-muted-foreground">{link.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No clicks recorded</p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Top Referrers</h2>
          {data.referrers.length > 0 ? (
            <div className="space-y-2">
              {data.referrers.slice(0, 8).map((r) => (
                <div key={r.source} className="flex items-center justify-between text-sm">
                  <span className="flex-1 truncate text-foreground">{r.source}</span>
                  <span className="ml-2 text-xs font-medium text-muted-foreground">{r.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No referrer data</p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Countries</h2>
          {data.countries.length > 0 ? (
            <div className="space-y-2">
              {data.countries.slice(0, 8).map((c) => (
                <div key={c.country} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{c.country}</span>
                  <span className="text-xs font-medium text-muted-foreground">{c.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No location data</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Recent Activity</h2>
        <div className="space-y-3">
          {data.recentViews.length > 0 || data.recentClicks.length > 0 ? (
            <>
              {data.recentViews.slice(0, 5).map((v) => (
                <div key={v.id} className="flex items-center gap-3 text-sm">
                  <Eye className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-foreground">Profile view</span>
                  <span className="text-xs text-muted-foreground">{v.referrer || "Direct"}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{new Date(v.viewed_at).toLocaleString()}</span>
                </div>
              ))}
              {(data.recentClicks as LinkClickWithLink[]).slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center gap-3 text-sm">
                  <MousePointerClick className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-foreground">{c.links?.title || "Link"} clicked</span>
                  <span className="ml-auto text-xs text-muted-foreground">{new Date(c.clicked_at).toLocaleString()}</span>
                </div>
              ))}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No activity yet. Share your profile to start tracking!</p>
          )}
        </div>
      </div>
    </div>
  );
}
