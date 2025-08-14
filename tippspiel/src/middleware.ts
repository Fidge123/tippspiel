import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: [
    {
      source: "/auth/((?!logout).*)",
      has: [{ type: "cookie", key: "authjs.session-token" }],
    },
    {
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|impressum|auth/|terms).+)",
      missing: [{ type: "cookie", key: "authjs.session-token" }],
    },
  ],
};
