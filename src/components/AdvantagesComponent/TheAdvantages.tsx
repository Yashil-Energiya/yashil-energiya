"use client";

import styles from "./TheAdvantages.module.scss";
import { useLocale, useTranslations } from "next-intl";
import { TheMotionWrapper } from "../MotionWrapper/TheMotionWrapper";
import { useEffect, useRef, useState } from "react";
import { useLocaleMotionState } from "@/lib/locale-transition";
import { numberLocale } from "@/lib/number-locale";

export const TheAdvantages = () => {
  const t = useTranslations("TheAdvantages");
  const { skipMotion, markViewed } = useLocaleMotionState(
    "home:advantages-counters",
  );

  const advantages = [
    "advantage1",
    "advantage2",
    "advantage3",
    "advantage4",
  ] as const;

  const ref = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || skipMotion || isInView) {
      if (skipMotion) {
        setIsInView(true);
        markViewed();
      }
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;

        setIsInView(true);
        markViewed();
        observer.disconnect();
      },
      { rootMargin: "0px 0px -20% 0px", threshold: 0.1 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [isInView, markViewed, skipMotion]);

  return (
    <div className={styles.main} ref={ref}>
      <TheMotionWrapper motionKey="home-advantages">
        <h3 className={styles.title}>{t("title")}</h3>
        {(skipMotion || isInView) && (
          <ul className={styles.advBlock}>
            {advantages.map((adv) => (
              <HTMLContent
                key={adv}
                title={t(`${adv}.title`)}
                total={t(`${adv}.total`)}
                unit={t(`${adv}.unit`)}
                duration={t(`${adv}.duration`)}
                skipMotion={skipMotion}
              />
            ))}
          </ul>
        )}
      </TheMotionWrapper>
    </div>
  );
};

interface HTMLContentProps {
  title: string;
  unit?: string;
  total: string;
  duration: string;
  skipMotion: boolean;
}

export const HTMLContent = ({
  title,
  unit,
  total,
  duration,
  skipMotion,
}: HTMLContentProps) => {
  const formatter = new Intl.NumberFormat(numberLocale(useLocale()));
  const target = Number(total);
  const [value, setValue] = useState(skipMotion ? target : 0);

  useEffect(() => {
    if (skipMotion) {
      setValue(target);
      return;
    }

    let frame = 0;
    let startTime = 0;
    const durationMs = Math.max(Number(duration) * 1000, 0);

    const tick = (time: number) => {
      if (!startTime) {
        startTime = time;
      }

      const progress =
        durationMs === 0 ? 1 : Math.min((time - startTime) / durationMs, 1);
      setValue(Math.round(target * progress));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [duration, skipMotion, target]);

  return (
    <li className={styles.adv}>
      <p className={styles.advTitle}>{title}</p>
      <div className={styles.box}>
        <p className={styles.numb}>{formatter.format(value)}+</p>
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>
    </li>
  );
};
