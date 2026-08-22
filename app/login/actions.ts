"use server";

import { redirect } from "next/navigation";
import { createSession, verifyCredentials } from "@/lib/auth";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Preencha usuário e senha." };
  }

  let role: ReturnType<typeof verifyCredentials> = null;
  try {
    role = verifyCredentials(username, password);
  } catch {
    return {
      error:
        "Credenciais não configuradas no servidor. Defina ADMIN_USERNAME e ADMIN_PASSWORD."
    };
  }

  if (!role) {
    return { error: "Usuário ou senha inválidos." };
  }

  await createSession(username, role);
  redirect("/");
}
