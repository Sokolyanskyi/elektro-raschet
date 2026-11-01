import { AppShell } from "@/components/app-shell";

// Свою metadata не экспортируем: любой page-level metadata на клиентском
// переходе заставляет Next заново применить head корневого layout, из-за чего
// сбрасывался динамический theme-color (в PWA статус-бар мигал белым).
export default function GasPage() {
  return <AppShell meter="gas" />;
}
