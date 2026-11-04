import s from "./TheFooter.module.scss";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { socialLinks } from "data/links";
import { LEGAL_NAME, PHONES, TAX_ID, phoneHref } from "data/company";
import { getTranslations } from "next-intl/server";
import { MapPin, Navigation, Phone, Mail } from "lucide-react";
import { FooterBackToTop } from "./FooterBackToTop";
import Logo from "public/logo_2.png";

type NavLink = { href: string; labelKey: string };

// Navigation columns mirror the header menu (data/links.ts) so footer and
// header never drift apart. Labels reuse the shared "Header" dictionary.
const companyLinks: NavLink[] = [
  { href: "/about", labelKey: "company" },
  { href: "/ceo", labelKey: "ceo" },
  { href: "/news", labelKey: "news" },
  { href: "/articles", labelKey: "articles" },
  { href: "/documents", labelKey: "documents" },
];

const activityLinks: NavLink[] = [
  { href: "/solarpanels", labelKey: "solarPanels" },
  { href: "/microges", labelKey: "microGes" },
  { href: "/chargingstation", labelKey: "chargingStation" },
  { href: "/plants", labelKey: "plants" },
  { href: "/procurements", labelKey: "procurements" },
  { href: "/installation-request", labelKey: "installationRequest" },
];

const EMAIL = "info@yashil-energiya.uz";

export const TheFooter = async () => {
  const t = await getTranslations("Footer");
  const th = await getTranslations("Header");
  const tc = await getTranslations("ContactsPage");
  const year = new Date().getFullYear();

  return (
    <footer className={s.footer}>
      <div className={s.pattern} aria-hidden="true" />
      <div className="container">
        <div className={s.top}>
          {/* Brand column */}
          <div className={s.brand}>
            <Link href="/" className={s.logoLink} aria-label="Yashil Energiya">
              <Image
                className={s.logo}
                src={Logo}
                alt="Yashil Energiya"
                width={176}
                height={73}
              />
            </Link>
            <p className={s.mission}>{t("mission")}</p>
            <ul className={s.socialLinks}>
              {socialLinks.map(({ url, path }) => (
                <li key={path}>
                  <Link
                    href={url}
                    className={s.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      className={s.socialIcon}
                      src={path}
                      alt=""
                      width={18}
                      height={18}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <nav className={s.navCol} aria-label={t("sections.company")}>
            <h2 className={s.colTitle}>{t("sections.company")}</h2>
            <ul className={s.linkList}>
              {companyLinks.map(({ href, labelKey }) => (
                <li key={href}>
                  <Link className={s.navLink} href={href}>
                    {th(labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Activity */}
          <nav className={s.navCol} aria-label={t("sections.activity")}>
            <h2 className={s.colTitle}>{t("sections.activity")}</h2>
            <ul className={s.linkList}>
              {activityLinks.map(({ href, labelKey }) => (
                <li key={href}>
                  <Link className={s.navLink} href={href}>
                    {th(labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contacts */}
          <div className={`${s.navCol} ${s.contactsCol}`}>
            <h2 className={s.colTitle}>{t("sections.contacts")}</h2>
            <address className={s.contacts}>
              {PHONES.map(({ key, number }) => (
                <a className={s.contactRow} href={phoneHref(number)} key={key}>
                  <Phone size={16} aria-hidden="true" />
                  <span>
                    {tc(key)}: {number}
                  </span>
                </a>
              ))}
              <p className={s.contactRow}>
                <MapPin size={16} aria-hidden="true" />
                <span>{tc("address1")}</span>
              </p>
              <p className={s.contactRow}>
                <Navigation size={16} aria-hidden="true" />
                <span>
                  {tc("landmark")}: {tc("landmark1")}
                </span>
              </p>
              <a className={s.contactRow} href={`mailto:${EMAIL}`}>
                <Mail size={16} aria-hidden="true" />
                <span>{EMAIL}</span>
              </a>
            </address>
          </div>
        </div>
      </div>

      <div className={s.legalBar}>
        <div className="container">
          <div className={s.legalInner}>
            <p className={s.copyright}>
              © {year} {LEGAL_NAME} · {tc("taxId")} {TAX_ID} ·{" "}
              {t("rights")}
            </p>
            <div className={s.legalActions}>
              <Link className={s.legalLink} href="/chargingstation/public-offer">
                {t("publicOfferChargingStations")}
              </Link>
              <FooterBackToTop label={t("backToTop")} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
