"use client";

import { useEffect, useMemo, useState } from "react";

type Meal = {
  name: string;
  rarity: string;
  category: "Appetizer" | "Main dish" | "Dessert";
  effect: string;
  ingredients: string[];
  tags: ("raid" | "exploration")[];
  image?: string;
};

const meals: Meal[] = [
  { name: "Egg Sandwich", rarity: "Common appetizer", category: "Appetizer", effect: "Exploration progress +1%", ingredients: ["Egg", "Wheat"], tags: ["exploration"], image: "egg-sandwich.jpg" },
  { name: "Potato Salad", rarity: "Great appetizer", category: "Appetizer", effect: "Exploration progress +1%", ingredients: ["Potato", "Egg", "Meat", "Lettuce"], tags: ["exploration"], image: "potato-salad.jpg" },
  { name: "Shrimp Dim Sum", rarity: "Great appetizer", category: "Appetizer", effect: "Exploration progress +1%", ingredients: ["Shrimp", "Meat", "Wheat"], tags: ["exploration"], image: "shrimp-dim-sum.jpg" },
  { name: "Cheese Omelet", rarity: "Rare appetizer", category: "Appetizer", effect: "Exploration progress +2%", ingredients: ["Cheese", "Egg", "Egg", "Milk"], tags: ["exploration"], image: "cheese-omelet.jpg" },
  { name: "Basil Pesto Baguette", rarity: "Legendary appetizer", category: "Appetizer", effect: "Exploration progress +3%", ingredients: ["Basil", "Cheese", "Wheat"], tags: ["exploration"], image: "basil-pesto-baguette.jpg" },
  { name: "Pork Loin Katsu", rarity: "Common main dish", category: "Main dish", effect: "Guild member ATK/HP +5%", ingredients: ["Egg", "Meat", "Wheat"], tags: ["raid"], image: "pork-loin-katsu.png" },
  { name: "Shrimp Burger", rarity: "Great main dish", category: "Main dish", effect: "Guild member ATK/HP +10%", ingredients: ["Shrimp", "Wheat", "Lettuce"], tags: ["raid"], image: "shrimp-burger.jpg" },
  { name: "Eggs in Hell", rarity: "Epic main dish", category: "Main dish", effect: "Guild member ATK/HP +20%", ingredients: ["Chili", "Cheese", "Tomato", "Egg", "Meat"], tags: ["raid"], image: "eggs-in-hell.jpg" },
  { name: "Basil Pasta", rarity: "Legendary main dish", category: "Main dish", effect: "Guild member ATK/HP +20%", ingredients: ["Basil", "Cheese", "Egg", "Wheat"], tags: ["raid"], image: "basil-pasta.jpg" },
  { name: "Fish & Chips", rarity: "Legendary main dish", category: "Main dish", effect: "Guild member ATK/HP +20%", ingredients: ["Tuna", "Tuna", "Potato", "Potato", "Wheat"], tags: ["raid"], image: "fish-and-chips.png" },
  { name: "Truffle Gnocchi", rarity: "Immortal main dish", category: "Main dish", effect: "Guild member ATK/HP +30%", ingredients: ["Truffle", "Potato", "Wheat", "Milk"], tags: ["raid"], image: "truffle-gnocchi.jpg" },
  { name: "Strawberry Cake", rarity: "Great dessert", category: "Dessert", effect: "Wyvern damage +10%", ingredients: ["Strawberry", "Egg", "Wheat", "Wheat", "Milk"], tags: ["raid"], image: "strawberry-cake.jpg" },
  { name: "Brownie", rarity: "Epic dessert", category: "Dessert", effect: "Wyvern damage +30%", ingredients: ["Cacao", "Egg", "Wheat", "Wheat", "Milk"], tags: ["raid"], image: "brownie.jpg" },
  { name: "Cheesecake", rarity: "Rare dessert", category: "Dessert", effect: "Wyvern damage +20%", ingredients: ["Cheese", "Egg", "Wheat", "Wheat", "Milk"], tags: ["raid"], image: "cheesecake.jpg" },
  { name: "Honey Frozen Yogurt", rarity: "Immortal dessert", category: "Dessert", effect: "Wyvern damage +50%", ingredients: ["Honeycomb", "Milk", "Milk", "Milk"], tags: ["raid"], image: "honey-frozen-yogurt.jpg" },
  { name: "Cereal", rarity: "Great appetizer", category: "Appetizer", effect: "Exploration progress +1%", ingredients: ["Corn", "Milk"], tags: ["exploration"], image: "cereal.jpg" },
  { name: "Beef Porridge", rarity: "Great appetizer", category: "Appetizer", effect: "Exploration progress +1%", ingredients: ["Rice", "Rice", "Meat"], tags: ["exploration"], image: "beef-porridge.jpg" },
  { name: "Ham & Cheese Sandwich", rarity: "Epic appetizer", category: "Appetizer", effect: "Exploration progress +3%", ingredients: ["Cheese", "Strawberry", "Meat", "Wheat", "Lettuce"], tags: ["exploration"], image: "ham-cheese-sandwich.jpg" },
  { name: "Kimchi", rarity: "Epic appetizer", category: "Appetizer", effect: "Exploration progress +3%", ingredients: ["Chili", "Lettuce", "Lettuce"], tags: ["exploration"], image: "kimchi.jpg" },
  { name: "Bacon Cheese Nachos", rarity: "Epic appetizer", category: "Appetizer", effect: "Exploration progress +3%", ingredients: ["Cheese", "Corn", "Meat"], tags: ["exploration"], image: "bacon-cheese-nachos.jpg" },
  { name: "English Breakfast", rarity: "Common appetizer", category: "Appetizer", effect: "Exploration progress +1%", ingredients: ["Egg", "Meat", "Wheat", "Milk", "Lettuce"], tags: ["exploration"], image: "english-breakfast.jpg" },
  { name: "Ellie's Salad", rarity: "Common appetizer", category: "Appetizer", effect: "Exploration progress +1%", ingredients: ["Lettuce", "Lettuce", "Lettuce", "Lettuce", "Lettuce"], tags: ["exploration"], image: "ellies-salad.jpg" },
  { name: "French Fries", rarity: "Great appetizer", category: "Appetizer", effect: "Exploration progress +1%", ingredients: ["Potato", "Potato", "Wheat"], tags: ["exploration"], image: "french-fries.jpg" },
  { name: "Cheese Sticks", rarity: "Rare appetizer", category: "Appetizer", effect: "Exploration progress +2%", ingredients: ["Cheese", "Wheat"], tags: ["exploration"], image: "cheese-sticks.jpg" },
  { name: "Caviar Cream Soup", rarity: "Immortal appetizer", category: "Appetizer", effect: "Exploration progress +5%", ingredients: ["Caviar", "Wheat", "Milk"], tags: ["exploration"], image: "caviar-cream-soup.jpg" },
  { name: "Sukiyaki", rarity: "Common main dish", category: "Main dish", effect: "Guild member ATK/HP +5%", ingredients: ["Egg", "Meat", "Lettuce"], tags: ["raid"], image: "sukiyaki.png" },
  { name: "Omurice", rarity: "Great main dish", category: "Main dish", effect: "Guild member ATK/HP +10%", ingredients: ["Rice", "Egg", "Meat"], tags: ["raid"], image: "omurice.jpg" },
  { name: "Margherita", rarity: "Legendary main dish", category: "Main dish", effect: "Guild member ATK/HP +20%", ingredients: ["Basil", "Cheese", "Tomato", "Wheat"], tags: ["raid"], image: "margherita.jpg" },
  { name: "Tuna Sushi", rarity: "Legendary main dish", category: "Main dish", effect: "Guild member ATK/HP +20%", ingredients: ["Tuna", "Rice", "Rice"], tags: ["raid"], image: "tuna-sushi.jpg" },
  { name: "Zeke's BBQ", rarity: "Common main dish", category: "Main dish", effect: "Guild member ATK/HP +5%", ingredients: ["Meat", "Meat", "Meat", "Meat", "Meat"], tags: ["raid"], image: "zekes-bbq.jpg" },
  { name: "Cheeseburger", rarity: "Rare main dish", category: "Main dish", effect: "Guild member ATK/HP +10%", ingredients: ["Cheese", "Meat", "Wheat"], tags: ["raid"], image: "cheeseburger.png" },
  { name: "Miho's Spicy Ramen", rarity: "Epic main dish", category: "Main dish", effect: "Guild member ATK/HP +20%", ingredients: ["Chili", "Chili", "Egg", "Meat", "Wheat"], tags: ["raid"], image: "mihos-spicy-ramen.png" },
  { name: "Yangnyeom Chicken", rarity: "Legendary main dish", category: "Main dish", effect: "Guild member ATK/HP +20%", ingredients: ["Chili", "Sugarcane", "Meat", "Wheat"], tags: ["raid"], image: "id-39.jpg" },
  { name: "Tomato Basil Ade", rarity: "Legendary dessert", category: "Dessert", effect: "Wyvern damage +30%", ingredients: ["Basil", "Tomato"], tags: ["raid"], image: "tomato-basil-ade.png" },
  { name: "???", rarity: "Legendary appetizer", category: "Appetizer", effect: "Exploration progress +3%", ingredients: [], tags: ["exploration"], image: "question-19.png" },
  { name: "???", rarity: "Immortal appetizer", category: "Appetizer", effect: "Exploration progress +5%", ingredients: ["Caviar", "Cheese", "Wheat"], tags: ["exploration"], image: "question-21.png" },
  { name: "???", rarity: "Immortal main dish", category: "Main dish", effect: "Guild member ATK/HP +30%", ingredients: [], tags: ["raid"], image: "question-40.png" },
  { name: "???", rarity: "Immortal main dish", category: "Main dish", effect: "Guild member ATK/HP +30%", ingredients: [], tags: ["raid"], image: "question-41.png" },
  { name: "???", rarity: "Great dessert", category: "Dessert", effect: "Wyvern damage +10%", ingredients: [], tags: ["raid"], image: "question-55.png" },
  { name: "???", rarity: "Great dessert", category: "Dessert", effect: "Wyvern damage +10%", ingredients: [], tags: ["raid"], image: "question-56.png" },
  { name: "???", rarity: "Mythic dessert", category: "Dessert", effect: "Wyvern damage", ingredients: [], tags: ["raid"], image: "question-62.png" },
];

const ingredientDefaults = [
  ["Wheat", "Exploration material", true, "wheat.jpg"], ["Meat", "Exploration material", true, "meat.jpeg"], ["Lettuce", "Exploration material", true, "lettuce.jpg"],
  ["Milk", "Exploration material", true, "milk.jpg"], ["Egg", "Exploration material", true, "egg.jpg"], ["Potato", "Exploration material", false, "potato.jpg"],
  ["Tomato", "Exploration material", false, "tomato.jpg"], ["Shrimp", "Exploration material", false, "shrimp.jpg"], ["Rice", "Exploration material", false, "rice.jpg"],
  ["Peanut", "Exploration material", false, "peanut.jpg"], ["Corn", "Exploration material", false, "corn.jpg"], ["Strawberry", "Exploration material", false, "strawberry.jpg"],
  ["Sugarcane", "Exploration material", false, "sugarcane.jpg"], ["Cheese", "Exploration material", false, "cheese.jpg"], ["Chili", "Lava Mountains", false, "chili.jpg"],
  ["Tuna", "Ice Vale", false, "tuna.jpg"], ["Basil", "Wind Cliff", false, "basil.jpg"], ["Cacao", "Wasteland Plateau", false, "cacao.jpg"],
  ["Caviar", "All regions", false, "caviar.jpg"], ["Truffle", "All regions", false, "truffle.jpg"], ["Honeycomb", "All regions", false, "honeycomb.jpg"],
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

function MealThumb({ image, name }: { image?: string; name: string }) {
  return (
    <div className="pixel-frame item-slot h-14 w-14 shrink-0 overflow-hidden">
      {image ? (
        <img src={"/meals/" + image} alt={name} className="h-full w-full object-cover" style={{ imageRendering: "pixelated" }} />
      ) : (
        <div className="grid h-full w-full place-items-center text-[10px] text-slate-300/40">?</div>
      )}
    </div>
  );
}

function IngredientIcon({ image, name }: { image: string; name: string }) {
  return (
    <div className="pixel-frame item-slot h-8 w-8 shrink-0 overflow-hidden">
      <img src={"/ingredients/" + image} alt={name} className="h-full w-full object-cover" style={{ imageRendering: "pixelated" }} />
    </div>
  );
}

export function Guide() {
  const [open, setOpen] = useState<string[]>([guideSections[0][0], guideSections[1][0]]);
  return <div className="space-y-4"><div className="border-l-2 border-dv-violet bg-dv-violet/10 px-4 py-4"><SectionLabel>FIELD MANUAL / SEASON 5</SectionLabel><h2 className="font-pixel text-xl leading-snug text-dv-brassLight">Read the room.<br />Then hit the dragon.</h2><p className="mt-3 max-w-xl text-sm text-slate-200/65">The short version of Dragon Valley operations for the player who has two minutes before the next session.</p></div><Card><div className="border-b border-dv-line px-4 py-4"><SectionLabel>OPERATIONS INDEX</SectionLabel><p className="text-sm">Open a briefing to get the useful part.</p></div><div className="divide-y divide-dv-line">{guideSections.map(([title, kicker, body], index) => { const isOpen = open.includes(title); return <div key={title}><button type="button" onClick={() => setOpen((current) => isOpen ? current.filter((item) => item !== title) : [...current, title])} className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-dv-panel2"><span className={`font-pixel text-[10px] ${isOpen ? "text-dv-brassLight" : "text-slate-300/50"}`}>0{index + 1}</span><span className="flex-1"><span className="eyebrow block">{kicker}</span><span className="mt-1 block text-sm text-dv-brassLight">{title}</span></span><span className="text-dv-violet">{isOpen ? "−" : "+"}</span></button>{isOpen && <p className="animate-rise px-4 pb-5 pl-14 text-xs leading-relaxed text-slate-200/65">{body}</p>}</div>; })}</div></Card></div>;
}

export function Meals() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "raid" | "exploration">("all");
  const [owned, setOwned] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("dv-command-ingredients") ?? "{}"); } catch { return {}; }
  });
  useEffect(() => { localStorage.setItem("dv-command-ingredients", JSON.stringify(owned)); }, [owned]);
  const ingredients = ingredientDefaults.map(([name, source, defaultOwned, image]) => ({ name, source, image, owned: owned[name] ?? defaultOwned }));
  const visible = useMemo(() => meals.map((meal, index) => ({ meal, index })).filter(({ meal }) => `${meal.name} ${meal.effect} ${meal.ingredients.join(" ")}`.toLowerCase().includes(query.toLowerCase()) && (filter === "all" || meal.tags.includes(filter))), [filter, query]);
  return <div className="space-y-4"><div className="border border-dv-emerald/35 bg-dv-emerald/10 p-4"><SectionLabel>PROVISIONS / SEASON 5</SectionLabel><h2 className="text-xl text-dv-brassLight">Cook for the window.</h2><p className="mt-2 max-w-xl text-sm text-slate-200/65">Recipes and effects are taken from the Season 5 meal sheet. Toggle your stores to find what you can make now.</p></div><div className="grid gap-4 lg:grid-cols-[1fr_280px]"><Card><div className="border-b border-dv-line p-4"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search meals, effects, ingredients" className="w-full border border-dv-line bg-dv-panel2 px-3 py-3 text-xs text-dv-brassLight outline-none placeholder:text-slate-300/50 focus:border-dv-violet" /><div className="mt-3 flex flex-wrap gap-2">{(["all", "raid", "exploration"] as const).map((item) => <button type="button" key={item} onClick={() => setFilter(item)} className={`border px-3 py-2 text-[9px] uppercase ${filter === item ? "border-dv-violet bg-dv-violet/15 text-dv-brassLight" : "border-dv-line bg-dv-panel2 text-slate-300/60"}`}>{item === "all" ? "All meals" : item}</button>)}</div></div><div className="divide-y divide-dv-line">{visible.map(({ meal, index }) => { const ready = meal.ingredients.length > 0 && meal.ingredients.every((item) => ingredients.find((ingredient) => ingredient.name === item)?.owned); return <article key={`${meal.name}-${index}`} className="p-4"><div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><MealThumb image={meal.image} name={meal.name} /><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm text-dv-brassLight">{meal.name}</h3><span className="status-chip">{meal.rarity}</span></div><p className="mt-2 text-xs text-dv-emerald">{meal.effect}</p></div></div><span className={`text-[9px] uppercase ${ready ? "text-dv-emerald" : "text-slate-300/50"}`}>{ready ? "Ready" : "Missing"}</span></div><div className="mt-4 flex flex-wrap gap-1.5">{meal.ingredients.map((item, index) => <span key={`${item}-${index}`} className="border border-dv-line bg-dv-panel2 px-2 py-1 text-[9px] text-slate-300/65">{item}</span>)}</div></article>; })}</div></Card><Card className="h-fit p-4"><div className="mb-4 flex items-center justify-between"><div><SectionLabel>YOUR STORES</SectionLabel><p className="text-sm text-dv-brassLight">Ingredient ownership</p></div><span className="text-[10px] text-dv-emerald">{ingredients.filter((item) => item.owned).length}/{ingredients.length}</span></div><div>{ingredients.map((ingredient) => <button type="button" key={ingredient.name} onClick={() => setOwned((current) => ({ ...current, [ingredient.name]: !ingredient.owned }))} className="flex w-full items-center gap-3 border-b border-dv-line/60 py-2.5 text-left last:border-0"><IngredientIcon image={ingredient.image} name={ingredient.name} /><span><span className="block text-xs">{ingredient.name}</span><span className="block text-[8px] text-slate-300/50">{ingredient.source}</span></span><span className={`ml-auto grid h-5 w-5 place-items-center border text-[11px] ${ingredient.owned ? "border-dv-emerald bg-dv-emerald text-dv-bg" : "border-dv-line text-transparent"}`}>◆</span></button>)}</div></Card></div></div>;
}

export function Runes() {
  const [filter, setFilter] = useState("all");
  const visible = runeRows.filter((row) => filter === "all" || row[2] === filter);
  return <div className="space-y-4"><Card className="p-4"><SectionLabel>RUNE DESK / PRIORITY ORDER</SectionLabel><h2 className="text-xl text-dv-brassLight">Spend fragments with a plan.</h2><p className="mt-2 max-w-xl text-sm text-slate-200/65">Priorities below follow the attached guild rune notes: season value first, then team needs and situational utility.</p></Card><Card><div className="flex flex-wrap items-center justify-between gap-3 border-b border-dv-line p-4"><div><SectionLabel>TIER LIST</SectionLabel><p className="text-sm text-dv-brassLight">Recommended by guild officers</p></div><div className="flex flex-wrap gap-1">{["all", "emblems", "exploration", "resources", "team", "combat"].map((item) => <button type="button" key={item} onClick={() => setFilter(item)} className={`px-2 py-1 text-[8px] uppercase ${filter === item ? "bg-dv-violet text-dv-bg" : "bg-dv-panel2 text-slate-300/60"}`}>{item}</button>)}</div></div><div className="divide-y divide-dv-line">{visible.map(([rank, name, type, note]) => <div key={name} className="grid grid-cols-[68px_1fr] gap-3 p-4 sm:grid-cols-[90px_1fr_auto]"><div className="grid h-9 place-items-center border border-dv-brass/50 bg-dv-brass/10 font-pixel text-[10px] text-dv-brassLight">{rank}</div><div><p className="text-sm text-dv-brassLight">{name}</p><p className="mt-1 text-xs leading-relaxed text-slate-200/65">{note}</p></div><span className="hidden self-center text-[9px] uppercase text-slate-300/50 sm:block">{type}</span></div>)}</div></Card></div>;
}
