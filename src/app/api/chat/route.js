// src/app/api/chat/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    // Проверяем наличие сессии пользователя
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { model, prompt, userId } = await req.json();
    if (!model || !prompt) {
      return NextResponse.json(
        { error: "Missing model or prompt" },
        { status: 400 }
      );
    }

    // Если клиент передал чужой userId, отказываем
    if (userId && userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let responseText;
    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
      });
      responseText = completion.choices?.[0]?.message?.content;
      if (!responseText) throw new Error("Empty response from OpenAI");
    } catch (err) {
      // Ловим превышение квоты
      if (err.status === 429) {
        return NextResponse.json(
          { error: "Превышена квота OpenAI. Проверьте баланс или тариф." },
          { status: 429 }
        );
      }
      // другие ошибки пробросим дальше
      throw err;
    }

    // Сохраняем запрос и ответ в БД от имени текущего пользователя
    const record = await prisma.request.create({
      data: { userId: session.user.id, prompt, model, response: responseText },
    });
    return NextResponse.json(record);
  } catch (err) {
    console.error("API /api/chat error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: err.status || 500 }
    );
  }
}
