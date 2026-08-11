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

  let valid = false;
  try {
    valid = verifyCredentials(username, password);
  } catch {
    return {
      error:
        "Credenciais não configuradas no servidor. Defina ADMIN_USERNAME e ADMIN_PASSWORD.",
    };
  }

  if (!valid) {
    return { error: "Usuário ou senha inválidos." };
  }

  await createSession(username);
  redirect("/");
}
