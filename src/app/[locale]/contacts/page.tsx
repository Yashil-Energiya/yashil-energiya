
import { TheHero } from "@/components/HeroComponent/TheHero";
import { TheForm } from "@/components/FormComponent/TheForm";
import s from "./page.module.scss";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PHONES, TAX_ID, phoneHref } from "data/company";

const departments = [
  {
    department: "department1",
    phone: "+998 90 830-31-18",
    mail: "finance@yashil-energiya.uz",
  },
  {
    department: "department2",
    phone: "+998 90 830-51-67",
    mail: "procurement@yashil-energiya.uz",
  },
  {
    department: "department3",
    phone: "+998 90 830-31-19",
    mail: "commercial@yashil-energiya.uz",
  },
];

const mapSrc =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d629.8574893084249!2d69.29235218411685!3d41.32791623011573!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38aef502436398eb%3A0xa40ec419e35355df!2sJV%20%22Yashil%20Energiya%22%20LLC!5e0!3m2!1s{locale}!2s!4v1779561905690!5m2!1s{locale}!2s";

export default async function Contacts({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ContactsPage");
  const mapLocale = locale === "uz" ? "uz" : locale;

  return (
    <>
      <TheHero title1={t("title")} url1="contacts" />
      <div className="container">
        <div className={s.content}>
          <div className={s.map}>
            <div className={s.companyInfo}>
              <h1>{t("title1")}</h1>
              <div>
                <div className={s.description}>{t("address")}:</div>
                <div className={s.info}>{t("address1")}</div>
              </div>
              {PHONES.map(({ key, number }) => (
                <div key={key}>
                  <div className={s.description}>{t(key)}:</div>
                  <a className={s.info} href={phoneHref(number)}>
                    {number}
                  </a>
                </div>
              ))}
              <p className={s.description}>{t("phoneHint")}</p>
              <div>
                <div className={s.description}>{t("email")}:</div>
                <div className={s.info}>info@yashil-energiya.uz</div>
              </div>
              <div>
                <div className={s.description}>{t("legalName")}:</div>
                <div className={s.info}>{t("legalNameValue")}</div>
              </div>
              <div>
                <div className={s.description}>{t("taxId")}:</div>
                <div className={s.info}>{TAX_ID}</div>
              </div>
            </div>
            <div className={s.frameBlock}>
              <iframe
                className={s.frame}
                src={mapSrc.replaceAll("{locale}", mapLocale)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t("mapFrameTitle")}
              />
            </div>
          </div>
          <div className={s.departments}>
            {departments.map(({ department, phone, mail }) => (
              <div className={s.department} key={phone}>
                <h3 className={s.title}>{t(`${department}`)}</h3>
                <div>
                  {/* <div className={s.description}>{t("phone")}:</div> */}
                  {/* <div className={s.info}>{phone}</div> */}
                </div>
                <div>
                  <div className={s.description}>{t("email")}:</div>
                  <div className={s.info}>{mail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={s.main}>
        <div className="container">
          <div className={s.block}>
            <TheForm />
          </div>
        </div>
      </div>
    </>
  );
}
