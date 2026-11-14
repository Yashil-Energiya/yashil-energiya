"use client";

import s from "./TheLanguageSwitcher.module.scss";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import cn from "classnames";
import { useTransition } from "react";
import { markLocaleTransition } from "@/lib/locale-transition";

export const TheLanguageSwitcher = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("LocaleSwitcher");
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) return;

    startTransition(() => {
      markLocaleTransition();
      router.replace({ pathname }, { locale: newLocale, scroll: false });
    });
  };

  return (
    <div className={s.languageList}>
      {routing.locales.map((cur) => (
        <button
          key={cur}
          type="button"
          disabled={isPending}
          onClick={(e) => {
            e.preventDefault();
            handleLanguageChange(cur);
          }}
          className={cn(s.language, { [s.active]: locale === cur })}
        >
          {t(cur)}
        </button>
      ))}
    </div>
  );
};
