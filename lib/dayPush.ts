import { sendPush, type PushSub } from "@/lib/webpush";

// Day-start (14:00 UTC) and last-call (13:00 UTC) reminders, sent to every subscribed member.
export async function sendDayPushes(admin: any, hour: number, dayNumber: number, cycleStartISO: string, loggedIds: Set<string>) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_SUBJECT) return { sent: 0, skipped: "no vapid keys" };
  const { data: subs } = await admin.from("push_subscriptions").select("endpoint, p256dh, auth, member_id");
  if (!subs?.length) return { sent: 0 };

  let targets: (PushSub & { member_id: string })[] = [];
  let message: (memberId: string) => { title: string; body: string; tag: string; url: string } | null = () => null;

  if (hour === 14) {
    if (dayNumber === 7) return { sent: 0 }; // standby day, nothing to remind
    let picked = new Set<string>();
    if (dayNumber <= 3) {
      const { data: picks } = await admin.from("rune_picks").select("member_id").eq("cycle_start", cycleStartISO).eq("day_number", dayNumber);
      picked = new Set((picks ?? []).map((p: { member_id: string }) => p.member_id));
    }
    targets = subs;
    message = (id) =>
      dayNumber <= 3
        ? { title: `Day ${dayNumber} is live`, body: picked.has(id) ? "Log your 3 attacks today." : "Pick today's rune and log your 3 attacks.", tag: "day-start", url: "/" }
        : { title: `Day ${dayNumber} is live`, body: "Raid phase. Log your attack today.", tag: "day-start", url: "/" };
  } else if (hour === 13) {
    targets = subs.filter((s: { member_id: string }) => !loggedIds.has(s.member_id));
    message = () => ({ title: "Last call", body: `Log your Day ${dayNumber} attack before reset.`, tag: "last-call", url: "/" });
  } else {
    return { sent: 0 };
  }

  const results = await Promise.all(
    targets.map(async (s) => {
      const msg = message(s.member_id);
      if (!msg) return "skip";
      const r = await sendPush(s, msg);
      if (r === "gone") await admin.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
      return r;
    })
  );
  return { sent: results.filter((r) => r === "ok").length, gone: results.filter((r) => r === "gone").length };
}
