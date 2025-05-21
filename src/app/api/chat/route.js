// src/app/api/chat/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

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

    // Сохраняем в БД
    const record = await prisma.request.create({
      data: { userId, prompt, model, response: responseText },
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
