import { gameAvatar } from "@/lib/gameAvatars";

export const FALLBACK_AVATAR = "/icons/icon-192.png";

// Which picture a player shows: uploaded image, then picked avatar, then in-game match by name, then Discord, then fallback.
export function avatarSrc(m: {
  custom_avatar_url?: string | null;
  custom_avatar?: string | null;
  username?: string | null;
  avatar_url?: string | null;
}): string {
  return (
    m.custom_avatar_url ||
    (m.custom_avatar ? "/avatars/" + m.custom_avatar + ".png" : null) ||
    gameAvatar(m.username) ||
    m.avatar_url ||
    FALLBACK_AVATAR
  );
}
