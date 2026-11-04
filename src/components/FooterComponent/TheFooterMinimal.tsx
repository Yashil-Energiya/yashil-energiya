import s from "./TheFooterMinimal.module.scss";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { socialLinks } from "data/links";
import { LEGAL_NAME } from "data/company";
import { getTranslations } from "next-intl/server";

// Original (pre-redesign) footer, kept for the standalone landing pages
// (/taplink, /ev-guide) that hide the site chrome.
export const TheFooterMinimal = async () => {
  const t = await getTranslations("Footer");

  return (
    <footer className={s.footer}>
      <div className="container">
        <div className={s.content}>
          <div className={s.socialLinks}>
            {socialLinks.map(({ url, path }) => (
              <Link
                href={url}
                className={s.socialLink}
                key={path}
                target="_blank"
              >
                <Image
                  className={s.icon}
                  src={path}
                  alt="logo"
                  width={40}
                  height={40}
                />
              </Link>
            ))}
          </div>
          <nav className={s.legalLinks} aria-label={t("legalNav")}>
            <Link className={s.legalLink} href="/chargingstation/public-offer">
              {t("publicOfferChargingStations")}
            </Link>
          </nav>
        </div>
      </div>
      <div className={s.subFooter}>
        <p className={s.text}>
          © {LEGAL_NAME} · {t("rights")}
        </p>
      </div>
    </footer>
  );
};
