// src/app/login/page.js

export const dynamic = "force-dynamic"; // вешаем на серверный компонент
export const revalidate = 0;            // и не кешировать

import LoginClient from "./LoginClient";

export default function LoginPage() {
  return <LoginClient />;
}
