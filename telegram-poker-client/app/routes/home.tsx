import type { Route } from "./+types/home";
import { useEffect, useState, Suspense, lazy } from "react";
import { Welcome } from "../welcome/welcome";
import { backButton, viewport, init } from "@telegram-apps/sdk";

const DealerBoard = lazy(
  () => import("../components/Multi-Stream Manager/DealerBoard"),
);

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    try {
      // 1. Сначала инициализируем SDK
      init();

      // 2. Теперь можно работать с viewport
      // Важно: в новых версиях методы могут быть асинхронными или требовать проверки готовности
      if (viewport.expand.isAvailable()) {
        viewport.expand();
      }
    } catch (e) {
      console.error("Ошибка инициализации Telegram SDK:", e);
    }
  }, []);

  if (!isClient) return <div style={{ background: "#000", height: "100vh" }} />;
  return (
    <div className="App">
      <Suspense fallback={<div>Loading Dashboard...</div>}>
        <DealerBoard />
      </Suspense>
    </div>
  );
}
