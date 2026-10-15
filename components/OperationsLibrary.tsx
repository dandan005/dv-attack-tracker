"use client";

import { descFor } from "./mealDescriptions";
import { useEffect, useMemo, useRef, useState } from "react";

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
  { name: "Egg Sandwich", rarity: "Common appetizer", category: "Appetizer", effect: "Exploration progress +1(+1)%", ingredients: ["Egg", "Egg", "Wheat", "Wheat"], tags: ["exploration"], image: "egg-sandwich.jpg" },
  { name: "Potato Salad", rarity: "Great appetizer", category: "Appetizer", effect: "Exploration progress +1(+1)%", ingredients: ["Potato", "Potato", "Egg", "Milk", "Lettuce"], tags: ["exploration"], image: "potato-salad.jpg" },
  { name: "Tomato Soup", rarity: "Great appetizer", category: "Appetizer", effect: "Exploration progress +1%", ingredients: ["Tomato", "Tomato", "Wheat", "Milk"], tags: ["exploration"], image: "tomato-soup.png" },
  { name: "Cereal", rarity: "Great appetizer", category: "Appetizer", effect: "Exploration progress +1(+1)%", ingredients: ["Corn", "Corn", "Milk"], tags: ["exploration"], image: "cereal.jpg" },
  { name: "Beef Porridge", rarity: "Great appetizer", category: "Appetizer", effect: "Exploration progress +1(+1)%", ingredients: ["Rice", "Rice", "Meat"], tags: ["exploration"], image: "beef-porridge.jpg" },
  { name: "Shrimp Dim Sum", rarity: "Great appetizer", category: "Appetizer", effect: "Exploration progress +1(+1)%", ingredients: ["Shrimp", "Shrimp", "Wheat", "Wheat"], tags: ["exploration"], image: "shrimp-dim-sum.jpg" },
  { name: "Cheese Omelet", rarity: "Rare appetizer", category: "Appetizer", effect: "Exploration progress +2(+1)%", ingredients: ["Cheese", "Egg", "Egg", "Milk"], tags: ["exploration"], image: "cheese-omelet.jpg" },
  { name: "Shrimp Canape", rarity: "Epic appetizer", category: "Appetizer", effect: "Exploration progress +3%", ingredients: ["Cheese", "Shrimp", "Shrimp", "Wheat"], tags: ["exploration"], image: "shrimp-canape.png" },
  { name: "Corn Cheese", rarity: "Epic appetizer", category: "Appetizer", effect: "Exploration progress +3%", ingredients: ["Cheese", "Cheese", "Corn", "Corn"], tags: ["exploration"], image: "corn-cheese.png" },
  { name: "Ham & Cheese Sandwich", rarity: "Epic appetizer", category: "Appetizer", effect: "Exploration progress +3(+1)%", ingredients: ["Cheese", "Strawberry", "Meat", "Wheat", "Lettuce"], tags: ["exploration"], image: "ham-cheese-sandwich.jpg" },
  { name: "Ricotta Salad", rarity: "Epic appetizer", category: "Appetizer", effect: "Exploration progress +3%", ingredients: ["Cheese", "Tomato", "Lettuce", "Lettuce"], tags: ["exploration"], image: "ricotta-salad.png" },
  { name: "Kimchi", rarity: "Epic appetizer", category: "Appetizer", effect: "Exploration progress +3(+1)%", ingredients: ["Chili", "Lettuce", "Lettuce"], tags: ["exploration"], image: "kimchi.jpg" },
  { name: "Bacon Cheese Nachos", rarity: "Epic appetizer", category: "Appetizer", effect: "Exploration progress +3(+1)%", ingredients: ["Cheese", "Corn", "Corn", "Meat"], tags: ["exploration"], image: "bacon-cheese-nachos.jpg" },
  { name: "Basil Pesto Baguette", rarity: "Legendary appetizer", category: "Appetizer", effect: "Exploration progress +3(+1)%", ingredients: ["Basil", "Cheese", "Wheat", "Wheat"], tags: ["exploration"], image: "basil-pesto-baguette.jpg" },
  { name: "English Breakfast", rarity: "Common appetizer", category: "Appetizer", effect: "Exploration progress +1(+1)%", ingredients: ["Egg", "Meat", "Wheat", "Milk", "Lettuce"], tags: ["exploration"], image: "english-breakfast.jpg" },
  { name: "Ellie's Salad", rarity: "Common appetizer", category: "Appetizer", effect: "Exploration progress +1(+1)%", ingredients: ["Lettuce", "Lettuce", "Lettuce", "Lettuce", "Lettuce"], tags: ["exploration"], image: "ellies-salad.jpg" },
  { name: "French Fries", rarity: "Great appetizer", category: "Appetizer", effect: "Exploration progress +1(+2)%", ingredients: ["Potato", "Potato", "Potato", "Wheat"], tags: ["exploration"], image: "french-fries.jpg" },
  { name: "Cheese Sticks", rarity: "Rare appetizer", category: "Appetizer", effect: "Exploration progress +2(+2)%", ingredients: ["Cheese", "Cheese", "Wheat", "Wheat"], tags: ["exploration"], image: "cheese-sticks.jpg" },
  { name: "Tuna Canape", rarity: "Legendary appetizer", category: "Appetizer", effect: "Exploration progress +3%", ingredients: ["Tuna", "Cheese", "Tomato", "Wheat"], tags: ["exploration"], image: "question-19.png" },
  { name: "Caviar Cream Soup", rarity: "Immortal appetizer", category: "Appetizer", effect: "Exploration progress +5(+2)%", ingredients: ["Caviar", "Wheat", "Milk"], tags: ["exploration"], image: "caviar-cream-soup.jpg" },
  { name: "Caviar Canape", rarity: "Immortal appetizer", category: "Appetizer", effect: "Exploration progress +5(+1)%", ingredients: ["Caviar", "Cheese", "Wheat"], tags: ["exploration"], image: "question-21.png" },
  { name: "Pork Loin Katsu", rarity: "Common main dish", category: "Main dish", effect: "Guild member ATK/HP +5(+5)%", ingredients: ["Egg", "Meat", "Wheat"], tags: ["raid"], image: "pork-loin-katsu.png" },
  { name: "Sukiyaki", rarity: "Common main dish", category: "Main dish", effect: "Guild member ATK/HP +5(+5)%", ingredients: ["Egg", "Meat", "Lettuce"], tags: ["raid"], image: "sukiyaki.png" },
  { name: "Shrimp Burger", rarity: "Great main dish", category: "Main dish", effect: "Guild member ATK/HP +10(+5)%", ingredients: ["Shrimp", "Wheat", "Lettuce"], tags: ["raid"], image: "shrimp-burger.jpg" },
  { name: "Omurice", rarity: "Great main dish", category: "Main dish", effect: "Guild member ATK/HP +10(+5)%", ingredients: ["Rice", "Egg", "Egg", "Meat"], tags: ["raid"], image: "omurice.jpg" },
  { name: "Baked Cheese Spaghetti", rarity: "Epic main dish", category: "Main dish", effect: "Guild member ATK/HP +20(+5)%", ingredients: ["Cheese", "Tomato", "Egg", "Meat", "Wheat"], tags: ["raid"], image: "baked-cheese-spaghetti.png" },
  { name: "Eggs in Hell", rarity: "Epic main dish", category: "Main dish", effect: "Guild member ATK/HP +20(+5)%", ingredients: ["Cheese", "Tomato", "Egg", "Meat"], tags: ["raid"], image: "eggs-in-hell.jpg" },
  { name: "Bibimbap", rarity: "Legendary main dish", category: "Main dish", effect: "Guild member ATK/HP +20(+5)%", ingredients: ["Chili", "Rice", "Egg", "Meat", "Lettuce"], tags: ["raid"], image: "bibimbap.png" },
  { name: "Margherita", rarity: "Legendary main dish", category: "Main dish", effect: "Guild member ATK/HP +20(+5)%", ingredients: ["Basil", "Cheese", "Tomato", "Wheat"], tags: ["raid"], image: "margherita.jpg" },
  { name: "Malatang", rarity: "Legendary main dish", category: "Main dish", effect: "Guild member ATK/HP +20(+5)%", ingredients: ["Chili", "Peanut", "Meat", "Lettuce"], tags: ["raid"], image: "malatang.png" },
  { name: "Spicy Pilaf", rarity: "Legendary main dish", category: "Main dish", effect: "Guild member ATK/HP +20(+5)%", ingredients: ["Chili", "Rice", "Meat"], tags: ["raid"], image: "spicy-pilaf.png" },
  { name: "Tuna Sushi", rarity: "Legendary main dish", category: "Main dish", effect: "Guild member ATK/HP +20(+10)%", ingredients: ["Tuna", "Tuna", "Rice"], tags: ["raid"], image: "tuna-sushi.jpg" },
  { name: "Basil Pasta", rarity: "Legendary main dish", category: "Main dish", effect: "Guild member ATK/HP +20(+5)%", ingredients: ["Basil", "Cheese", "Egg", "Wheat"], tags: ["raid"], image: "basil-pasta.jpg" },
  { name: "Fish & Chips", rarity: "Legendary main dish", category: "Main dish", effect: "Guild member ATK/HP +20(+5)%", ingredients: ["Tuna", "Potato", "Wheat", "Wheat"], tags: ["raid"], image: "fish-and-chips.png" },
  { name: "Sweet Chili Shrimp", rarity: "Mythic main dish", category: "Main dish", effect: "Guild member ATK/HP +25%", ingredients: ["Chili", "Shrimp", "Shrimp", "Sugarcane"], tags: ["raid"], image: "sweet-chili-shrimp.png" },
  { name: "Zeke's BBQ", rarity: "Common main dish", category: "Main dish", effect: "Guild member ATK/HP +5(+5)%", ingredients: ["Meat", "Meat", "Meat", "Meat", "Meat"], tags: ["raid"], image: "zekes-bbq.jpg" },
  { name: "Cheeseburger", rarity: "Rare main dish", category: "Main dish", effect: "Guild member ATK/HP +10(+5)%", ingredients: ["Cheese", "Meat", "Wheat"], tags: ["raid"], image: "cheeseburger.png" },
  { name: "Miho's Spicy Ramen", rarity: "Epic main dish", category: "Main dish", effect: "Guild member ATK/HP +20(+10)%", ingredients: ["Chili", "Chili", "Egg", "Meat", "Wheat"], tags: ["raid"], image: "mihos-spicy-ramen.png" },
  { name: "Yangnyeom Chicken", rarity: "Legendary main dish", category: "Main dish", effect: "Guild member ATK/HP +20(+5)%", ingredients: ["Chili", "Sugarcane", "Meat", "Wheat"], tags: ["raid"], image: "id-39.jpg" },
  { name: "Gorgonzola", rarity: "Immortal main dish", category: "Main dish", effect: "Guild member ATK/HP +30(+20)%", ingredients: ["Honeycomb", "Cheese", "Cheese", "Wheat"], tags: ["raid"], image: "question-40.png" },
  { name: "Truffle Risotto", rarity: "Immortal main dish", category: "Main dish", effect: "Guild member ATK/HP +30(+10)%", ingredients: ["Truffle", "Rice", "Meat", "Milk"], tags: ["raid"], image: "question-41.png" },
  { name: "Truffle Gnocchi", rarity: "Immortal main dish", category: "Main dish", effect: "Guild member ATK/HP +30(+10)%", ingredients: ["Truffle", "Potato", "Wheat", "Milk"], tags: ["raid"], image: "truffle-gnocchi.jpg" },
  { name: "Plain Yogurt", rarity: "Common dessert", category: "Dessert", effect: "Wyvern damage +10(+5)%", ingredients: ["Milk", "Milk", "Milk"], tags: ["raid"], image: "plain-yogurt.png" },
  { name: "Strawberry Cake", rarity: "Great dessert", category: "Dessert", effect: "Wyvern damage +10(+5)%", ingredients: ["Strawberry", "Egg", "Wheat", "Wheat", "Milk"], tags: ["raid"], image: "strawberry-cake.png" },
  { name: "Egg Tart", rarity: "Great dessert", category: "Dessert", effect: "Wyvern damage +10(+5)%", ingredients: ["Sugarcane", "Egg", "Egg", "Wheat"], tags: ["raid"], image: "egg-tart.png" },
  { name: "Pudding", rarity: "Great dessert", category: "Dessert", effect: "Wyvern damage +10(+10)%", ingredients: ["Sugarcane", "Sugarcane", "Egg", "Milk", "Milk"], tags: ["raid"], image: "pudding.png" },
  { name: "Fresh Strawberry Milk", rarity: "Great dessert", category: "Dessert", effect: "Wyvern damage +10(+5)%", ingredients: ["Strawberry", "Milk", "Milk"], tags: ["raid"], image: "fresh-strawberry-milk.png" },
  { name: "Donut", rarity: "Great dessert", category: "Dessert", effect: "Wyvern damage +10(+5)%", ingredients: ["Sugarcane", "Egg", "Wheat", "Milk"], tags: ["raid"], image: "donut.png" },
  { name: "Strawberry Tanghulu", rarity: "Great dessert", category: "Dessert", effect: "Wyvern damage +10(+15)%", ingredients: ["Sugarcane", "Sugarcane", "Strawberry", "Strawberry", "Strawberry"], tags: ["raid"], image: "strawberry-tanghulu.png" },
  { name: "Brownie", rarity: "Epic dessert", category: "Dessert", effect: "Wyvern damage +30(+5)%", ingredients: ["Cacao", "Egg", "Wheat", "Wheat", "Milk"], tags: ["raid"], image: "brownie.jpg" },
  { name: "Cocoa", rarity: "Epic dessert", category: "Dessert", effect: "Wyvern damage +30(+5)%", ingredients: ["Cacao", "Milk", "Milk"], tags: ["raid"], image: "cocoa.png" },
  { name: "Chocolate Ice Cream", rarity: "Legendary dessert", category: "Dessert", effect: "Wyvern damage +30(+5)%", ingredients: ["Cacao", "Sugarcane", "Egg", "Milk"], tags: ["raid"], image: "chocolate-ice-cream.png" },
  { name: "Chocolate Chip Cookie", rarity: "Legendary dessert", category: "Dessert", effect: "Wyvern damage +30(+5)%", ingredients: ["Cacao", "Sugarcane", "Egg", "Wheat", "Milk"], tags: ["raid"], image: "chocolate-chip-cookie.png" },
  { name: "Bread", rarity: "Common dessert", category: "Dessert", effect: "Wyvern damage +10(+5)%", ingredients: ["Egg", "Wheat", "Milk"], tags: ["raid"], image: "bread.png" },
  { name: "Popcorn", rarity: "Great dessert", category: "Dessert", effect: "Wyvern damage +10(+10)%", ingredients: ["Corn", "Corn", "Corn"], tags: ["raid"], image: "question-55.png" },
  { name: "Rice Cracker", rarity: "Great dessert", category: "Dessert", effect: "Wyvern damage +10(+10)%", ingredients: ["Rice", "Rice", "Rice", "Rice"], tags: ["raid"], image: "question-56.png" },
  { name: "Strawberry Ice Cream", rarity: "Great dessert", category: "Dessert", effect: "Wyvern damage +10(+5)%", ingredients: ["Sugarcane", "Strawberry", "Egg", "Milk"], tags: ["raid"], image: "strawberry-ice-cream.png" },
  { name: "Churros", rarity: "Great dessert", category: "Dessert", effect: "Wyvern damage +10(+5)%", ingredients: ["Sugarcane", "Wheat", "Wheat", "Milk"], tags: ["raid"], image: "churros.png" },
  { name: "Luna's Cotton Candy", rarity: "Great dessert", category: "Dessert", effect: "Wyvern damage +10(+10)%", ingredients: ["Sugarcane", "Sugarcane", "Sugarcane", "Sugarcane", "Sugarcane"], tags: ["raid"], image: "lunas-cotton-candy.png" },
  { name: "Cheesecake", rarity: "Rare dessert", category: "Dessert", effect: "Wyvern damage +20(+5)%", ingredients: ["Cheese", "Egg", "Wheat", "Wheat", "Milk"], tags: ["raid"], image: "cheesecake.jpg" },
  { name: "Tomato Basil Ade", rarity: "Legendary dessert", category: "Dessert", effect: "Wyvern damage +30(+10)%", ingredients: ["Basil", "Tomato", "Tomato", "Tomato"], tags: ["raid"], image: "tomato-basil-ade.png" },
  { name: "PB&J", rarity: "Mythic dessert", category: "Dessert", effect: "Wyvern damage +40%", ingredients: ["Peanut", "Strawberry", "Wheat"], tags: ["raid"], image: "question-62.png" },
  { name: "Honey Frozen Yogurt", rarity: "Immortal dessert", category: "Dessert", effect: "Wyvern damage +50(+20)%", ingredients: ["Honeycomb", "Milk", "Milk", "Milk"], tags: ["raid"], image: "honey-frozen-yogurt.jpg" }];

const ingredientDefaults = [
  ["Wheat", "Exploration material", true, "wheat.jpg"], ["Meat", "Exploration material", true, "meat.jpeg"], ["Lettuce", "Exploration material", true, "lettuce.jpg"],
  ["Milk", "Exploration material", true, "milk.jpg"], ["Egg", "Exploration material", true, "egg.jpg"], ["Potato", "Exploration material", false, "potato.jpg"],
  ["Tomato", "Exploration material", false, "tomato.jpg"], ["Shrimp", "Exploration material", false, "shrimp.jpg"], ["Rice", "Exploration material", false, "rice.jpg"],
  ["Peanut", "Exploration material", false, "peanut.jpg"], ["Corn", "Exploration material", false, "corn.jpg"], ["Strawberry", "Exploration material", false, "strawberry.jpg"],
  ["Sugarcane", "Exploration material", false, "sugarcane.jpg"], ["Cheese", "Exploration material", false, "cheese.jpg"], ["Chili", "Lava Mountains", false, "chili.jpg"],
  ["Tuna", "Ice Vale", false, "tuna.jpg"], ["Basil", "Wind Cliff", false, "basil.jpg"], ["Cacao", "Wasteland Plateau", false, "cacao.jpg"],
  ["Caviar", "All regions", false, "caviar.jpg"], ["Truffle", "All regions", false, "truffle.jpg"], ["Honeycomb", "All regions", false, "honeycomb.jpg"],
] as const;
const rarityPalette = { gray: ["#9ca3af", "#4b5563"], green: ["#4ade80", "#166534"], purple: ["#c084fc", "#581c87"], red: ["#f87171", "#7f1d1d"], blue: ["#60a5fa", "#1e3a8a"], gold: ["#fbbf24", "#92400e"] } as const;
const rarityOf: Record<string, keyof typeof rarityPalette> = { Wheat: "gray", Meat: "gray", Lettuce: "gray", Milk: "gray", Egg: "green", Potato: "purple", Tomato: "purple", Shrimp: "purple", Rice: "purple", Peanut: "purple", Corn: "purple", Strawberry: "purple", Sugarcane: "purple", Cheese: "red", Chili: "blue", Tuna: "blue", Basil: "blue", Cacao: "blue", Caviar: "gold", Truffle: "gold", Honeycomb: "gold" };
const ingredientInfo: Record<string, [string, string]> = { Wheat: ["Wheat, which can be obtained through Exploration. It looks good to use as a dough ingredient.", "[Exploration] [Rune]"], Meat: ["Meat obtained through exploration. It seems it can provide great strength.", "[Exploration] [Rune]"], Lettuce: ["Lettuce, which can be obtained through Exploration. It looks like it could add a crisp texture.", "[Exploration] [Rune]"], Milk: ["Milk, which can be obtained through Exploration. It can be used to create a smooth taste.", "[Exploration] [Rune]"], Egg: ["A wyvern egg rumored to be valuable. It might break, so be careful.", "[Exploration] [Rune]"], Potato: ["Potatoes that can be found through Exploration. They must fill you up.", "[Arwen] [Rune]"], Tomato: ["Tomatoes, which can be obtained through Ingredient Exchange. They look like they could add a tangy taste.", "[Arwen] [Rune]"], Shrimp: ["Shrimp, which can be obtained through Ingredient Exchange. They look like they could add a springy texture.", "[Gene] [Rune]"], Rice: ["Rice, which can be obtained through Ingredient Exchange. Cooked up, it looks quite hearty.", "[Gene] [Rune]"], Peanut: ["Peanuts, which can be obtained through Ingredient Exchange. They look like they could add a nutty taste.", "[Rosa] [Rune]"], Corn: ["Corn, which can be obtained through Ingredient Exchange. It looks like it could add a satisfying pop.", "[Rosa] [Rune]"], Strawberry: ["Strawberries, which can be obtained through Ingredient Exchange. They look like they could add a sweet and tangy taste.", "[Cedric] [Rune]"], Sugarcane: ["Sugarcane obtained through exploration. Tricky to use, but it could be a good substitute for honeyberries.", "[Cedric] [Rune]"], Cheese: ["Cheese aged over a long time. It has a deep, savory richness.", "[Exploration] [Rune]"], Chili: ["A chili pepper ripened flame-red. One bite looks like it would set your mouth on fire.", "[Lava Mountains] [Rune]"], Tuna: ["A tuna raised roaming the cold seas. The flesh looks thick and rich.", "[Ice Vale] [Rune]"], Basil: ["Basil with a fresh, green fragrance. Added to a dish, it looks like it would bring the flavor to life.", "[Wind Cliff] [Rune]"], Cacao: ["Cacao with a deep aroma. Prepared well, it looks like it could give a bittersweet taste.", "[Wasteland Plateau] [Rune]"], Caviar: ["Caviar, known to be valuable. Even a tiny amount would make the taste special.", "[Rune]"], Truffle: ["A truffle, known to be valuable. It looks like it could add a distinctive, deep aroma.", "[Rune]"], Honeycomb: ["A honeycomb, known to be valuable. It looks like it could give a rich, sweet taste.", "[Rune]"] };

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
    icon: "ᛟ",
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
    icon: "ᛞ",
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
    icon: "ᛗ",
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
  ingredients?: { cabbage?: number; meat?: number; wheat?: number; salt?: number; egg?: number };
};

const mainDishes: MainDish[] = [
  { name: "Bubble Hotpot", priority: 1, image: "bubble-hotpot.png", effect: "Increase the amount of Ingredients obtained from Exploration.", ingredients: { cabbage: 30, meat: 10, salt: 60, egg: 1 } },
  { name: "Sandwich", priority: 2, image: "sandwich.png", effect: "ATK SPD increase while the Wyvern is preparing its powerful attack", ingredients: { cabbage: 40, meat: 10, wheat: 250, egg: 1 } },
  { name: "Immortal Steak", priority: 3, image: "immortal-steak.png", effect: "Increases DMG to Wyvern.", ingredients: { meat: 30, wheat: 100, egg: 1 } },
  { name: "BBQ Ribs", priority: 4, image: "bbq-ribs.png", effect: "Dmg increase every 20 sec after entering the Raid", ingredients: { cabbage: 30, meat: 25, egg: 1 } },
  { name: "Savory Hotdog", priority: 5, image: "savory-hotdog.png", effect: "Additional DMG after Wyvern fails a powerful attack", ingredients: { cabbage: 30, meat: 10, wheat: 200, salt: 100 } },
  { name: "Hellfire Curry", priority: "E", image: "hellfire-curry.png", effect: "Increases Fire Attribute DMG to Wyvern", ingredients: { cabbage: 20, meat: 15, salt: 140 } },
  { name: "Water Slash Soup", priority: "E", image: "water-slash-soup.png", effect: "Increases Water Attribute DMG to Wyvern", ingredients: { cabbage: 20, wheat: 100, salt: 160 } },
  { name: "Thunderbolt Burger", priority: "E", image: "thunderbolt-burger.png", effect: "Increases Wind Attribute DMG to Wyvern", ingredients: { cabbage: 40, meat: 20, wheat: 200 } },
  { name: "Demon Pizza", priority: "E", image: "demon-pizza.png", effect: "Increases Earth Attribute DMG to Wyvern", ingredients: { meat: 10, wheat: 150, salt: 80, egg: 2 } },
];

type Stage = "Early" | "Mid" | "Late";

const skillsByStage: Record<Stage, string[]> = {
  Early: ["Hell Fire Slash", "Giga Strike", "Red Lightning", "Burning Sword", "Curved Blade", "Meditation", "Speed Sword", "Earth's Will"],
  Mid: ["Rave", "Flame Slash", "Hell Fire Slash", "Burning Sword", "Curved Blade", "Meditation", "Strong Current", "Wrath of Gods", "Speed Sword", "Earth's Will"],
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
  "Flame Slash": "flame-slash.png",
  "Warrior Burn": "warrior-burn.png",
  "Earth's Will": "earths-will.png",
  "Hell Fire Slash": "hell-fire-slash.png",
  "Curved Blade": "curved-blade.png",
  "Rave": "rave.png",
  "Strong Current": "strong-current.png",
};

// Skill rarity → static glow color on SkillThumb's icon.
type SkillRarity = "common" | "rare" | "epic" | "legendary" | "mythic" | "immortal";

const skillRarity: Record<string, SkillRarity> = {
  "Burning Sword": "rare",
  "Flame Slash": "rare",
  "Speed Sword": "rare",
  "Earth's Will": "rare",
  "Curved Blade": "epic",
  "Hell Fire Slash": "legendary",
  "Giga Strike": "legendary",
  "Red Lightning": "legendary",
  "Meditation": "legendary",
  "Demon Hunt": "mythic",
  "Strong Current": "mythic",
  "Wrath of Gods": "mythic",
  "Warrior Burn": "mythic",
  "Rave": "immortal",
};

// Rarity → overlay frame image, placed in /public/skills/frames/. No entry means no overlay (plain slot).
const rarityFrame: Partial<Record<SkillRarity, string>> = {
  rare: "frame-rare-epic.png",
  epic: "frame-rare-epic.png",
  legendary: "frame-legendary.png",
  mythic: "frame-mythic.png",
  immortal: "frame-immortal.png",
};

// Rarity → glow, applied as a drop-shadow FILTER on the skill ICON <img> itself
// (not the frame overlay). drop-shadow follows the icon PNG's alpha channel, so the
// glow radiates from the actual artwork silhouette. Two stacked drop-shadows
// (tight + wide) give it some depth. Static only — no animation.
const rarityGlow: Record<SkillRarity, string> = {
  common: "",
  rare: "drop-shadow(0 0 3px rgba(59,130,246,1)) drop-shadow(0 0 8px rgba(59,130,246,0.75))",       // blue (Water Slash)
  epic: "drop-shadow(0 0 3px rgba(167,139,250,1)) drop-shadow(0 0 8px rgba(167,139,250,0.8))",       // violet (Dancing Waves) — unchanged
  legendary: "drop-shadow(0 0 4px rgba(239,68,68,1)) drop-shadow(0 0 10px rgba(239,68,68,0.85))",    // red (Hellfire Slash) — unchanged
  mythic: "drop-shadow(0 0 4px rgba(45,212,191,1)) drop-shadow(0 0 10px rgba(45,212,191,0.85))",     // cyan/teal (Pillar of Fire)
  immortal: "drop-shadow(0 0 5px rgba(255,199,74,1)) drop-shadow(0 0 12px rgba(255,199,74,0.9))",    // golden yellow (Rave) — unchanged
};

// Rarity → frame size, as a scale factor applied to the frame overlay image via
// CSS transform (centered by default). 1 = frame exactly fills the icon box, same
// as before. >1 grows the frame outward past the icon box edges (e.g. 1.15 = 15%
// bigger); <1 shrinks it inward. Tune per rarity here — no markup changes needed.
const frameScale: Partial<Record<SkillRarity, number>> = {
  rare: 1.12,
  epic: 1.12,
  legendary: 1.12,
  mythic: 1.20,
  immortal: 1.20,
};

type Spirit = { name: string; frames: string[] };

const spirits: Spirit[] = [
  { name: "Sala", frames: ["sala-1.png", "sala-2.png", "sala-3.png", "sala-4.png"] },
  { name: "Noah", frames: ["noah-1.png", "noah-2.png", "noah-3.png", "noah-4.png"] },
  { name: "Loar", frames: ["loar-1.png", "loar-2.png", "loar-3.png", "loar-4.png"] },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow mb-2">{children}</p>;
}

function Card({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <section className={`pixel-border bg-dv-panel/95 shadow-pixel ${className}`} style={style}>{children}</section>;
}

const mealChipPalette: Record<string, [string, string, string]> = {
  common: ["#1f2430", "#d1d5db", "#3b414a"],
  great: ["#0f2a1c", "#86efac", "#1f6b3f"],
  rare: ["#2e1a08", "#fdba74", "#9a4a12"],
  epic: ["#2a1750", "#d8b4fe", "#5b2a8c"],
  legendary: ["#3b0f0b", "#fca5a5", "#7a1f12"],
  immortal: ["#3a2d06", "#fde68a", "#5a4a12"],
  mythic: ["#0b1a4a", "#a5b4fc", "#1e3a8a"],
};
function mealChipStyle(rarity?: string): React.CSSProperties | undefined {
  const p = mealChipPalette[(rarity || "").split(" ")[0].toLowerCase()];
  return p ? { background: p[0], color: p[1], borderColor: p[2] } : undefined;
}
const mealRarityPalette: Record<string, [string, string, string]> = {
  common: ["#0e1014", "#3b414a", "#9ca3af"],
  great: ["#04140c", "#1f6b3f", "#4ade80"],
  rare: ["#140a03", "#9a4a12", "#f97316"],
  epic: ["#0d0a1a", "#5b2a8c", "#a855f7"],
  legendary: ["#0f0404", "#7a1f12", "#ef4444"],
  immortal: ["#17140a", "#5a4a12", "#fbbf24"],
  mythic: ["#050a1e", "#0b2a6b", "#4a6cff"],
};
function MealThumb({ image, name, rarity }: { image?: string; name: string; rarity?: string }) {
  const palette = mealRarityPalette[(rarity || "").split(" ")[0].toLowerCase()];
  const glows = palette === mealRarityPalette.epic || palette === mealRarityPalette.legendary || palette === mealRarityPalette.immortal || palette === mealRarityPalette.mythic;
  const frameStyle: React.CSSProperties | undefined = palette
    ? { background: "radial-gradient(circle at 50% 55%, " + palette[2] + "55 0%, transparent 65%), linear-gradient(180deg, " + palette[0] + ", " + palette[1] + ")", borderColor: palette[2], borderWidth: 2, borderStyle: "solid", borderRadius: 10, boxShadow: glows ? "0 0 8px " + palette[2] + "70" : undefined }
    : undefined;
  return (
    <div className="pixel-frame item-slot h-14 w-14 shrink-0 overflow-hidden" style={frameStyle}>
      {image ? (
        <img src={"/meals/" + image} alt={name} className="h-full w-full object-cover" style={{ imageRendering: "pixelated" }} />
      ) : (
        <div className="grid h-full w-full place-items-center text-[10px] text-slate-300/40">?</div>
      )}
    </div>
  );
}

function IngredientIcon({ image, name, style }: { image: string; name: string; style?: React.CSSProperties }) {
  return (
    <div className="pixel-frame item-slot h-8 w-8 shrink-0 overflow-hidden" style={style}>
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

function SpiritSprite({ spirit }: { spirit: Spirit }) {
  return (
    <div className="relative h-full w-full">
      {spirit.frames.map((f, i) => (
        <img
          key={f}
          src={"/spirits/" + f}
          alt={spirit.name}
          className="absolute inset-0 h-full w-full object-cover spirit-frame"
          style={{
            imageRendering: "pixelated",
            animationDelay: `${-i * 150}ms`,
          }}
        />
      ))}
    </div>
  );
}

export function Guide() {
  const [open, setOpen] = useState<string[]>([guideSections[0][0], guideSections[1][0]]);
  return (
    <div className="space-y-4">
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

const dishOrder = ["Savory Hotdog", "BBQ Ribs", "Sandwich", "Immortal Steak", "Hellfire Curry", "Water Slash Soup", "Thunderbolt Burger", "Demon Pizza", "Bubble Hotpot"];

export function MainCooking() {
  const sorted = useMemo(
    () => [...mainDishes].sort((a, b) => dishOrder.indexOf(a.name) - dishOrder.indexOf(b.name)),
    []
  );
  const [selected, setSelected] = useState<{ name: string; x: number; top: number; bottom: number } | null>(null);
  const open = sorted.find((d) => d.name === selected?.name) ?? null;
  const popupWidth = Math.min(300, window.innerWidth - 16);

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
      <Card className="p-4">
        <div className="grid grid-cols-3 gap-3">
          {sorted.map((dish) => {
            const isSelected = dish.name === selected?.name;
            return (
              <button
                key={dish.name}
                type="button"
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setSelected({ name: dish.name, x: r.left + r.width / 2, top: r.top, bottom: r.bottom });
                }}
                className={`flex flex-col items-center rounded-md bg-transparent p-1 text-center focus:outline-none ${
                  isSelected ? "border-dv-brass bg-dv-brass/10" : "border-dv-line"
                }`}
              >
                <div className={`rounded-md ${isSelected ? "ring-1 ring-dv-brass" : ""}`}><MainDishThumb image={dish.image} name={dish.name} priority={dish.priority} /></div>
                <span className="mt-1.5 text-[11px] leading-tight text-dv-brassLight">{dish.name}</span>
              </button>
            );
          })}
        </div>
      </Card>
      {open && selected && (
        <div onClick={() => setSelected(null)} className="fixed inset-0 z-50">
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              ...(selected.bottom < window.innerHeight / 2
                ? { top: selected.bottom + 8 }
                : { bottom: window.innerHeight - selected.top + 8 }),
              left: Math.min(Math.max(selected.x - popupWidth / 2, 8), window.innerWidth - popupWidth - 8),
              width: popupWidth,
            }}
            className="fixed rounded-xl border border-dv-line bg-black/90 p-4 text-xs text-dv-brassLight"
          >
            <p className="font-bold uppercase leading-relaxed tracking-wider text-dv-brassLight">{open.effect}</p>
            {open.ingredients && (
              <div className="mt-3 space-y-1.5 text-slate-200/80">
                {Object.entries(open.ingredients).map(([key, amount]) => (
                  <p key={key} className="uppercase tracking-wider">
                    {key} <span className="text-dv-brassLight">{amount}</span>
                  </p>
                ))}
              </div>
            )}
            {open.priority === "E" && (
              <p className="mt-3 text-[10px] uppercase tracking-wider text-dv-emerald">Elemental, cook last</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Icon and frame are separate absolutely-positioned layers in an unclipped h-14 w-14
// wrapper. The icon's wrapper uses only `item-slot` (background/border, no clip) —
// NOT `pixel-frame`, which bakes in overflow:hidden and would clip the icon's own
// drop-shadow glow. Trade-off: the icon's square corners are no longer masked to the
// slot's rounded corners; for these small pixel-art icons that's generally not
// noticeable, but flag if you want the rounding back a different way.
// Frame size is independently tunable via `frameScale` (a CSS transform: scale()),
// so it can grow/shrink relative to the icon without touching this markup.
function SkillThumb({ image, name }: { image?: string; name: string }) {
  const rarity = skillRarity[name] ?? "common";
  const frame = rarityFrame[rarity];
  const scale = frameScale[rarity] ?? 1;
  return (
    <div className="relative h-10 w-10 shrink-0">
      <div className="item-slot rounded-md h-full w-full">
        {image ? (
          <img
            src={"/skills/" + image}
            alt={name}
            className="h-full w-full object-cover rounded-md"
            style={{ imageRendering: "pixelated", filter: rarityGlow[rarity] || undefined }}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-[10px] text-slate-300/40">?</div>
        )}
      </div>
      {frame && (
        <img
          src={"/skills/frames/" + frame}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ imageRendering: "pixelated", transform: scale !== 1 ? `scale(${scale})` : undefined }}
        />
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
        <h2 className="text-xl text-dv-brassLight">Build a different skill set for each stage.</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-200/65">
          Early, mid, and late game each get their own set. Swap as the fight gets harder.
        </p>
      </Card>

      <p className="eyebrow mb-4 text-dv-emerald">ᚨ SKILLS</p>
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
        <div className="grid grid-cols-4 gap-2 p-4">
          {skillsByStage[stage].map((name, index) => (
            <div key={`${name}-${index}`} className="flex flex-col items-center gap-1.5 text-center">
              <SkillThumb image={skillImages[name]} name={name} />
              <span className="text-[10px] leading-tight text-dv-brassLight">{name}</span>
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
      <Card>
        <div className="grid grid-cols-3 gap-4 p-4 sm:grid-cols-3">
          {spirits.map((spirit) => (
            <div key={spirit.name} className="flex flex-col items-center gap-2 text-center">
              <div className="pixel-frame item-slot h-11 w-11 overflow-hidden">
                <SpiritSprite spirit={spirit} />
              </div>
              <span className="text-[10px] leading-tight text-dv-brassLight">{spirit.name}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function Meals() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "Appetizer" | "Main dish" | "Dessert">("Appetizer");
  const [owned, setOwned] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("dv-command-ingredients") ?? "{}"); } catch { return {}; }
  });
  useEffect(() => { localStorage.setItem("dv-command-ingredients", JSON.stringify(owned)); }, [owned]);
  const [qty, setQty] = useState<Record<string, string>>(() => { try { return JSON.parse(localStorage.getItem("dv-command-quantities") || "{}"); } catch { return {}; } }); useEffect(() => { localStorage.setItem("dv-command-quantities", JSON.stringify(qty)); }, [qty]);
const [selected, setSelected] = useState<{ name: string; x: number; y: number } | null>(null);
  const ingredients = ingredientDefaults.map(([name, source, defaultOwned, image]) => ({ name, source, image, owned: qty[name] !== undefined ? Number(qty[name]) > 0 : (owned[name] ?? defaultOwned) }));
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

  const cookableIn = (cat: string) => meals.filter((m) => { if (m.category !== cat) return false; const need: Record<string, number> = {}; m.ingredients.forEach((n) => { need[n] = (need[n] ?? 0) + 1; }); const have = (n: string) => { const q = qty[n]; if (q !== undefined && q !== "") return Number(q) || 0; return ingredients.find((i) => i.name === n)?.owned ? need[n] : 0; }; return m.ingredients.length > 0 && Object.keys(need).every((n) => have(n) >= need[n]); }).length;
  const filterTabs: { value: "all" | "Appetizer" | "Main dish" | "Dessert"; label: string }[] = [
    { value: "Appetizer", label: "Appetizer" },
    { value: "Main dish", label: "Main" },
    { value: "Dessert", label: "Dessert" },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <SectionLabel>PROVISIONS / SEASON 5</SectionLabel>
        <h2 className="text-xl text-dv-brassLight">Cook with what you have.</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-200/65">
          Enter what you have in your inventory and the tabs show how many meals you can cook right now.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Card>
          <div className="border-b border-dv-line p-4">
            <div className="relative"><svg aria-hidden="true" viewBox="0 0 16 16" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dv-brassLight" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" /></svg><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search meals by name" className="w-full rounded-xl border border-dv-line bg-dv-panel2 pl-9 pr-9 py-3 text-xs text-dv-brassLight outline-none placeholder:text-slate-300/50 focus:border-dv-brassLight" />{query ? <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-300/60">×</button> : null}</div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {filterTabs.map(({ value, label }) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`border px-2 py-2 text-center text-[9px] uppercase ${
                    filter === value ? "border-dv-violet border-b-[3px] bg-dv-violet/15 text-dv-brassLight" : "border-dv-line bg-dv-panel2 text-slate-300/60"
                  }`}
                >
                  {label}<span className={`ml-1.5 rounded px-1.5 py-0.5 text-[9px] ${cookableIn(value) > 0 ? "bg-green-700 text-green-100" : "bg-dv-line text-slate-300/70"}`}>{cookableIn(value)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-dv-line">
            {visible.map(({ meal, index }) => {
              const need: Record<string, number> = {};
              meal.ingredients.forEach((n) => { need[n] = (need[n] ?? 0) + 1; });
              const haveOf = (n: string) => {
                const q = qty[n];
                if (q !== undefined && q !== "") return Number(q) || 0;
                return ingredients.find((i) => i.name === n)?.owned ? need[n] : 0;
              };
              const ready = meal.ingredients.length > 0 && Object.keys(need).every((n) => haveOf(n) >= need[n]);
              return (
                <article key={`${meal.name}-${index}`} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div role="button" tabIndex={0} onClick={(e) => { const el = (e.currentTarget.firstElementChild ?? e.currentTarget) as HTMLElement; const r = el.getBoundingClientRect(); setSelected({ name: meal.name, x: r.left + 120, y: r.bottom - 4 }); }} className="flex cursor-pointer items-start gap-3">
                      <MealThumb image={meal.image} name={meal.name} rarity={meal.rarity} />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm text-dv-brassLight">{meal.name}</h3>
                          <span className="status-chip" style={mealChipStyle(meal.rarity)}>{meal.rarity}</span>
                        </div>
                        <p className="mt-2 text-xs text-dv-emerald">{meal.effect}</p>
                      </div>
                    </div>
                  <div className={"w-[76px] shrink-0 rounded-lg border px-1 py-2 text-center text-[8px] uppercase leading-tight " + (ready ? "border-dv-emerald bg-dv-emerald/10 text-dv-emerald" : "border-red-400/50 bg-red-500/10 text-red-300/80")}>
                      {ready ? "Can Be Cooked" : "Missing Ingredients"}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {Object.entries(need).map(([item, n]) => {
                      const have = haveOf(item);
                      const ok = have >= n;
                      const img = ingredientDefaults.find((d) => d[0] === item)?.[3];
                      
                      return (
                        <span
                          key={item}
                          className={"flex items-center gap-1 rounded-lg px-1 py-0.5 text-[8px] " + (ok ? "border border-dv-brass bg-dv-brass/15 text-dv-brassLight" : "border border-dv-line bg-dv-panel2 text-slate-300/65")}
                        >
                          {img ? <img src={"/ingredients/" + img} alt="" className="h-4 w-4 object-cover" style={{ imageRendering: "pixelated" }} /> : null}
                          <span>{item}</span>
                          <span style={{ color: ok ? "#6ee7b7" : "#f87171" }}>{Math.min(have, n)}/{n}</span>
                        </span>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </Card>

        <Card className="order-first h-fit p-4 lg:order-none">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <SectionLabel>YOUR INVENTORY</SectionLabel>
              <p className="text-sm text-dv-brassLight">Ingredient ownership</p>
            </div>
            <span className="text-[10px] text-dv-emerald">
              {ingredients.filter((item) => item.owned).length}/{ingredients.length}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
          {selected && (
            <div onClick={() => setSelected(null)} className="fixed inset-0 z-50">
              <div onClick={(e) => e.stopPropagation()} style={{ top: selected.y + 8, left: Math.min(Math.max(selected.x - 120, 8), window.innerWidth - 248), width: 240 }} className="fixed rounded-xl border border-dv-line bg-black/85 p-3 text-xs text-dv-brassLight">
                                {ingredientInfo[selected.name] ? <p className="font-semibold">{selected.name}</p> : null}
                <p className={ingredientInfo[selected.name] ? "mt-2" : ""}>{ingredientInfo[selected.name]?.[0] ?? descFor(selected.name)}</p>
                {ingredientInfo[selected.name]?.[1] ? <p className="mt-2 text-[10px] text-dv-emerald">{ingredientInfo[selected.name]?.[1]}</p> : null}
              </div>
            </div>
          )}
            {ingredients.map((ingredient) => (
              <div key={ingredient.name} className={`flex flex-col items-center gap-1 ${ingredient.name === "Cheese" || ingredient.name === "Caviar" ? "col-start-1" : ""}`}>
                <div title={ingredient.name} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setSelected({ name: ingredient.name, x: r.left + r.width / 2, y: r.bottom }); }} className={`p-1 ${Number(qty[ingredient.name]) > 0 ? "" : "opacity-60"}`}>
                  <IngredientIcon image={ingredient.image} name={ingredient.name} style={{ width: 48, height: 48, padding: 6, background: `linear-gradient(180deg, ${rarityPalette[rarityOf[ingredient.name] ?? "gray"][0]}55, ${rarityPalette[rarityOf[ingredient.name] ?? "gray"][1]})`, borderColor: rarityPalette[rarityOf[ingredient.name] ?? "gray"][0], boxShadow: rarityOf[ingredient.name] === "gold" ? "0 0 8px #fbbf24" : undefined }} />
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={qty[ingredient.name] ?? ""}
                  placeholder="0"
                  onChange={(event) => setQty((current) => ({ ...current, [ingredient.name]: event.target.value }))}
                  className="w-12 border border-dv-line bg-dv-panel2 px-0 py-1 text-center text-[10px] text-dv-brassLight outline-none focus:border-dv-violet"
                />
              </div>
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
              <span className={`text-lg leading-none ${style.text}`}>{tier.icon}</span>
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
