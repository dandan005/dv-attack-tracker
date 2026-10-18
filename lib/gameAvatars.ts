const HAVE = new Set(["babayagan", "gato", "raenzy", "kkmi", "kitodi", "tambaiv2", "chrollo", "crzydmndo", "mrky0099", "mirai", "slothy", "paultraits", "vicepogi", "crayon", "chrysalis", "peco", "eunoia", "eyir", "junglejuic", "aruben", "peeakyy", "dyng", "saika", "ecchigarai", "momoooo", "walkngfarm", "zannin", "boocarcake", "tanicaj", "wawekz", "myongy", "beastmarck", "ryheart", "sammie", "mangtataho", "dagor", "renzyyy23", "miir", "crzydmnd", "tambai"]);
// app username (lowercase) -> avatar file name, for when the Discord name differs from the in-game name
const ALIAS: Record<string, string> = { pagz: "junglejuic", "saikà": "saika" };

export function gameAvatar(username: string | null | undefined): string | null {
  const u = (username || "").toLowerCase();
  const f = ALIAS[u] || u;
  return HAVE.has(f) ? "/avatars/" + f + ".png" : null;
}
