"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  // Редирект если не залогинен
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/chat");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading session…</div>;
  }
  if (!session) {
    return <div>Redirecting to login…</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        userId: session.user.id,
      }),
    });

    if (!res.ok) {
      // если сервер вернул ошибку — выведем её
      const text = await res.text();
      setError(`Server error: ${text}`);
      return;
    }

    let record;
    try {
      record = await res.json();
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
      return;
    }

    if (record.error) {
      setError(`API error: ${record.error}`);
      return;
    }

    setHistory((h) => [...h, record]);
    setPrompt("");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Чат с AI</h1>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="gpt-4">GPT-4</option>
        </select>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Введите запрос..."
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 bg-blue-600 text-white rounded"
        >
          Отправить
        </button>
      </form>

      <ul className="space-y-4">
        {history.map((msg) => (
          <li key={msg.id} className="border p-4 rounded">
            <p>
              <strong>Вы ({msg.model}):</strong> {msg.prompt}
            </p>
            <p className="mt-2">
              <strong>AI:</strong> {msg.response}
            </p>
            <p className="mt-1 text-gray-500 text-sm">
              {new Date(msg.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
