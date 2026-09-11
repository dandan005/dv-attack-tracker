import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const isProtectedPage = pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  if (isProtectedPage) {
    if (!user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const { data: member } = await supabase
      .from("members")
      .select("discord_id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (!member) {
      return NextResponse.redirect(new URL("/?error=guild_only", request.url));
    }

    try {
      const { isDiscordGuildMember } = await import("@/lib/discord");
      if (!(await isDiscordGuildMember(member.discord_id))) {
        return NextResponse.redirect(new URL("/?error=guild_only", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/?error=guild_verification_failed", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/|.*\\.(?:png|jpg|jpeg|svg|gif|webp)$).*)",
  ],
};
