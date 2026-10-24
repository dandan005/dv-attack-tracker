// Shared rune data: the Rune Desk, the bag, and the day rune picker all read from here.

export type Rune = { name: string; effect: string };
export type RuneGroup = { label: string | null; runes: Rune[] };
// Tier colours, highest first: gold, orange, cyan/teal, blue (blue is a placeholder for a fourth tier).
export type RuneAccent = "gold" | "orange" | "cyan" | "blue";
export type RuneTier = { name: string; icon: string; accent: RuneAccent; groups: RuneGroup[] };

export const runeTiers: RuneTier[] = [
  {
    name: "Immortal",
    icon: "ᛟ",
    accent: "gold",
    groups: [
      {
        label: null,
        runes: [
          { name: "Game Changer", effect: "50% bonus Emblem last day (~15-20k Emblem in mid-game+)" },
          { name: "Special Onigiri", effect: "1x bonus raid (~10-15k Emblems in mid-game+)" },
        ],
      },
      {
        label: "S",
        runes: [
          { name: "Scrutiny", effect: "50% bonus Emblem when exploring completed terrain (~3-9k depending on optimization and trace finding)" },
          { name: "Survival Expert", effect: "20 Emblem per 1 min campfire (~6k Emblems, more with stick bonuses)" },
          { name: "Medal of Honor", effect: "5k Emblem" },
        ],
      },
      {
        label: "A",
        runes: [
          { name: "My dream is to be a chef!", effect: "+500 Emblem per dish cooked (~1-7k Emblem. Better on earlier days)" },
          { name: "Chocolate Energy Bar", effect: "1x bonus exploration (~3-6k Emblem)" },
          { name: "Noble Sacrifice", effect: "Sacrifice 3x exploration to give all teammates in same terrain 1x bonus exploration (~3-6k Emblem, trade 3x for 4x, basically same as 1 choco bar with more steps)" },
          { name: "Genius Girl Cheer", effect: "3k Emblem + 100% ATK per active attack skill used (3k Emblem + medium dmg?)" },
          { name: "We Came. We Saw. We Won", effect: "2k Emblem + 500% Raid DMG per Trace (2k Emblem + big dmg?)" },
          { name: "Foodie's Cheer", effect: "3k Emblem + 2x DMG on strike skill (3k Emblem + some dmg?)" },
          { name: "Scammer's Cheer", effect: "3k Emblem + 100% ATK SPD in Raid (3k Emblem + some dmg?)" },
          { name: "Cheapskate's Cheer", effect: "3k Emblem + 100% Cooldown Charge Speed (3k Emblem + some dmg?)" },
        ],
      },
      {
        label: "B",
        runes: [
          { name: "Wyvern's Fury", effect: "500 Emblem per egg gained, +100% DMG (~0-5k Emblem, very RNG, better to get on earlier days)" },
          { name: "Wyvern Expert", effect: "Gain bonus 3k Emblem per trace (hard to control, very RNG but can be useful on early days)" },
          { name: "Bountiful Harvest", effect: "Bunch of cooking materials (requires keeping track of what you need for cooking from previous day? hard to use on last day)" },
          { name: "Meat Is Best!", effect: "Cannot gain Lettuce, double Emblems for dishes containing Meat (2-3k Emblem, possibly hard to use)" },
          { name: "Black Gold", effect: "Obtain 1 Caviar (1-3k Emblem Special Dish bonus)" },
          { name: "Black Diamond", effect: "Obtain 1 Truffle (1-3k Emblem Special Dish bonus)" },
          { name: "Golden Honeycomb", effect: "Obtain 1 Honeycomb (1-3k Emblem Special Dish bonus)" },
          { name: "Eureka!", effect: "Obtain 1 chocolate bar when you complete an undiscovered recipe for the first time (good but unlikely to have impact when it's actually useful)" },
        ],
      },
      {
        label: "C",
        runes: [
          { name: "Pandora's Box", effect: "All cooking ingredients you own are changed into random ingredients (unpredictable? hard to use usefully)" },
          { name: "Breath of the Sword", effect: "Autos do 1% HP dmg (big dmg?)" },
          { name: "Praise Works Wonders", effect: "Each 1000 Emblem = 10% Wyvern DMG (big dmg?)" },
          { name: "Solitary Gourmet", effect: "500% Raid DMG per lvl 20 dish (big dmg?)" },
        ],
      },
    ],
  },
  {
    name: "Mythic",
    icon: "ᛞ",
    accent: "orange",
    groups: [
      {
        label: null,
        runes: [{ name: "Ancient Book", effect: "+10% Raid Emblem (~8-12k Emblem)" }],
      },
      {
        label: "S",
        runes: [{ name: "Random Immortal Rune", effect: "Early tier up (~3k Emblem, estimated based on average of known Immortal runes)" }],
      },
      {
        label: "A",
        runes: [
          { name: "Golden Compass", effect: "+10% Exploration Emblem (~1-4k Emblem per day, more if it helps you win exploration regions)" },
          { name: "Bubbling Hot Pot Kit", effect: "+30% resources (~1-4k Emblem, more useful on earlier days, more Emblems if it helps you win exploration regions)" },
          { name: "Opal", effect: "2,000 Emblem" },
          { name: "Perfume of the Kitchen", effect: "Obtain 1 basil (~1-2k Emblem probably?)" },
          { name: "Gene's Gift", effect: "Obtain 10 shrimp and 10 rice (~1-2k Emblem probably?)" },
          { name: "Stress Reliever", effect: "Obtain 1 chili pepper (~1-2k Emblem probably?)" },
        ],
      },
      {
        label: "B",
        runes: [
          { name: "Help Me, Ether Robot!", effect: "Summons Ether Robot-RBG during Subjugation battles (assuming Flamethrower does a lot of dmg still?)" },
          { name: "Let's Go Together, Buddy!", effect: "Gain 1 Onigiri for Raid phase if you have the least points on your team in Exploration phase (Onigiri good, throwing in Exploration bad — high risk, high reward)" },
          { name: "Persistent Search", effect: "+50% chance of Wyvern Trace (more useful in weaker guilds where finding traces is harder)" },
          { name: "Preemptive Strike", effect: "+300% Raid DMG per trace (medium dmg?)" },
          { name: "Super Strength", effect: "+300% Total ATK" },
          { name: "Lightning Rod", effect: "Focus RL all on one target (prevent out of range misses? some dmg?)" },
        ],
      },
      {
        label: "C",
        runes: [
          { name: "Egg Nest Frost", effect: "2-5 eggs (depend on cooking, more useful on earlier days)" },
          { name: "Bean!!", effect: "50-100 bean (depend on cooking, more useful on earlier days)" },
          { name: "Who Ordered Milk", effect: "200-350 milk (depend on cooking, more useful on earlier days)" },
          { name: "Sweetness Alert!", effect: "70-150 sugar cane (depend on cooking, more useful on earlier days)" },
          { name: "Harvest Complete!", effect: "300-800 Wheat (depend on cooking, more useful on earlier days)" },
          { name: "Pile of Stones", effect: "30x Stone Strike DMG (some DMG, depends on wyvern)" },
          { name: "Legendary Lumberjack", effect: "+50% sticks" },
        ],
      },
      {
        label: "D",
        runes: [
          { name: "Chef Has Gone Mad!", effect: "Ingredient exchange with Chef costs 50% less (unlikely to do much for cooking)" },
          { name: "[Region] Specialist", effect: "20% more progress while exploring [Region] (should be able to find all traces with coordination)" },
          { name: "Have You Ever Been Dumped at the Speed of Light?", effect: "Increase Fulg + SS DMG by 1000%" },
          { name: "Body of Steel", effect: "Total HP +300%" },
          { name: "Strong Heart", effect: "HP Rec +300%" },
        ],
      },
    ],
  },
  {
    name: "Legendary",
    icon: "ᛗ",
    accent: "cyan",
    groups: [
      {
        label: "A",
        runes: [
          { name: "Random Mythic Rune", effect: "Early tier up (highest expected Emblem value)" },
          { name: "Ruby", effect: "1000 Emblem" },
        ],
      },
      {
        label: "B",
        runes: [
          { name: "Cyclos! I've Come to Bargain!", effect: "Very confused by this one, but seems like if your Special Dish doesn't get you anything, you get a resource refund? Possibly helps get an extra Special Dish cooked for Emblems." },
          { name: "[Region] Explorer", effect: "+500% DMG when exploring [Region] (extra Emblems if it helps you beat next difficulty)" },
          { name: "Back to Basics", effect: "+2000% DMG for common attack skills (some dmg?)" },
          { name: "Dangerous Contract", effect: "Cannot recover HP, +500% DMG (some dmg?)" },
          { name: "Ancient Asparagus", effect: "Double DMG effect of Immortal Steak (some dmg?)" },
          { name: "Seasoned Hunter", effect: "+500% DMG against Frozen/Stunned Wyvern (some dmg?)" },
        ],
      },
      {
        label: "C",
        runes: [
          { name: "Pile of Sticks", effect: "+50 sticks (completely useless aside from the off chance you get Survival Expert immortal rune, in which case it's 3k Emblem)" },
          { name: "[Wyvern] Specialist", effect: "+500% DMG against specific [Wyvern] (RNG if that's the correct one)" },
          { name: "Reliable Friends", effect: "3x earth spirit = 500% Earth Skill DMG (some dmg, most realistic element to use spirit-wise)" },
          { name: "Warm Friends", effect: "3x fire spirit = 500% Fire Skill DMG (some dmg, but some benefit lost because you can't use strongest spirits)" },
          { name: "Crimson Beast", effect: "Increase DMG by 2% based on HP lost during Raid (wording unclear — is it mini-rage or taking dmg and recovering still counts?)" },
          { name: "Overclock", effect: "2x MP Usage, 300% Total ATK (need Life Mana to sustain)" },
        ],
      },
      {
        label: "D",
        runes: [
          { name: "Awaken Time Freeze", effect: "Increase Ark's skill folds (duration) by 3x (??? Ark maybe useful if it causes another flamethrower proc?)" },
          { name: "Awaken Wind Force", effect: "Increase Herh's skill effect by 3x (reduced cooldown?)" },
          { name: "Nimble Friends", effect: "3x wind spirit = 500% Wind Skill DMG (hard to use)" },
          { name: "Water Friends", effect: "3x water spirit = 500% Water Skill DMG (hard to use)" },
        ],
      },
    ],
  },
];

export const tierStyles: Record<RuneAccent, { border: string; text: string; chipBorder: string; chipBg: string }> = {
  gold: { border: "border-amber-300/50", text: "text-amber-200", chipBorder: "border-amber-300/50", chipBg: "bg-amber-300/15" },
  orange: { border: "border-orange-400/50", text: "text-orange-300", chipBorder: "border-orange-400/50", chipBg: "bg-orange-400/15" },
  cyan: { border: "border-teal-300/50", text: "text-cyan-200", chipBorder: "border-teal-300/50", chipBg: "bg-teal-300/15" },
  blue: { border: "border-sky-400/50", text: "text-sky-300", chipBorder: "border-sky-400/50", chipBg: "bg-sky-400/15" },
};

// Solid colour for each tier's gem and card trim (used by the rune card).
export const tierColors: Record<RuneAccent, string> = {
  gold: "#ffd76a",
  orange: "#ff9a3c",
  cyan: "#5ef0e0",
  blue: "#5aa8ff",
};

// Flat, priority-ordered list (data order: Immortal first, then S → D within each tier).
// A lower rank means a better rune, which the picker uses to choose the recommendation.
export type FlatRune = { name: string; effect: string; tier: string; accent: RuneAccent; rank: number; icon: string | null };

// Pixel icons assigned by what each rune does (file names in public/runes/).
// chef = special dish runes; pot = main cooking runes.
export const RUNE_ICONS: Record<string, string> = {
  "Game Changer": "star",
  "Special Onigiri": "star",
  "Random Immortal Rune": "star",
  "Random Mythic Rune": "star",
  "Cheapskate's Cheer": "star",
  "Scammer's Cheer": "star",
  "Foodie's Cheer": "star",
  "Wyvern's Fury": "skull",
  "Wyvern Expert": "skull",
  "Praise Works Wonders": "skull",
  "[Wyvern] Specialist": "skull",
  "Seasoned Hunter": "skull",
  "Persistent Search": "skull",
  "Preemptive Strike": "skull",
  "We Came. We Saw. We Won": "skull",
  "Survival Expert": "campfire",
  "Pile of Sticks": "campfire",
  "Legendary Lumberjack": "campfire",
  "Warm Friends": "campfire",
  "Medal of Honor": "medal",
  "Ancient Book": "medal",
  "Golden Compass": "medal",
  "Opal": "bag",
  "Ruby": "bag",
  "Help Me, Ether Robot!": "robot",
  "Lightning Rod": "robot",
  "Breath of the Sword": "swords",
  "Back to Basics": "swords",
  "Dangerous Contract": "swords",
  "Super Strength": "swords",
  "Overclock": "swords",
  "Genius Girl Cheer": "swords",
  "Body of Steel": "swords",
  "Strong Heart": "swords",
  "Pile of Stones": "swords",
  "Have You Ever Been Dumped at the Speed of Light?": "swords",
  "Reliable Friends": "swords",
  "Crimson Beast": "swords",
  "Awaken Time Freeze": "swords",
  "Awaken Wind Force": "swords",
  "Nimble Friends": "swords",
  "Water Friends": "swords",
  "Black Gold": "chef",
  "Black Diamond": "chef",
  "Golden Honeycomb": "chef",
  "Ancient Asparagus": "chef",
  "Cyclos! I've Come to Bargain!": "chef",
  "Scrutiny": "map",
  "Noble Sacrifice": "map",
  "Chocolate Energy Bar": "map",
  "[Region] Specialist": "map",
  "[Region] Explorer": "map",
  "Let's Go Together, Buddy!": "map",
  "My dream is to be a chef!": "pot",
  "Meat Is Best!": "pot",
  "Bountiful Harvest": "pot",
  "Solitary Gourmet": "pot",
  "Chef Has Gone Mad!": "pot",
  "Pandora's Box": "pot",
  "Eureka!": "pot",
  "Bubbling Hot Pot Kit": "pot",
  "Perfume of the Kitchen": "pot",
  "Gene's Gift": "pot",
  "Stress Reliever": "pot",
  "Egg Nest Frost": "pot",
  "Bean!!": "pot",
  "Who Ordered Milk": "pot",
  "Sweetness Alert!": "pot",
  "Harvest Complete!": "pot",
};
export const ALL_RUNES: FlatRune[] = runeTiers.flatMap((t) =>
  t.groups.flatMap((g) => g.runes.map((r) => ({ name: r.name, effect: r.effect, tier: t.name, accent: t.accent, rank: 0, icon: RUNE_ICONS[r.name] ?? null })))
).map((r, i) => ({ ...r, rank: i }));
export const RUNE_BY_NAME = new Map(ALL_RUNES.map((r) => [r.name, r]));
