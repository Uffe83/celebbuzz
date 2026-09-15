import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const username = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;

  // Fail closed if admin credentials are not configured.
  if (!username || !password) {
    return new NextResponse("Admin credentials are not configured.", {
      status: 500,
    });
  }

  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Basic ")) {
    return unauthorized();
  }

  try {
    const encodedCredentials = authorization.slice("Basic ".length);
    const credentials = atob(encodedCredentials);
    const separator = credentials.indexOf(":");

    if (separator === -1) {
      return unauthorized();
    }

    const suppliedUsername = credentials.slice(0, separator);
    const suppliedPassword = credentials.slice(separator + 1);

    if (
      suppliedUsername !== username ||
      suppliedPassword !== password
    ) {
      return unauthorized();
    }

    return NextResponse.next();
  } catch {
    return unauthorized();
  }
}

function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="CelebBuzz Admin"',
    },
  });
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/fetch-news/:path*",
    "/api/articles/:path*",
  ],
};
