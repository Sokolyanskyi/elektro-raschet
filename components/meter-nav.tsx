"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "./i18n-provider";
import { BoltIcon, FuelIcon } from "./icons";

/** Переключатель страниц счётчиков: электроэнергия и газ. */
export function MeterNav() {
  const { t } = useI18n();
  const pathname = usePathname();
  const gasActive = pathname?.startsWith("/gas") ?? false;

  return (
    <nav className="meter-nav" aria-label={t("nav.meterLabel")}>
      <Link
        href="/"
        className={`meter-nav-tab ${!gasActive ? "is-active" : ""}`}
        aria-current={!gasActive ? "page" : undefined}
      >
        <BoltIcon width={15} height={15} />
        {t("form.tabElectricity")}
      </Link>
      <Link
        href="/gas"
        className={`meter-nav-tab ${gasActive ? "is-active" : ""}`}
        aria-current={gasActive ? "page" : undefined}
      >
        <FuelIcon width={15} height={15} />
        {t("form.tabGas")}
      </Link>
    </nav>
  );
}
