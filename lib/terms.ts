// Terms and privacy text shown to guild members. Bump TERMS_VERSION whenever the text changes,
// so everyone is asked to agree again.
export const TERMS_VERSION = "2026-10-26-2";

export type LegalSection = { title: string; body: string[] };

export const TERMS: LegalSection[] = [
  {
    title: "1. About this app",
    body: [
      "Dragon Valley Attack Ledger is a community-made tool for one guild to track raid days, attacks, rune picks and guild progress.",
      "It is unofficial. It is not made, endorsed or run by the game's publisher or by Discord.",
    ],
  },
  {
    title: "2. Who can use it",
    body: [
      "Only members of the guild's Discord server can use the app. You sign in with Discord, and the app checks that you are in the guild.",
      "Discord requires users to be at least 13 years old. Do not use the app if you are younger.",
    ],
  },
  {
    title: "3. Your account",
    body: [
      "Sign in only with your own Discord account. Do not share your login or let someone else use your account.",
      "You are responsible for what is entered through your account.",
    ],
  },
  {
    title: "4. Acceptable use",
    body: [
      "Do not try to view, change or delete other members' data, except where the app's own features allow it.",
      "Do not flood the app, scrape it, or try to break or bypass its security.",
      "Do not use names, notes or messages to harass, insult or threaten anyone.",
      "Guild admins may remove or restrict access for breaking these rules.",
    ],
  },
  {
    title: "5. Accuracy",
    body: [
      "Emblem values, rune effects, cooking results and other numbers are community estimates. They may be wrong or out of date.",
      "The app does not guarantee any result in the game.",
    ],
  },
  {
    title: "6. Availability",
    body: [
      "The app is provided as it is. It may change, break, go offline or be shut down at any time.",
      "Features may be added or removed.",
    ],
  },
  {
    title: "7. Changes to these terms",
    body: [
      "These terms may change. When they do, the version number changes and you will be asked to agree again before using the app.",
    ],
  },
  {
    title: "8. Liability",
    body: [
      "To the extent the law allows, the guild admins and the people who built the app are not liable for losses or damages from using it.",
    ],
  },
  {
    title: "9. Contact",
    body: ["Questions about these terms: Discord: dandan05."],
  },
];

export const PRIVACY: LegalSection[] = [
  {
    title: "1. What we collect",
    body: [
      "From Discord sign-in: your Discord ID, display name and avatar. The app also checks whether you are in the guild. It does not read your other servers, messages or friends.",
      "Sign-in is handled by Supabase Auth, which keeps a sign-in record for your account. That record can include an email address linked to your Discord login. Members cannot see it in the app, and the app does not display it.",
      "From you: in-game level, stage, guild, custom avatar, promotion tier, daily attack logs, damage scores you enter, rune picks and settings.",
      "If you turn on notifications: a browser push subscription, so the app can send you reminders.",
      "In your browser only: small preferences such as ingredient counts and which prompts you have dismissed. These stay on that device.",
    ],
  },
  {
    title: "2. How it is used",
    body: [
      "To run the guild's raid tracking: your progress, the guild readout, rankings, reminders and notifications.",
    ],
  },
  {
    title: "3. Who can see it",
    body: [
      "Verified guild members can see other members' names, levels, stages, guild and attack logs.",
      "Admins can change members' settings and see more of the roster.",
      "The error log is visible only to the app's creator.",
      "Reminders post member names into the guild's Discord webhook channel, so anyone in that channel can see who is missing a check-in.",
    ],
  },
  {
    title: "4. Services we use",
    body: [
      "Supabase, for the database and sign-in.",
      "Vercel, for hosting the app.",
      "Discord, for sign-in and the guild reminder webhook.",
      "Your browser's push service, only if you turn on notifications.",
      "Google Fonts, which loads the app's fonts.",
    ],
  },
  {
    title: "5. How long we keep it",
    body: [
      "Error log entries are deleted after 30 days.",
      "Other data is kept while the guild uses the app, until you ask for it to be deleted or an admin removes it.",
    ],
  },
  {
    title: "6. Your choices",
    body: [
      "Turn notifications off in Settings at any time.",
      "Clear the app's data in your browser to remove the local preferences.",
      "Ask an admin, or use the contact below, to delete your account and data.",
    ],
  },
  {
    title: "7. Security",
    body: [
      "Sign-in is handled by Discord, and guild membership is checked when you sign in.",
      "The database limits who can read each table. Admin keys are kept on the server only.",
      "The error log removes tokens, keys and email addresses before saving. Error details are stored only for signed-in users.",
      "No system is perfectly secure. Use strong Discord security on your own account.",
    ],
  },
  {
    title: "8. Children",
    body: ["The app is not for anyone under 13."],
  },
  {
    title: "9. Changes and contact",
    body: [
      "If this policy changes, the version number changes and you will be asked to agree again.",
      "Contact: Discord: dandan05.",
    ],
  },
];
