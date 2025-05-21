"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/chat";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // попросим next-auth не редиректить нас автоматически 
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res.error) {
      // если провал — показываем ошибку
      setError(res.error);
    } else {
      // если ок — редиректим сами
      router.push(callbackUrl);
    }
  };

  const handleGoogle = () => {
    // для Google провайдера передаём полный callbackUrl
    signIn("google", {
      callbackUrl: window.location.origin + callbackUrl,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Вход в AI-Агрегатор</h1>
      {error && (
        <p className="mb-4 text-red-600">Ошибка входа: {error}</p>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-4 w-full max-w-sm p-6 bg-white rounded-lg shadow"
      >
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-3 border border-gray-300 rounded focus:outline-none focus:ring"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 border border-gray-300 rounded focus:outline-none focus:ring"
          required
        />
        <button
          type="submit"
          className="py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          Войти
        </button>
      </form>
      <div className="mt-6 flex flex-col items-center space-y-3">
        <button
          onClick={handleGoogle}
          className="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Войти через Google
        </button>
      </div>
    </div>
  );
}
