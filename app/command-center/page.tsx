"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCycleInfo } from "@/lib/cycle";
import { LogAttackButton } from "@/components/LogAttackButton";

type Tab = "board" | "guide" | "meals" | "runes";

type BoardSettings = {
  anchor_date: string;
  reset_hour_utc: number;
};

type AttackLog = {
  member_id: string;
  day_number: number;
  damage_score?: number | string | null;
};
type Meal = {
  name: string;
  rarity: string;
  category: "Appetizer" | "Main dish" | "Dessert";
  effect: string;
  ingredients: string[];
  tags: ("raid" | "exploration")[];
};

const tabs: { id: Tab; label: string }[] = [
  { id: "board", label: "Command board" },
  { id: "guide", label: "Field guide" },
  { id: "meals", label: "Season meals" },
  { id: "runes", label: "Rune desk" },
];

const meals: Meal[] = [
  { name: "Egg Sandwich", rarity: "Common appetizer", category: "Appetizer", effect: "Exploration progress +1%", ingredients: ["Egg", "Wheat"], tags: ["exploration"] },
  { name: "Potato Salad", rarity: "Great appetizer", category: "Appetizer", effect: "Exploration progress +1%", ingredients: ["Potato", "Egg", "Meat", "Lettuce"], tags: ["exploration"] },
  { name: "Shrimp Dim Sum", rarity: "Great appetizer", category: "Appetizer", effect: "Exploration progress +1%", ingredients: ["Shrimp", "Meat", "Wheat"], tags: ["exploration"] },
  { name: "Cheese Omelet", rarity: "Rare appetizer", category: "Appetizer", effect: "Exploration progress +2%", ingredients: ["Cheese", "Egg", "Egg", "Milk"], tags: ["exploration"] },
  { name: "Basil Pesto Baguette", rarity: "Legendary appetizer", category: "Appetizer", effect: "Exploration progress +3%", ingredients: ["Basil", "Cheese", "Wheat"], tags: ["exploration"] },
  { name: "Pork Loin Katsu", rarity: "Common main dish", category: "Main dish", effect: "Guild member ATK/HP +5%", ingredients: ["Egg", "Meat", "Wheat"], tags: ["raid"] },
  { name: "Shrimp Burger", rarity: "Great main dish", category: "Main dish", effect: "Guild member ATK/HP +10%", ingredients: ["Shrimp", "Wheat", "Lettuce"], tags: ["raid"] },
  { name: "Eggs in Hell", rarity: "Epic main dish", category: "Main dish", effect: "Guild member ATK/HP +20%", ingredients: ["Chili", "Cheese", "Tomato", "Egg", "Meat"], tags: ["raid"] },
  { name: "Basil Pasta", rarity: "Legendary main dish", category: "Main dish", effect: "Guild member ATK/HP +20%", ingredients: ["Basil", "Cheese", "Egg", "Wheat"], tags: ["raid"] },
  { name: "Fish & Chips", rarity: "Legendary main dish", category: "Main dish", effect: "Guild member ATK/HP +20%", ingredients: ["Tuna", "Tuna", "Potato", "Potato", "Wheat"], tags: ["raid"] },
  { name: "Truffle Gnocchi", rarity: "Immortal main dish", category: "Main dish", effect: "Guild member ATK/HP +30%", ingredients: ["Truffle", "Potato", "Wheat", "Milk"], tags: ["raid"] },
  { name: "Strawberry Cake", rarity: "Great dessert", category: "Dessert", effect: "Wyvern damage +10%", ingredients: ["Strawberry", "Egg", "Wheat", "Wheat", "Milk"], tags: ["raid"] },
  { name: "Brownie", rarity: "Epic dessert", category: "Dessert", effect: "Wyvern damage +30%", ingredients: ["Cacao", "Egg", "Wheat", "Wheat", "Milk"], tags: ["raid"] },
  { name: "Cheesecake", rarity: "Rare dessert", category: "Dessert", effect: "Wyvern damage +20%", ingredients: ["Cheese", "Egg", "Wheat", "Wheat", "Milk"], tags: ["raid"] },
  { name: "Honey Frozen Yogurt", rarity: "Immortal dessert", category: "Dessert", effect: "Wyvern damage +50%", ingredients: ["Honeycomb", "Milk", "Milk", "Milk"], tags: ["raid"] },
  { name: "Cereal", rarity: "Great appetizer", category: "Appetizer", effect: "Exploration progress +1%", ingredients: ["Corn", "Milk"], tags: ["exploration"] },
  { name: "Beef Porridge", rarity: "Great appetizer", category: "Appetizer", effect: "Exploration progress +1%", ingredients: ["Rice", "Rice", "Meat"], tags: ["exploration"] },
  { name: "Ham & Cheese Sandwich", rarity: "Epic appetizer", category: "Appetizer", effect: "Exploration progress +3%", ingredients: ["Cheese", "Strawberry", "Meat", "Wheat", "Lettuce"], tags: ["exploration"] },
  { name: "Kimchi", rarity: "Epic appetizer", category: "Appetizer", effect: "Exploration progress +3%", ingredients: ["Chili", "Lettuce", "Lettuce"], tags: ["exploration"] },
  { name: "Bacon Cheese Nachos", rarity: "Epic appetizer", category: "Appetizer", effect: "Exploration progress +3%", ingredients: ["Cheese", "Corn", "Meat"], tags: ["exploration"] },
  { name: "English Breakfast", rarity: "Common appetizer", category: "Appetizer", effect: "Exploration progress +1%", ingredients: ["Egg", "Meat", "Wheat", "Milk", "Lettuce"], tags: ["exploration"] },
  { name: "Ellie's Salad", rarity: "Common appetizer", category: "Appetizer", effect: "Exploration progress +1%", ingredients: ["Lettuce", "Lettuce", "Lettuce", "Lettuce", "Lettuce"], tags: ["exploration"] },
  { name: "French Fries", rarity: "Great appetizer", category: "Appetizer", effect: "Exploration progress +1%", ingredients: ["Potato", "Potato", "Wheat"], tags: ["exploration"] },
  { name: "Cheese Sticks", rarity: "Rare appetizer", category: "Appetizer", effect: "Exploration progress +2%", ingredients: ["Cheese", "Wheat"], tags: ["exploration"] },
  { name: "Caviar Cream Soup", rarity: "Immortal appetizer", category: "Appetizer", effect: "Exploration progress +5%", ingredients: ["Caviar", "Wheat", "Milk"], tags: ["exploration"] },
  { name: "Sukiyaki", rarity: "Common main dish", category: "Main dish", effect: "Guild member ATK/HP +5%", ingredients: ["Egg", "Meat", "Lettuce"], tags: ["raid"] },
  { name: "Omurice", rarity: "Great main dish", category: "Main dish", effect: "Guild member ATK/HP +10%", ingredients: ["Rice", "Egg", "Meat"], tags: ["raid"] },
  { name: "Margherita", rarity: "Legendary main dish", category: "Main dish", effect: "Guild member ATK/HP +20%", ingredients: ["Basil", "Cheese", "Tomato", "Wheat"], tags: ["raid"] },
  { name: "Tuna Sushi", rarity: "Legendary main dish", category: "Main dish", effect: "Guild member ATK/HP +20%", ingredients: ["Tuna", "Rice", "Rice"], tags: ["raid"] },
  { name: "Zeke's BBQ", rarity: "Common main dish", category: "Main dish", effect: "Guild member ATK/HP +5%", ingredients: ["Meat", "Meat", "Meat", "Meat", "Meat"], tags: ["raid"] },
  { name: "Cheeseburger", rarity: "Rare main dish", category: "Main dish", effect: "Guild member ATK/HP +10%", ingredients: ["Cheese", "Meat", "Wheat"], tags: ["raid"] },
  { name: "Miho's Spicy Ramen", rarity: "Epic main dish", category: "Main dish", effect: "Guild member ATK/HP +20%", ingredients: ["Chili", "Chili", "Egg", "Meat", "Wheat"], tags: ["raid"] },
  { name: "Yangnyeom Chicken", rarity: "Legendary main dish", category: "Main dish", effect: "Guild member ATK/HP +20%", ingredients: ["Chili", "Sugarcane", "Meat", "Wheat"], tags: ["raid"] },
];

const ingredientDefaults = [
  ["Wheat", "Exploration material", true], ["Meat", "Exploration material", true], ["Lettuce", "Exploration material", true],
  ["Milk", "Exploration material", true], ["Egg", "Exploration material", true], ["Potato", "Exploration material", false],
  ["Tomato", "Exploration material", false], ["Shrimp", "Exploration material", false], ["Rice", "Exploration material", false],
  ["Peanut", "Exploration material", false], ["Corn", "Exploration material", false], ["Strawberry", "Exploration material", false],
  ["Sugarcane", "Exploration material", false], ["Cheese", "Exploration material", false], ["Chili", "Lava Mountains", false],
  ["Tuna", "Ice Vale", false], ["Basil", "Wind Cliff", false], ["Cacao", "Wasteland Plateau", false],
  ["Caviar", "All regions", false], ["Truffle", "All regions", false], ["Honeycomb", "All regions", false],
] as const;

const guideSections = [
  ["The six-day cycle", "OPERATING RHYTHM", "Monday is matchmaking. Tuesday through Thursday are exploration days: spend all three entries each day, search for traces, and stock materials. Friday through Sunday is the raid window."],
  ["Trace discovery", "EXPLORATION", "A trace reveals which elemental wyvern the guild will face. Exploration progress and careful use of all three daily entries improve the odds. Cooking does not change exploration battles; it turns earned materials into raid-phase buffs."],
  ["Four elemental wyverns", "RAID INTEL", "The raid can reveal wind, fire, earth, or water. Match your elemental damage options to the trace so the team gets more from every attempt."],
  ["Guild-pet ultimate timing", "TEAM PLAY", "Hold the guild-pet ultimate for the team damage buff window. Call it before the highest-damage member commits their attack, not on the first available cooldown."],
];

const runeRows = [
  ["Immortal", "Game Changer", "emblems", "50% bonus Emblem on the last day. The strongest late-season pickup."],
  ["Mythic", "Ancient Book", "emblems", "+10% raid Emblem. Roughly 8–12k Emblem across a run."],
  ["S", "Random Immortal Rune", "emblems", "Early tier-up option, estimated around 3.5k Emblem from known Immortal runes."],
  ["A", "Golden Compass", "exploration", "+10% Exploration Emblem per day; stronger when it helps win exploration regions."],
  ["A", "Bubbling Hot Pot Kit", "resources", "+30% resources. More useful early and with exploration-region wins."],
  ["A", "Opal", "emblems", "2,000 Emblem. A clean pickup when higher tiers are unavailable."],
  ["B", "Let's Go Together, Buddy!", "team", "Gain 1 Onigiri for raid phase when you have the lowest exploration points."],
  ["B", "Persistent Search", "exploration", "+50% chance of finding a Wyvern trace."],
  ["B", "Chocolate Energy Bar", "exploration", "1x bonus exploration. More valuable on earlier days."],
  ["C", "Harvest Complete!", "resources", "300–800 Wheat. Better on earlier days when cooking materials compound."],
  ["D", "Awaken Time Freeze", "combat", "Increases Ark skill folds by 3x; situational and difficult to justify."],
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow mb-2">{children}</p>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`pixel-border bg-dv-panel/95 shadow-pixel ${className}`}>{children}</section>;
}

function Board() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<BoardSettings>({ anchor_date: "2026-01-05", reset_hour_utc: 0 });
  const [loggedDays, setLoggedDays] = useState<number[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [todayLogged, setTodayLogged] = useState(0);
  const [totalDamage, setTotalDamage] = useState(0);
  const [fullCycles, setFullCycles] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const { dayNumber, cycleStartISO } = getCycleInfo(settings.anchor_date, settings.reset_hour_utc);
  const dayIndex = Math.min(5, Math.max(0, dayNumber - 1));
  const cycleDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const phases = ["Match", "Explore", "Explore", "Raid", "Raid", "Raid"];

  function notify(message: string, duration = 2500) {
    setToast(message);
    window.setTimeout(() => setToast(null), duration);
  }

  async function loadBoard() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/");
      return;
    }

    const { data: settingsRow } = await supabase.from("app_settings").select("anchor_date, reset_hour_utc").eq("id", 1).single();
    const currentSettings: BoardSettings = {
      anchor_date: settingsRow?.anchor_date ?? "2026-01-05",
      reset_hour_utc: settingsRow?.reset_hour_utc ?? 0,
    };
    setSettings(currentSettings);
    const cycle = getCycleInfo(currentSettings.anchor_date, currentSettings.reset_hour_utc);

    const { data: members } = await supabase.from("members").select("id, auth_user_id");
    const advancedLogs = await supabase.from("attack_logs").select("member_id, day_number, damage_score").eq("cycle_start", cycle.cycleStartISO);
    let logs: AttackLog[] = advancedLogs.data as AttackLog[] | null ?? [];
    if (advancedLogs.error) {
      const legacyLogs = await supabase.from("attack_logs").select("member_id, day_number").eq("cycle_start", cycle.cycleStartISO);
      logs = (legacyLogs.data ?? []) as AttackLog[];
    }

    const myMember = (members ?? []).find((member: any) => member.auth_user_id === user.id);
    if (!myMember) {
      setLoading(false);
      notify("Member profile not found", 3000);
      return;
    }

    setMemberCount(members?.length ?? 0);
    setLoggedDays(logs.filter((log) => log.member_id === myMember.id).map((log) => log.day_number));
    setTodayLogged(logs.filter((log) => log.day_number === cycle.dayNumber).length);
    setTotalDamage(logs.reduce((sum, log) => sum + (Number(log.damage_score) || 0), 0));

    const logsByMember = new Map<string, number>();
    logs.forEach((log) => logsByMember.set(log.member_id, (logsByMember.get(log.member_id) ?? 0) + 1));
    setFullCycles(Array.from(logsByMember.values()).filter((count) => count >= 6).length);
    setLoading(false);
  }

  useEffect(() => {
    void loadBoard();
  }, []);

  async function logAttack(day: number, promotionTier: number | null, damageScore: number | null) {
    try {
      const res = await fetch("/api/log-attack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayNumber: day, promotionTier, damageScore }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Could not log attack");
      notify("D" + day + " attack logged ⚔️");
      await loadBoard();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not log attack", 3000);
    }
  }

  if (loading) return <main className="min-h-screen flex items-center justify-center"><p className="text-[11px] text-dv-brassLight animate-blink">LOADING GUILD DATA...</p></main>;

  return <div className="space-y-4">
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-dv-line px-4 py-3"><div><SectionLabel>CURRENT SEASON CLOCK</SectionLabel><p className="text-[11px]">CYCLE START {cycleStartISO} <span className="text-slate-300/50">/ DAY {dayNumber} OF 6</span></p></div><span className="status-chip">{cycleDays[dayIndex]} / LIVE</span></div>
      <div className="grid grid-cols-6 gap-px bg-dv-line">
        {[1, 2, 3, 4, 5, 6].map((day) => <div key={day} className={"bg-dv-panel px-1 py-3 text-center " + (day === dayNumber ? "bg-dv-violet/15" : "")}><p className={"text-[9px] " + (day < dayNumber ? "text-dv-emerald" : day === dayNumber ? "text-dv-brassLight" : "text-slate-300/55")}>D{day}</p><div className={"mx-auto my-2 h-2 w-2 " + (day < dayNumber ? "bg-dv-emerald" : day === dayNumber ? "bg-dv-brass" : "border border-dv-line")} /><p className="text-[9px] text-slate-300/60">{phases[day - 1]}</p></div>)}
      </div>
      <p className="border-t border-dv-line px-4 py-2 text-[9px] text-slate-300/60">◆ {dayNumber < 4 ? "Exploration is active; use all three entries before raid prep." : "Raid window is live; keep every attack on the shared ledger."}</p>
    </Card>

    <div className="grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
      <div>
        <Card className="mb-4 p-4"><SectionLabel>YOUR RAID LEDGER</SectionLabel><h2 className="text-lg text-dv-brassLight">Live Supabase attack log</h2><p className="mt-1 text-xs text-slate-200/65">Your entry is shared with the guild and stays tied to the current six-day cycle.</p></Card>
        <LogAttackButton anchorDate={settings.anchor_date} resetHour={settings.reset_hour_utc} dayNumber={dayNumber} loggedDays={loggedDays} onLog={logAttack} />
      </div>
      <Card className="relative overflow-hidden p-4"><p className="eyebrow">FIELD NOTE / DAY {dayNumber}</p><h2 className="mt-1 max-w-[230px] text-xl text-dv-brassLight">Trace hunt is still open.</h2><p className="mt-3 max-w-[290px] text-xs leading-relaxed text-slate-200/65">Use all three exploration entries today. The trace decides which wyvern the raid team can prepare for.</p><p className="mt-5 text-[10px] uppercase text-dv-violet">◆ {dayNumber < 3 ? "3 entries available" : "Trace intel available"}</p></Card>
    </div>

    <Card className="p-4"><div className="mb-4 flex items-end justify-between"><div><SectionLabel>GUILD READOUT</SectionLabel><h2 className="text-lg text-dv-brassLight">Keep the line moving.</h2></div><span className="status-chip">{Math.max(memberCount - todayLogged, 0)} pending</span></div><div className="grid grid-cols-3 gap-2"><div className="item-slot p-3"><p className="eyebrow">TODAY</p><p className="mt-1 text-xl text-dv-emerald">{todayLogged}<span className="text-xs text-slate-300/50">/{memberCount}</span></p></div><div className="item-slot p-3"><p className="eyebrow">POINTS</p><p className="mt-1 text-xl text-dv-brassLight">{totalDamage ? totalDamage.toLocaleString() : "—"}</p></div><div className="item-slot p-3"><p className="eyebrow">FULL CYCLES</p><p className="mt-1 text-xl text-dv-brassLight">{fullCycles}</p></div></div></Card>
    {toast && <div role="status" className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 pixel-frame bg-dv-brass px-4 py-3 text-[10px] text-dv-bg shadow-pixel animate-rise">{toast}</div>}
  </div>;
}

function Guide() {
  const [open, setOpen] = useState<string[]>([guideSections[0][0], guideSections[1][0]]);
  return <div className="space-y-4"><div className="border-l-2 border-dv-violet bg-dv-violet/10 px-4 py-4"><SectionLabel>FIELD MANUAL / SEASON 5</SectionLabel><h2 className="font-pixel text-xl leading-snug text-dv-brassLight">Read the room.<br />Then hit the dragon.</h2><p className="mt-3 max-w-xl text-sm text-slate-200/65">The short version of Dragon Valley operations for the player who has two minutes before the next session.</p></div><Card><div className="border-b border-dv-line px-4 py-4"><SectionLabel>OPERATIONS INDEX</SectionLabel><p className="text-sm">Open a briefing to get the useful part.</p></div><div className="divide-y divide-dv-line">{guideSections.map(([title, kicker, body], index) => { const isOpen = open.includes(title); return <div key={title}><button type="button" onClick={() => setOpen((current) => isOpen ? current.filter((item) => item !== title) : [...current, title])} className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-dv-panel2"><span className={`font-pixel text-[10px] ${isOpen ? "text-dv-brassLight" : "text-slate-300/50"}`}>0{index + 1}</span><span className="flex-1"><span className="eyebrow block">{kicker}</span><span className="mt-1 block text-sm text-dv-brassLight">{title}</span></span><span className="text-dv-violet">{isOpen ? "−" : "+"}</span></button>{isOpen && <p className="animate-rise px-4 pb-5 pl-14 text-xs leading-relaxed text-slate-200/65">{body}</p>}</div>; })}</div></Card></div>;
}

function Meals() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "raid" | "exploration">("all");
  const [owned, setOwned] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("dv-command-ingredients") ?? "{}"); } catch { return {}; }
  });
  useEffect(() => { localStorage.setItem("dv-command-ingredients", JSON.stringify(owned)); }, [owned]);
  const ingredients = ingredientDefaults.map(([name, source, defaultOwned]) => ({ name, source, owned: owned[name] ?? defaultOwned }));
  const visible = useMemo(() => meals.filter((meal) => `${meal.name} ${meal.effect} ${meal.ingredients.join(" ")}`.toLowerCase().includes(query.toLowerCase()) && (filter === "all" || meal.tags.includes(filter))), [filter, query]);
  return <div className="space-y-4"><div className="border border-dv-emerald/35 bg-dv-emerald/10 p-4"><SectionLabel>PROVISIONS / SEASON 5</SectionLabel><h2 className="text-xl text-dv-brassLight">Cook for the window.</h2><p className="mt-2 max-w-xl text-sm text-slate-200/65">Recipes and effects are taken from the Season 5 meal sheet. Toggle your stores to find what you can make now.</p></div><div className="grid gap-4 lg:grid-cols-[1fr_280px]"><Card><div className="border-b border-dv-line p-4"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search meals, effects, ingredients" className="w-full border border-dv-line bg-dv-panel2 px-3 py-3 text-xs text-dv-brassLight outline-none placeholder:text-slate-300/50 focus:border-dv-violet" /><div className="mt-3 flex flex-wrap gap-2">{(["all", "raid", "exploration"] as const).map((item) => <button type="button" key={item} onClick={() => setFilter(item)} className={`border px-3 py-2 text-[9px] uppercase ${filter === item ? "border-dv-violet bg-dv-violet/15 text-dv-brassLight" : "border-dv-line bg-dv-panel2 text-slate-300/60"}`}>{item === "all" ? "All meals" : item}</button>)}</div></div><div className="divide-y divide-dv-line">{visible.map((meal) => { const ready = meal.ingredients.every((item) => ingredients.find((ingredient) => ingredient.name === item)?.owned); return <article key={meal.name} className="p-4"><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm text-dv-brassLight">{meal.name}</h3><span className="status-chip">{meal.rarity}</span></div><p className="mt-2 text-xs text-dv-emerald">{meal.effect}</p></div><span className={`text-[9px] uppercase ${ready ? "text-dv-emerald" : "text-slate-300/50"}`}>{ready ? "Ready" : "Missing"}</span></div><div className="mt-4 flex flex-wrap gap-1.5">{meal.ingredients.map((item, index) => <span key={`${item}-${index}`} className="border border-dv-line bg-dv-panel2 px-2 py-1 text-[9px] text-slate-300/65">{item}</span>)}</div></article>; })}</div></Card><Card className="h-fit p-4"><div className="mb-4 flex items-center justify-between"><div><SectionLabel>YOUR STORES</SectionLabel><p className="text-sm text-dv-brassLight">Ingredient ownership</p></div><span className="text-[10px] text-dv-emerald">{ingredients.filter((item) => item.owned).length}/{ingredients.length}</span></div><div>{ingredients.map((ingredient) => <button type="button" key={ingredient.name} onClick={() => setOwned((current) => ({ ...current, [ingredient.name]: !ingredient.owned }))} className="flex w-full items-center gap-3 border-b border-dv-line/60 py-2.5 text-left last:border-0"><span className={`grid h-5 w-5 place-items-center border text-[11px] ${ingredient.owned ? "border-dv-emerald bg-dv-emerald text-dv-bg" : "border-dv-line text-transparent"}`}>◆</span><span><span className="block text-xs">{ingredient.name}</span><span className="block text-[8px] text-slate-300/50">{ingredient.source}</span></span></button>)}</div></Card></div></div>;
}

function Runes() {
  const [filter, setFilter] = useState("all");
  const visible = runeRows.filter((row) => filter === "all" || row[2] === filter);
  return <div className="space-y-4"><Card className="p-4"><SectionLabel>RUNE DESK / PRIORITY ORDER</SectionLabel><h2 className="text-xl text-dv-brassLight">Spend fragments with a plan.</h2><p className="mt-2 max-w-xl text-sm text-slate-200/65">Priorities below follow the attached guild rune notes: season value first, then team needs and situational utility.</p></Card><Card><div className="flex flex-wrap items-center justify-between gap-3 border-b border-dv-line p-4"><div><SectionLabel>TIER LIST</SectionLabel><p className="text-sm text-dv-brassLight">Recommended by guild officers</p></div><div className="flex flex-wrap gap-1">{["all", "emblems", "exploration", "resources", "team", "combat"].map((item) => <button type="button" key={item} onClick={() => setFilter(item)} className={`px-2 py-1 text-[8px] uppercase ${filter === item ? "bg-dv-violet text-dv-bg" : "bg-dv-panel2 text-slate-300/60"}`}>{item}</button>)}</div></div><div className="divide-y divide-dv-line">{visible.map(([rank, name, type, note]) => <div key={name} className="grid grid-cols-[68px_1fr] gap-3 p-4 sm:grid-cols-[90px_1fr_auto]"><div className="grid h-9 place-items-center border border-dv-brass/50 bg-dv-brass/10 font-pixel text-[10px] text-dv-brassLight">{rank}</div><div><p className="text-sm text-dv-brassLight">{name}</p><p className="mt-1 text-xs leading-relaxed text-slate-200/65">{note}</p></div><span className="hidden self-center text-[9px] uppercase text-slate-300/50 sm:block">{type}</span></div>)}</div></Card></div>;
}

export default function CommandCenterPage() {
  const [activeTab, setActiveTab] = useState<Tab>("board");
  const content = activeTab === "board" ? <Board /> : activeTab === "guide" ? <Guide /> : activeTab === "meals" ? <Meals /> : <Runes />;
  return <div className="scanlines min-h-screen"><header className="sticky top-0 z-40 border-b border-dv-line bg-dv-bg/95 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3"><a href="/dashboard" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center border border-dv-brass bg-dv-brass font-pixel text-[11px] text-dv-bg shadow-pixel-sm">DV</span><span><span className="eyebrow block">DRAGON VALLEY // S5</span><span className="block text-sm text-dv-brassLight">COMMAND CENTER</span></span></a><span className="status-chip">LOCAL BOARD</span></div><div className="mx-auto max-w-6xl border-t border-dv-line/70 px-4 py-2 text-[9px] uppercase tracking-[.14em] text-slate-300/50"><span className="text-dv-emerald">{tabs.find((tab) => tab.id === activeTab)?.label}</span><span className="mx-2">/</span> field manual online</div></header><div className="mx-auto flex max-w-6xl gap-5 px-4 pb-20 pt-5 sm:px-6 md:pb-10 md:pt-7"><aside className="hidden w-52 shrink-0 md:block"><nav className="sticky top-32 space-y-1"><p className="eyebrow mb-3 px-3">OPERATIONS</p>{tabs.map((tab) => <button type="button" key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex w-full items-center gap-3 border px-3 py-3 text-left text-xs ${activeTab === tab.id ? "border-dv-violet/45 bg-dv-violet/10 text-dv-brassLight" : "border-transparent text-slate-300/60 hover:border-dv-line hover:bg-dv-panel2"}`}><span className="text-dv-violet">◆</span>{tab.label}</button>)}</nav></aside><main className="min-w-0 flex-1"><div className="mb-5 flex items-end justify-between gap-3"><div><p className="eyebrow text-dv-emerald">GUILD OPERATIONS / ONLINE</p><h1 className="mt-1 text-2xl text-dv-brassLight sm:text-3xl">{tabs.find((tab) => tab.id === activeTab)?.label}</h1></div><a href="/dashboard" className="hidden text-[9px] uppercase text-slate-300/50 hover:text-dv-brassLight sm:block">← Back to tracker</a></div>{content}</main></div><nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 border-t border-dv-line bg-dv-panel/95 px-2 py-2 md:hidden">{tabs.map((tab) => <button type="button" key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-1 text-[8px] uppercase ${activeTab === tab.id ? "text-dv-brassLight" : "text-slate-300/60"}`}><span className="mb-1 block text-dv-violet">◆</span>{tab.id === "meals" ? "Meals" : tab.id === "runes" ? "Runes" : tab.id}</button>)}</nav></div>;
}