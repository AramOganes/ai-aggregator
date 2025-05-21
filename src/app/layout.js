// src/app/layout.js
import Providers from "./providers";
import "./globals.css";

export const metadata = {
  title: "AI-Агрегатор",
  description: "Чат с AI-моделями",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
