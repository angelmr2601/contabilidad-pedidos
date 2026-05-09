import { NextRequest, NextResponse } from "next/server";

function unauthorized() {
  return new NextResponse("Autenticación requerida", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Contabilidad Pedidos"',
    },
  });
}

export function proxy(request: NextRequest) {
  // En local no pedimos contraseña
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  const username = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASSWORD;

  if (!username || !password) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return unauthorized();
  }

  const [scheme, encoded] = authHeader.split(" ");

  if (scheme !== "Basic" || !encoded) {
    return unauthorized();
  }

  const decoded = atob(encoded);
  const [providedUsername, providedPassword] = decoded.split(":");

  if (providedUsername !== username || providedPassword !== password) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};