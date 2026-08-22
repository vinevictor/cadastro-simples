import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 dias

export type Role = "admin" | "auxiliar";

export type SessionPayload = {
  username: string;
  role: Role;
};

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET não configurado. Defina essa variável de ambiente."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(username: string, role: Role) {
  const token = await new SignJWT({ username, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    // Sessões antigas (criadas antes dos papéis existirem) não têm "role" —
    // tratamos como admin pra não deslogar quem já estava logado.
    const role = (payload.role as Role | undefined) ?? "admin";
    return { username: payload.username as string, role };
  } catch {
    return null;
  }
}

/**
 * Garante que o usuário logado é admin. Lança erro (que deve ser tratado
 * pela UI) se for auxiliar ou se não houver sessão. Usar no início de toda
 * server action que cria/edita/exclui dados.
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }
  if (session.role !== "admin") {
    throw new Error("Apenas o administrador pode fazer essa ação.");
  }
  return session;
}

export function verifyCredentials(
  username: string,
  password: string
): Role | null {
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;
  const auxUser = process.env.AUX_USERNAME;
  const auxPass = process.env.AUX_PASSWORD;

  if (!adminUser || !adminPass) {
    throw new Error(
      "ADMIN_USERNAME/ADMIN_PASSWORD não configurados nas variáveis de ambiente."
    );
  }

  if (username === adminUser && password === adminPass) {
    return "admin";
  }

  if (auxUser && auxPass && username === auxUser && password === auxPass) {
    return "auxiliar";
  }

  return null;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
