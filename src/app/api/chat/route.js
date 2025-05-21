// src/app/api/chat/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

// Создаём клиента OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { model, prompt, userId } = await req.json();

    if (!model || !prompt || !userId) {
      return NextResponse.json(
        { error: "Missing model, prompt or userId" },
        { status: 400 }
      );
    }

    // Запуск чат-комплишенов
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = completion.choices?.[0]?.message?.content;
    if (!responseText) {
      throw new Error("Empty response from OpenAI");
    }

    // Сохраняем запрос в БД
    const record = await prisma.request.create({
      data: { userId, prompt, model, response: responseText },
    });

    return NextResponse.json(record);
  } catch (err) {
    console.error("API /api/chat error:", err);
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
