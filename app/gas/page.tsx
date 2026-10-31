import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Gas — meter readings & payments",
};

export default function GasPage() {
  return <AppShell meter="gas" />;
}
