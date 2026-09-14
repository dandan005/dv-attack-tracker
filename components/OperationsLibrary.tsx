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
  { name: "???", rarity: "Immortal appetizer", category: "Appetizer", effect: "Exploration progress +5%", ingredients: [], tags: ["exploration"], image: "question-21.png" },
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
  ["Build", "RAID LOADOUT", "The guild pet carries most of the damage in this fight, so build its skill loadout in three stages — early, mid, and lategame — swapping in stronger skills as they unlock. For spirits, a few specific high-tier fire spirits are the preferred pick, but any spirit with a high awaken level works well."],
  ["Tips", "RAID LOADOUT", "For Rave: either break the first shield with skills and record Rave during the second shield to capture familiar plus guild-pet damage, or record Rave while breaking the first shield to bank guild-pet damage and save it to release during the final shield phase. You can quit this fight the same way as FoC, so it's safe to go in and test combinations — just be careful, since some combos can get you killed quickly."],
];

type Rune = { name: string; effect: string };
type RuneGroup = { label: string | null; runes: Rune[] };
type RuneTier = { name: string; icon: string; accent: "brass" | "violet" | "emerald"; groups: RuneGroup[] };

const runeTiers: RuneTier[] = [
  {
    name: "Immortal",
    icon: "🟡",
    accent: "brass",
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
    icon: "🔵",
    accent: "violet",
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
    icon: "⚪",
    accent: "emerald",
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

const tierStyles: Record<RuneTier["accent"], { border: string; text: string; chipBorder: string; chipBg: string }> = {
  brass: { border: "border-dv-brass/50", text: "text-dv-brassLight", chipBorder: "border-dv-brass/50", chipBg: "bg-dv-brass/15" },
  violet: { border: "border-dv-violet/50", text: "text-dv-violet", chipBorder: "border-dv-violet/50", chipBg: "bg-dv-violet/15" },
  emerald: { border: "border-dv-emerald/50", text: "text-dv-emerald", chipBorder: "border-dv-emerald/50", chipBg: "bg-dv-emerald/15" },
};

type MainDish = {
  name: string;
  priority: number | "E";
  image: string;
  effect: string;
};

const mainDishes: MainDish[] = [
  { name: "Bubble Hotpot", priority: 1, image: "bubble-hotpot.png", effect: "Increase the amount of Ingredients obtained from Exploration." },
  { name: "Sandwich", priority: 2, image: "sandwich.png", effect: "ATK SPD increase while the Wyvern is preparing its powerful attack" },
  { name: "Immortal Steak", priority: 3, image: "immortal-steak.png", effect: "Increases DMG to Wyvern." },
  { name: "BBQ Ribs", priority: 4, image: "bbq-ribs.png", effect: "Dmg increase every 20 sec after entering the Raid" },
  { name: "Savory Hotdog", priority: 5, image: "savory-hotdog.png", effect: "Additional DMG after Wyvern fails a powerful attack" },
  { name: "Hellfire Curry", priority: "E", image: "hellfire-curry.png", effect: "Increases Fire Attribute DMG to Wyvern" },
  { name: "Water Slash Soup", priority: "E", image: "water-slash-soup.png", effect: "Increases Water Attribute DMG to Wyvern" },
  { name: "Thunderbolt Burger", priority: "E", image: "thunderbolt-burger.png", effect: "Increases Wind Attribute DMG to Wyvern" },
  { name: "Demon Pizza", priority: "E", image: "demon-pizza.png", effect: "Increases Earth Attribute DMG to Wyvern" },
];

type Stage = "Early" | "Mid" | "Late";

const skillsByStage: Record<Stage, string[]> = {
  Early: ["Hell Fire Slash", "Giga Strike", "Red Lightning", "Burning Sword", "Curved Blade", "Meditation", "Speed Sword", "Earth's Will"],
  Mid: ["Rave", "Fire Slash", "Hell Fire Slash", "Burning Sword", "Curved Blade", "Meditation", "Strong Current", "Wrath of Gods", "Speed Sword", "Earth's Will"],
  Late: ["Rave", "Demon Hunt", "Giga Strike", "Burning Sword", "Curved Blade", "Wrath of Gods", "Meditation", "Warrior Burn", "Speed Sword", "Earth's Will"],
};

// Skills with no image (Rave, Strong Current) render a placeholder "?" slot, same as unrevealed meals.
const skillImages: Record<string, string | undefined> = {
  "Red Lightning": "red-lightning.png",
  "Meditation": "meditation.png",
  "Giga Strike": "giga-strike.png",
  "Burning Sword": "burning-sword.png",
  "Speed Sword": "speed-sword.png",
  "Wrath of Gods": "wrath-of-gods.png",
  "Demon Hunt": "demon-hunt.png",
  "Fire Slash": "fire-slash.png",
  "Warrior Burn": "warrior-burn.png",
  "Earth's Will": "earths-will.png",
  "Hell Fire Slash": "hell-fire-slash.png",
  "Curved Blade": "curved-blade.png",
  "Rave": "rave.png",
  "Strong Current": "strong-current.png",
};

type Spirit = { name: string; image: string };

const spirits: Spirit[] = [
  { name: "Sala", image: "sala.png" },
  { name: "Noah", image: "noah.png" },
  { name: "Loar", image: "loar.png" },
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

function PriorityBadge({ priority }: { priority: number | "E" }) {
  const isElemental = priority === "E";
  return (
    <span
      className={
        "absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full border text-[10px] font-bold " +
        (isElemental
          ? "border-dv-violet bg-dv-violet text-white"
          : "border-dv-brass bg-dv-brass text-dv-bg")
      }
      title={isElemental ? "Elemental — cooked last, matched to the wyvern trace" : `Cook priority ${priority}`}
    >
      {priority}
    </span>
  );
}

function MainDishThumb({ image, name, priority }: { image: string; name: string; priority: number | "E" }) {
  return (
    <div className="relative h-14 w-14 shrink-0">
      <div className="pixel-frame item-slot h-14 w-14 overflow-hidden">
        <img src={"/cooking/" + image} alt={name} className="h-full w-full object-cover" style={{ imageRendering: "pixelated" }} />
      </div>
      <PriorityBadge priority={priority} />
    </div>
  );
}

export function Guide() {
  const [open, setOpen] = useState<string[]>([guideSections[0][0], guideSections[1][0]]);
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <SectionLabel>FIELD MANUAL / SEASON 5</SectionLabel>
        <h2 className="font-pixel text-xl leading-snug text-dv-brassLight">
          Read the room.<br />Then hit the dragon.
        </h2>
        <p className="mt-3 max-w-xl text-sm text-slate-200/65">
          The short version of Dragon Valley operations for the player who has two minutes before the next session.
        </p>
      </Card>
      <Card>
        <div className="border-b border-dv-line px-4 py-4">
          <SectionLabel>OPERATIONS INDEX</SectionLabel>
          <p className="text-sm">Open a briefing to get the useful part.</p>
        </div>
        <div className="divide-y divide-dv-line">
          {guideSections.map(([title, kicker, body], index) => {
            const isOpen = open.includes(title);
            return (
              <div key={title}>
                <button
                  type="button"
                  onClick={() => setOpen((current) => isOpen ? current.filter((item) => item !== title) : [...current, title])}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-dv-panel2"
                >
                  <span className={`font-pixel text-[10px] ${isOpen ? "text-dv-brassLight" : "text-slate-300/50"}`}>0{index + 1}</span>
                  <span className="flex-1">
                    <span className="eyebrow block">{kicker}</span>
                    <span className="mt-1 block text-sm text-dv-brassLight">{title}</span>
                  </span>
                  <span className="text-dv-violet">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && <p className="animate-rise px-4 pb-5 pl-14 text-xs leading-relaxed text-slate-200/65">{body}</p>}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export function MainCooking() {
  const sorted = useMemo(
    () =>
      [...mainDishes].sort((a, b) => {
        const rank = (value: number | "E") => (value === "E" ? 99 : value);
        return rank(a.priority) - rank(b.priority);
      }),
    []
  );

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <SectionLabel>MAIN COOKING / CAMPFIRE QUEUE</SectionLabel>
        <h2 className="text-xl text-dv-brassLight">Cook in order.</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-200/65">
          Gold numbers are the fixed priority: 1 through 5, cooked first. Violet <span className="text-dv-violet">E</span> tags
          are elemental dishes — hold those until the trace confirms which wyvern shows up, then cook to match it.
        </p>
      </Card>

      <Card>
        <div className="divide-y divide-dv-line">
          {sorted.map((dish) => (
            <article key={dish.name} className="flex items-center gap-3 p-4">
              <MainDishThumb image={dish.image} name={dish.name} priority={dish.priority} />
              <div>
                <h3 className="text-sm text-dv-brassLight">{dish.name}</h3>
                <p className="mt-1 text-[10px] uppercase text-slate-300/50">
                  {dish.priority === "E" ? "Elemental — cook last" : `Priority ${dish.priority}`}
                </p>
                <p className="mt-1.5 text-xs text-dv-emerald">{dish.effect}</p>
              </div>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SkillThumb({ image, name }: { image?: string; name: string }) {
  return (
    <div className="pixel-frame item-slot h-14 w-14 shrink-0 overflow-hidden">
      {image ? (
        <img src={"/skills/" + image} alt={name} className="h-full w-full object-cover" style={{ imageRendering: "pixelated" }} />
      ) : (
        <div className="grid h-full w-full place-items-center text-[10px] text-slate-300/40">?</div>
      )}
    </div>
  );
}

export function SkillBuild() {
  const [stage, setStage] = useState<Stage>("Early");
  const stages: Stage[] = ["Early", "Mid", "Late"];

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <SectionLabel>SKILL BUILD / RAID LOADOUT</SectionLabel>
        <h2 className="text-xl text-dv-brassLight">Slot skills by stage.</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-200/65">
          Swap skills as you progress.
        </p>
      </Card>

      <Card>
        <div className="flex gap-2 border-b border-dv-line p-4">
          {stages.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setStage(item)}
              className={`flex-1 border px-3 py-2 text-center text-[10px] uppercase ${
                stage === item ? "border-dv-violet bg-dv-violet/15 text-dv-brassLight" : "border-dv-line bg-dv-panel2 text-slate-300/60"
              }`}
            >
              {item} Game
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
          {skillsByStage[stage].map((name, index) => (
            <div key={`${name}-${index}`} className="flex items-center gap-3">
              <SkillThumb image={skillImages[name]} name={name} />
              <span className="text-xs text-dv-brassLight">{name}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function Spirits() {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <SectionLabel>SPIRITS</SectionLabel>
        <h2 className="text-xl text-dv-brassLight">Any high-awaken spirit works.</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-200/65">
          Higher awaken level matters more than which spirit you pick.
        </p>
      </Card>
      <Card>
        <div className="grid grid-cols-3 gap-4 p-4 sm:grid-cols-3">
          {spirits.map((spirit) => (
            <div key={spirit.name} className="flex flex-col items-center gap-2 text-center">
              <div className="pixel-frame item-slot h-16 w-16 overflow-hidden">
                <img
                  src={"/spirits/" + spirit.image}
                  alt={spirit.name}
                  className="h-full w-full object-cover"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
              <span className="text-xs text-dv-brassLight">{spirit.name}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function Meals() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "Appetizer" | "Main dish" | "Dessert">("all");
  const [owned, setOwned] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("dv-command-ingredients") ?? "{}"); } catch { return {}; }
  });
  useEffect(() => { localStorage.setItem("dv-command-ingredients", JSON.stringify(owned)); }, [owned]);
  const ingredients = ingredientDefaults.map(([name, source, defaultOwned, image]) => ({ name, source, image, owned: owned[name] ?? defaultOwned }));
  const visible = useMemo(
    () =>
      meals
        .map((meal, index) => ({ meal, index }))
        .filter(
          ({ meal }) =>
            `${meal.name} ${meal.effect} ${meal.ingredients.join(" ")}`.toLowerCase().includes(query.toLowerCase()) &&
            (filter === "all" || meal.category === filter)
        ),
    [filter, query]
  );

  const filterTabs: { value: "all" | "Appetizer" | "Main dish" | "Dessert"; label: string }[] = [
    { value: "all", label: "All meals" },
    { value: "Appetizer", label: "Appetizer" },
    { value: "Main dish", label: "Main" },
    { value: "Dessert", label: "Dessert" },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <SectionLabel>PROVISIONS / SEASON 5</SectionLabel>
        <h2 className="text-xl text-dv-brassLight">Cook for the window.</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-200/65">
          Recipes and effects are taken from the Season 5 meal sheet. Toggle your stores to find what you can make now.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Card>
          <div className="border-b border-dv-line p-4">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search meals, effects, ingredients"
              className="w-full border border-dv-line bg-dv-panel2 px-3 py-3 text-xs text-dv-brassLight outline-none placeholder:text-slate-300/50 focus:border-dv-violet"
            />
            <div className="mt-3 grid grid-cols-4 gap-2">
              {filterTabs.map(({ value, label }) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`border px-2 py-2 text-center text-[9px] uppercase ${
                    filter === value ? "border-dv-violet bg-dv-violet/15 text-dv-brassLight" : "border-dv-line bg-dv-panel2 text-slate-300/60"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-dv-line">
            {visible.map(({ meal, index }) => {
              const ready = meal.ingredients.length > 0 && meal.ingredients.every((item) => ingredients.find((ingredient) => ingredient.name === item)?.owned);
              return (
                <article key={`${meal.name}-${index}`} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <MealThumb image={meal.image} name={meal.name} />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm text-dv-brassLight">{meal.name}</h3>
                          <span className="status-chip">{meal.rarity}</span>
                        </div>
                        <p className="mt-2 text-xs text-dv-emerald">{meal.effect}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!ready}
                      className={
                        ready
                          ? "border border-dv-violet bg-dv-violet/15 px-3 py-2 text-[9px] uppercase text-dv-violet hover:bg-dv-violet/25"
                          : "cursor-not-allowed border border-dv-line bg-dv-panel2 px-3 py-2 text-[9px] uppercase text-slate-300/40"
                      }
                    >
                      Cook
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {meal.ingredients.map((item, index) => {
                      const isOwned = ingredients.find((ingredient) => ingredient.name === item)?.owned;
                      return (
                        <span
                          key={`${item}-${index}`}
                          className={
                            isOwned
                              ? "border border-dv-brass bg-dv-brass/15 px-2 py-1 text-[9px] text-dv-brassLight"
                              : "border border-dv-line bg-dv-panel2 px-2 py-1 text-[9px] text-slate-300/65"
                          }
                        >
                          {item}
                        </span>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </Card>

        <Card className="h-fit p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <SectionLabel>YOUR STORES</SectionLabel>
              <p className="text-sm text-dv-brassLight">Ingredient ownership</p>
            </div>
            <span className="text-[10px] text-dv-emerald">
              {ingredients.filter((item) => item.owned).length}/{ingredients.length}
            </span>
          </div>
          <div>
            {ingredients.map((ingredient) => (
              <button
                type="button"
                key={ingredient.name}
                onClick={() => setOwned((current) => ({ ...current, [ingredient.name]: !ingredient.owned }))}
                className="flex w-full items-center gap-3 border-b border-dv-line/60 py-2.5 text-left last:border-0"
              >
                <IngredientIcon image={ingredient.image} name={ingredient.name} />
                <span>
                  <span className="block text-xs">{ingredient.name}</span>
                  <span className="block text-[8px] text-slate-300/50">{ingredient.source}</span>
                </span>
                <span
                  className={`ml-auto grid h-5 w-5 place-items-center border text-[11px] ${
                    ingredient.owned ? "border-dv-emerald bg-dv-emerald text-dv-bg" : "border-dv-line text-transparent"
                  }`}
                >
                  ◆
                </span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function Runes() {
  const [query, setQuery] = useState("");
  const [openTiers, setOpenTiers] = useState<string[]>(["Immortal"]);

  const filteredTiers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return runeTiers;
    return runeTiers
      .map((tier) => ({
        ...tier,
        groups: tier.groups
          .map((group) => ({
            ...group,
            runes: group.runes.filter((rune) => `${rune.name} ${rune.effect}`.toLowerCase().includes(q)),
          }))
          .filter((group) => group.runes.length > 0),
      }))
      .filter((tier) => tier.groups.length > 0);
  }, [query]);

  // While searching, force every matching tier open so results aren't hidden behind a collapsed accordion.
  const isSearching = query.trim().length > 0;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <SectionLabel>RUNE DESK / TIER NOTES</SectionLabel>
        <h2 className="text-xl text-dv-brassLight">Spend fragments with a plan.</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-200/65">
          Full guild rune notes by tier — Immortal, Mythic, and Legendary — with sub-tier priority and rough Emblem value where it's known.
        </p>
      </Card>

      <Card className="p-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search runes or effects"
          className="w-full border border-dv-line bg-dv-panel2 px-3 py-3 text-xs text-dv-brassLight outline-none placeholder:text-slate-300/50 focus:border-dv-violet"
        />
      </Card>

      {filteredTiers.length === 0 && (
        <Card className="p-4">
          <p className="text-xs text-slate-300/60">No runes match that search.</p>
        </Card>
      )}

      {filteredTiers.map((tier) => {
        const style = tierStyles[tier.accent];
        const isOpen = isSearching || openTiers.includes(tier.name);
        return (
          <Card key={tier.name}>
            <button
              type="button"
              onClick={() => setOpenTiers((current) => (current.includes(tier.name) ? current.filter((item) => item !== tier.name) : [...current, tier.name]))}
              className={`flex w-full items-center gap-3 border-b border-dv-line px-4 py-4 text-left ${isOpen ? "" : "border-b-0"}`}
            >
              <span className="text-lg leading-none">{tier.icon}</span>
              <span className="flex-1">
                <span className="eyebrow block">RUNE TIER</span>
                <span className={`mt-1 block text-sm ${style.text}`}>{tier.name}</span>
              </span>
              <span className="text-dv-violet">{isOpen ? "−" : "+"}</span>
            </button>

            {isOpen && (
              <div className="divide-y divide-dv-line">
                {tier.groups.map((group, groupIndex) => (
                  <div key={`${tier.name}-${group.label ?? "top"}-${groupIndex}`} className="p-4">
                    {group.label && (
                      <div className="mb-3 flex items-center gap-2">
                        <span
                          className={`grid h-6 w-6 place-items-center border font-pixel text-[10px] ${style.chipBorder} ${style.chipBg} ${style.text}`}
                        >
                          {group.label}
                        </span>
                        <span className="text-[9px] uppercase tracking-[.1em] text-slate-300/50">Sub-tier {group.label}</span>
                      </div>
                    )}
                    <div className="space-y-3">
                      {group.runes.map((rune) => (
                        <div key={rune.name} className="item-slot border border-dv-line/70 p-3">
                          <p className={`text-sm ${style.text}`}>{rune.name}</p>
                          <p className="mt-1.5 text-xs leading-relaxed text-slate-200/65">{rune.effect}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
