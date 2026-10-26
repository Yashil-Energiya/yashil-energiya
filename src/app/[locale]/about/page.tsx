import s from "./page.module.scss";
import { TheHero } from "@/components/HeroComponent/TheHero";
import { TheFeedback } from "@/components/FeedbackComponent/TheFeedback";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import {
  Building2,
  Handshake,
  Leaf,
  Rocket,
  Sprout,
  SunMedium,
  Zap,
  type LucideIcon,
} from "lucide-react";
import huawei from "public/partners/huawei.webp";
import solarMan from "public/partners/solarMan.jpg";
import foxEss from "public/partners/foxEss.jpg";
import tosh from "public/partners/tosh.jpg";
import tw from "public/partners/tw.jpg";
import sungrow from "public/partners/sungrow.png";
import minvuz from "public/partners/minvuz.png";
import ozsuvtaminot from "public/partners/ozsuvtaminot.png";

const partnerLogos = [
  { src: minvuz, alt: "Oliy ta'lim, fan va innovatsiyalar vazirligi" },
  { src: ozsuvtaminot, alt: "O'zsuvta'minot" },
  { src: tw, alt: "Tongwei" },
  { src: foxEss, alt: "FoxESS" },
  { src: huawei, alt: "Huawei" },
  { src: sungrow, alt: "Sungrow" },
  { src: tosh, alt: "Toshiba" },
  { src: solarMan, alt: "SolarMAN" },
];

const eventIcons: Record<string, LucideIcon> = {
  event1: Sprout,
  event2: Zap,
  event3: Handshake,
  event4: Rocket,
};

export default async function About({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("AboutPage");
  const projects = ["project1", "project2", "project3"] as const;
  const events = ["event1", "event2", "event3", "event4"] as const;
  const achievements = [
    { key: "achievement2", icon: SunMedium },
    { key: "achievement3", icon: Building2 },
    { key: "achievement4", icon: Leaf },
  ] satisfies Array<{ key: string; icon: LucideIcon }>;

  return (
    <>
      <TheHero
        title1={t("heroTitle1")}
        url1="about"
        title2={t("heroTitle2")}
        url2="ceo"
        activeUrl="about"
      />
      <main className={s.page}>
        <section className={s.overview}>
          <div className="container">
            <div className={s.overviewGrid}>
              <div className={s.overviewIntro}>
                <h1 className={s.pageTitle}>{t("heroTitle1")}</h1>
                <p>{t("paragraph1")}</p>
              </div>
              <div className={s.missionPanel}>
                <h3>{t("title1")}</h3>
                <p>{t("paragraph2")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className={s.projectsSection}>
          <div className="container">
            <div className={s.sectionHeader}>
              <h2 className={s.title}>{t("title2")}</h2>
            </div>
            <ul className={s.projectsList}>
              {projects.map((project) => {
                const projectSrc = t(`${project}.src`);
                const projectImageSrc = `/aboutPage/${projectSrc}`;
                return (
                  <li key={project} className={s.projectsItem}>
                    <div className={s.projectMedia}>
                      <Image
                        src={projectImageSrc}
                        alt={projectSrc}
                        fill
                        priority={project === "project1"}
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className={s.projectBody}>
                      <p>{t(`${project}.title`)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className={s.timelineSection}>
          <div className="container">
            <div className={s.sectionHeader}>
              <h2 className={s.title}>{t("timelineTitle")}</h2>
            </div>
            <ol className={s.timeline}>
              {events.map((event) => {
                const year = t(`${event}.year`);
                const eventData = t.raw(`${event}.event`);
                const EventIcon = eventIcons[event];

                return (
                  <li
                    key={event}
                    className={s.timelineItem}
                  >
                    <span className={s.timelineIcon}>
                      <EventIcon aria-hidden="true" strokeWidth={1.8} />
                    </span>
                    <article className={s.timelineCard}>
                      <h3 className={s.eventTitle}>{year}</h3>
                      {eventData.length > 0 && (
                        <ul className={s.eventList}>
                          {eventData.map(
                            (ev: { description: string }, index: number) => (
                              <li key={index}>{ev.description}</li>
                            ),
                          )}
                        </ul>
                      )}
                    </article>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className={s.achievementsSection}>
          <div className="container">
            <div className={s.sectionHeader}>
              <h2 className={s.title}>{t("title3")}</h2>
            </div>
            <div className={s.achievements}>
              {achievements.map(({ key, icon: AchievementIcon }) => (
                <div key={key} className={s.achievement}>
                  <div className={s.achievementIconWrap}>
                    <AchievementIcon
                      className={s.achievementIcon}
                      aria-hidden="true"
                      strokeWidth={1.8}
                    />
                  </div>
                  <p className={s.achievementDescription}>
                    {t(`${key}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={s.partnersSection}>
          <div className={s.partnersBlock}>
            <div className="container">
              <div className={s.sectionHeader}>
                <h2 className={s.title}>{t("title4")}</h2>
              </div>
            </div>
            <div className={s.marquee}>
              <ul className={s.marqueeTrack} aria-hidden="false">
                {[...partnerLogos, ...partnerLogos].map((logo, i) => (
                  <li className={s.marqueeItem} key={i}>
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      sizes="260px"
                      priority={false}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      <TheFeedback />
    </>
  );
}
