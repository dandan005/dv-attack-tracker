"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SplashPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/dashboard");
      } else {
        setChecking(false);
      }
    });
  }, []);

  async function loginWithDiscord() {
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="pixel-frame pixel-border bg-dv-panel shadow-pixel p-8 max-w-sm w-full animate-rise">
        <div className="text-4xl mb-4">🐲</div>
        <h1 className="text-sm sm:text-base text-dv-emerald mb-2 leading-relaxed">
          DRAGON VALLEY
        </h1>
        <p className="text-[10px] text-dv-brassLight mb-8">ATTACK LOG TRACKER</p>

        {checking ? (
          <p className="text-[10px] text-dv-brassLight animate-blink">LOADING...</p>
        ) : (
          <button
            onClick={loginWithDiscord}
            className="w-full pixel-frame bg-[#5865F2] text-white text-[10px] py-4 shadow-pixel-sm active:translate-y-[2px]"
          >
            LOGIN WITH DISCORD
          </button>
        )}
      </div>
      <p className="text-[8px] text-dv-brass mt-6">for Slayer Legend guilds</p>
    </main>
  );
}
