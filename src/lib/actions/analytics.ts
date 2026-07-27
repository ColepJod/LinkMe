"use server";

import type { LinkClickWithLink } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export async function getAnalytics() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [viewsResult, clicksResult, topLinksResult] = await Promise.all([
    supabase.from("profile_views").select("*").eq("user_id", user.id).order("viewed_at", { ascending: false }),
    supabase.from("link_clicks").select("*, links(title)").eq("user_id", user.id).order("clicked_at", { ascending: false }),
    supabase.from("link_clicks").select("link_id, links(title)").eq("user_id", user.id),
  ]);

  const views = viewsResult.data ?? [];
  const clicks = (clicksResult.data ?? []) as LinkClickWithLink[];
  const allClickLinkIds = (topLinksResult.data ?? []) as unknown as { link_id: string; links: { title: string } | null }[];

  const linkClickCounts: Record<string, { title: string; count: number }> = {};
  for (const c of allClickLinkIds) {
    const id = c.link_id;
    const title = c.links?.title ?? "Unknown";
    if (!linkClickCounts[id]) linkClickCounts[id] = { title, count: 0 };
    linkClickCounts[id].count++;
  }
  const topLinks = Object.entries(linkClickCounts)
    .map(([linkId, data]) => ({ linkId, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const viewsByDay: Record<string, number> = {};
  for (const v of views) {
    const day = new Date(v.viewed_at).toLocaleDateString();
    viewsByDay[day] = (viewsByDay[day] ?? 0) + 1;
  }

  const clicksByDay: Record<string, number> = {};
  for (const c of clicks) {
    const day = new Date(c.clicked_at).toLocaleDateString();
    clicksByDay[day] = (clicksByDay[day] ?? 0) + 1;
  }

  const referrers: Record<string, number> = {};
  for (const v of views) {
    const ref = v.referrer || "Direct";
    referrers[ref] = (referrers[ref] ?? 0) + 1;
  }

  const countries: Record<string, number> = {};
  for (const v of views) {
    if (v.country) countries[v.country] = (countries[v.country] ?? 0) + 1;
  }

  return {
    totalViews: views.length,
    totalClicks: clicks.length,
    viewsByDay: Object.entries(viewsByDay).map(([date, count]) => ({ date, count })),
    clicksByDay: Object.entries(clicksByDay).map(([date, count]) => ({ date, count })),
    referrers: Object.entries(referrers)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count),
    countries: Object.entries(countries)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count),
    topLinks: topLinks.map(({ linkId, title, count }) => ({ linkId, title, count })),
    recentViews: views.slice(0, 10),
    recentClicks: clicks.slice(0, 10),
  };
}
