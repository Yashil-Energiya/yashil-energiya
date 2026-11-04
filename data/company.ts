// LEGAL_NAME must stay byte-for-byte equal to the D-U-N-S record
// (D-U-N-S 319070289): Apple checks the site against it.
export const LEGAL_NAME =
  "YASHIL ENERGIYA, MASULIYATI CHEKLANGAN JAMIYAT QOSHMA KORXONA";
export const TAX_ID = "310243547";

// Call centre handles customer requests; the office line rings the reception,
// which transfers calls to staff. `key` is the label in ContactsPage messages.
export const PHONES = [
  { key: "callCenter", number: "+998 55-514-88-44" },
  { key: "office", number: "+998 55-511-88-44" },
] as const;

// Charging stations have their own support line (mobile app requests); it
// replaces the call centre on charging-station pages.
export const CHARGING_PHONES = [
  { key: "chargingSupport", number: "+998 90 830-10-00" },
  PHONES[1],
] as const;

export const phoneHref = (number: string) =>
  `tel:${number.replace(/[^\d+]/g, "")}`;
