import { NextRequest, NextResponse } from "next/server";
import { getGuildMember } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { getCycleInfo } from "@/lib/cycle";
import { RUNE_BY_NAME } from "@/lib/runes";
import { serverLog } from "@/lib/appLog";

const MAX_EXPLORATION_DAY = 3;

// GET: the caller's guild picks for this cycle, plus the caller's id.
export async function GET() {
  const auth = await getGuildMember();
  if (auth.error || !auth.member) return NextResponse.json({ error: auth.error }, { status: auth.error === "Not authenticated" ? 401 : 403 });
  const db = createAdminClient();
  const { data: me } = await db.from("members").select("id, guild_id").eq("id", auth.member.id).maybeSingle();
  if (!me || me.guild_id == null) return NextResponse.json({ error: "No guild" }, { status: 403 });
  const { cycleStartISO, dayNumber } = getCycleInfo();
  const { data: rows, error } = await db
    .from("rune_picks")
    .select("member_id, day_number, rune_name")
    .eq("guild_id", me.guild_id)
    .eq("cycle_start", cycleStartISO);
  if (error) return NextResponse.json({ error: "Load failed" }, { status: 500 });
  type Row = { member_id: string; day_number: number; rune_name: string };
  const list: Row[] = (rows ?? []) as Row[];
  const ids = Array.from(new Set(list.map((r) => r.member_id)));
  const { data: names } = ids.length
    ? await db.from("members").select("id, username").in("id", ids)
    : { data: [] as { id: string; username: string }[] };
  const nameOf = new Map<string, string>((names ?? []).map((n: { id: string; username: string }) => [n.id, n.username]));
  const picks = list.map((r) => ({ member_id: r.member_id, username: nameOf.get(r.member_id) ?? "?", day_number: r.day_number, rune_name: r.rune_name }));
  return NextResponse.json({ meId: me.id, today: dayNumber, cycleStart: cycleStartISO, picks });
}

// POST { day, rune }: save the caller's pick for a day. rune null clears it.
export async function POST(req: NextRequest) {
  const auth = await getGuildMember();
  if (auth.error || !auth.member) return NextResponse.json({ error: auth.error }, { status: auth.error === "Not authenticated" ? 401 : 403 });
  const body = await req.json().catch(() => null);
  const day = Number(body?.day);
  const rune = body?.rune === null || body?.rune === undefined ? null : typeof body.rune === "string" ? body.rune : "";
  if (!Number.isInteger(day) || day < 1 || day > MAX_EXPLORATION_DAY || rune === "") {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (rune !== null && !RUNE_BY_NAME.has(rune)) return NextResponse.json({ error: "Unknown rune" }, { status: 400 });

  const { cycleStartISO, dayNumber: today } = getCycleInfo();
  if (day > today) return NextResponse.json({ error: "That day hasn't started yet" }, { status: 400 });

  const db = createAdminClient();
  const { data: me } = await db.from("members").select("id, guild_id").eq("id", auth.member.id).maybeSingle();
  if (!me || me.guild_id == null) return NextResponse.json({ error: "No guild" }, { status: 403 });

  if (rune === null) {
    const { error } = await db.from("rune_picks").delete().eq("member_id", me.id).eq("cycle_start", cycleStartISO).eq("day_number", day);
    if (error) return NextResponse.json({ error: "Clear failed" }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Block duplicates within the guild for this day, with a readable message naming the taker.
  const { data: taken } = await db
    .from("rune_picks")
    .select("member_id")
    .eq("guild_id", me.guild_id)
    .eq("cycle_start", cycleStartISO)
    .eq("day_number", day)
    .eq("rune_name", rune)
    .neq("member_id", me.id)
    .maybeSingle();
  if (taken) {
    const { data: who } = await db.from("members").select("username").eq("id", taken.member_id).maybeSingle();
    return NextResponse.json({ error: `Already taken by ${who?.username ?? "a guild member"}` }, { status: 409 });
  }

  const { error } = await db.from("rune_picks").upsert(
    { member_id: me.id, guild_id: me.guild_id, cycle_start: cycleStartISO, day_number: day, rune_name: rune },
    { onConflict: "member_id,cycle_start,day_number" }
  );
  if (error) {
    // 23505 = unique violation on the guild rune index: someone claimed it a moment ago.
    if ((error as { code?: string }).code === "23505") return NextResponse.json({ error: "Just taken by a guild member" }, { status: 409 });
    await serverLog("error", "rune-picks", error.message, { day }, me.id);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
