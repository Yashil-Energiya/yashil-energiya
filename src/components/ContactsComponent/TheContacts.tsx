
import styles from "./page.module.scss";
import { useTranslations } from "next-intl";
import { PHONES, phoneHref } from "data/company";

export const TheContacts = () => {
  const t = useTranslations("ContactsPage");
  return (
    <div>
      <h2 className="title">{t("title")}</h2>
      <div className={styles.info}>
        {PHONES.map(({ key, number }) => (
          <div className={styles.block} key={key}>
            <h2>{t(key)}</h2>
            <p>
              <a href={phoneHref(number)}>{number}</a>
            </p>
          </div>
        ))}
        <div className={styles.block}>
          <h2>{t("address")}</h2>
          <p>{t("address1")}</p>
        </div>
        <div className={styles.block}>
          <h2>{t("landmark")}</h2>
          <p>{t("landmark1")}</p>
        </div>
        <div className={styles.block}>
          <h2>{t("email")}</h2>
          <p>info@yashil-energiya.uz</p>
        </div>
      </div>
    </div>
  );
};
