// src/app/page.js
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function HomePage() {
  // Попробуем получить сессию на сервере
  const session = await getServerSession(authOptions);

  if (!session) {
    // Если нет сессии — уводим на страницу логина
    return redirect("/login");
  }

  // Иначе — сразу в чат
  return redirect("/chat");
}

