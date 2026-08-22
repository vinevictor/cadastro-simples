import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "session";
const PUBLIC_PATHS = ["/login"];

// Rotas que só o admin pode acessar (auxiliares são bloqueados e voltam pra home)
const ADMIN_ONLY_PATTERNS = [
  /^\/children\/new/,
  /^\/children\/[^/]+\/edit/,
  /^\/groups/
];

function getSecretKey() {
  const secret = process.env.AUTH_SECRET ?? "";
  return new TextEncoder().encode(secret);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  const token = request.cookies.get(COOKIE_NAME)?.value;
  let isAuthenticated = false;
  let role: string | undefined;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecretKey());
      isAuthenticated = true;
      role = (payload.role as string | undefined) ?? "admin";
    } catch {
      isAuthenticated = false;
    }
  }

  if (!isAuthenticated && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    isAuthenticated &&
    role !== "admin" &&
    ADMIN_ONLY_PATTERNS.some((pattern) => pattern.test(pathname))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
