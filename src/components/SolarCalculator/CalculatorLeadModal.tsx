"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import cn from "classnames";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, ChevronLeft, Loader2, Send, X } from "lucide-react";
import type { Segment } from "interface/solar-calculator.types";
import s from "./SolarCalculator.module.scss";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { LEAD_MAX_LENGTH } from "@/lib/lead-limits";
import { numberLocale } from "@/lib/number-locale";

const Turnstile = dynamic(
  () => import("@marsidev/react-turnstile").then((mod) => mod.Turnstile),
  { ssr: false },
);

export type LeadSummary = {
  segment: Segment;
  segmentLabel: string;
  annualConsumptionKwh: number;
  regionLabel: string;
  regionCode: string;
  coveragePercent: number;
  includeBESS: boolean;
  recommendedKwp: number;
};

type CalculatorLeadModalProps = {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
  summary: LeadSummary;
};

type Contact = { firstName: string; phone: string; email: string };
type ContactErrors = Partial<Record<keyof Contact, string>>;
type Step = "form" | "confirm" | "success";

const EMPTY: Contact = { firstName: "", phone: "", email: "" };
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CalculatorLeadModal = ({
  open,
  onClose,
  onReset,
  summary,
}: CalculatorLeadModalProps) => {
  const t = useTranslations("CalculatorPage");
  const locale = useLocale();
  const fieldId = useId();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);

  const [step, setStep] = useState<Step>("form");
  const [contact, setContact] = useState<Contact>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [captchaToken, setCaptchaToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Reset everything whenever the modal is (re)opened.
  useEffect(() => {
    if (!open) return;
    setStep("form");
    setContact(EMPTY);
    setErrors({});
    setCaptchaToken("");
    setIsSubmitting(false);
    setSubmitError("");
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContact((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateContact = () => {
    const next: ContactErrors = {};
    if (!contact.firstName.trim()) next.firstName = t("leadForm.errors.required");
    if (!contact.phone.trim()) next.phone = t("leadForm.errors.required");
    if (contact.email.trim() && !EMAIL_REGEX.test(contact.email.trim()))
      next.email = t("leadForm.errors.emailInvalid");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goToConfirm = (e: FormEvent) => {
    e.preventDefault();
    if (validateContact()) setStep("confirm");
  };

  // Turnstile tokens are single-use: a failed request burns it.
  const resetCaptcha = () => {
    setCaptchaToken("");
    turnstileRef.current?.reset();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!turnstileSiteKey) {
      setSubmitError(t("leadForm.errors.verificationUnavailable"));
      return;
    }
    if (!captchaToken) {
      setSubmitError(t("leadForm.errors.captchaRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/calculator-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Language": locale,
        },
        body: JSON.stringify({
          firstName: contact.firstName.trim(),
          phone: contact.phone.trim(),
          email: contact.email.trim(),
          captchaToken,
          consumerType: summary.segmentLabel,
          annualConsumptionKwh: summary.annualConsumptionKwh,
          region: summary.regionLabel,
          coveragePercent: summary.coveragePercent,
          includeBESS: summary.includeBESS,
          recommendedKwp: summary.recommendedKwp,
        }),
      });

      if (response.ok) {
        setStep("success");
      } else {
        setSubmitError(t("leadForm.errors.submitError"));
        resetCaptcha();
      }
    } catch (error) {
      console.error("Calculator request error:", error);
      setSubmitError(t("leadForm.errors.submitError"));
      resetCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewCalculation = () => {
    onReset();
    onClose();
  };

  const contactFields: {
    name: keyof Contact;
    type: string;
    label: string;
    autoComplete: string;
    optional?: boolean;
  }[] = [
    { name: "firstName", type: "text", label: t("leadForm.fields.name"), autoComplete: "name" },
    { name: "phone", type: "tel", label: t("leadForm.fields.phone"), autoComplete: "tel" },
    {
      name: "email",
      type: "email",
      label: t("leadForm.fields.email"),
      autoComplete: "email",
      optional: true,
    },
  ];

  const reviewRows: { label: string; value: string }[] = [
    { label: t("leadForm.review.consumerType"), value: summary.segmentLabel },
    {
      label: t("leadForm.review.annualConsumption"),
      value: `${new Intl.NumberFormat(numberLocale(locale)).format(summary.annualConsumptionKwh)} ${t("units.kwh")}`,
    },
    { label: t("leadForm.review.region"), value: summary.regionLabel },
    { label: t("leadForm.review.coverage"), value: `${summary.coveragePercent}%` },
    {
      label: t("leadForm.review.bess"),
      value: summary.includeBESS ? t("leadForm.review.yes") : t("leadForm.review.no"),
    },
  ];

  return (
    <div
      className={s.modalOverlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={s.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${fieldId}-modal-title`}
      >
        <button
          type="button"
          className={s.modalClose}
          aria-label={t("leadForm.close")}
          onClick={onClose}
        >
          <X size={20} aria-hidden="true" />
        </button>

        {step === "success" ? (
          <div className={s.modalSuccess} role="status" aria-live="polite">
            <CheckCircle2 className={s.successIcon} aria-hidden="true" />
            <h2 id={`${fieldId}-modal-title`} className={s.modalTitle}>
              {t("leadForm.success.title")}
            </h2>
            <p className={s.modalSubtitle}>{t("leadForm.success.text")}</p>
            <button
              type="button"
              className={s.modalPrimary}
              onClick={handleNewCalculation}
            >
              {t("leadForm.success.newCalculation")}
            </button>
          </div>
        ) : (
          <>
            <div className={s.modalHead}>
              <h2 id={`${fieldId}-modal-title`} className={s.modalTitle}>
                {t("leadForm.title")}
              </h2>
              <p className={s.modalSubtitle}>
                {step === "form"
                  ? t("leadForm.subtitle")
                  : t("leadForm.confirmSubtitle")}
              </p>
            </div>

            {step === "form" ? (
              <form className={s.modalForm} onSubmit={goToConfirm} noValidate>
                {contactFields.map(({ name, type, label, autoComplete, optional }) => (
                  <div key={name} className={s.field}>
                    <label className={s.label} htmlFor={`${fieldId}-${name}`}>
                      {label}
                      {optional && (
                        <span className={s.optional}>
                          {t("leadForm.fields.optional")}
                        </span>
                      )}
                    </label>
                    <input
                      className={cn(s.input, { [s.inputError]: errors[name] })}
                      id={`${fieldId}-${name}`}
                      name={name}
                      type={type}
                      autoComplete={autoComplete}
                      maxLength={LEAD_MAX_LENGTH[name]}
                      value={contact[name]}
                      onChange={handleChange}
                      aria-invalid={errors[name] ? true : undefined}
                    />
                    {errors[name] && (
                      <span className={s.errorText}>{errors[name]}</span>
                    )}
                  </div>
                ))}

                <div className={s.modalActions}>
                  <button type="submit" className={s.modalPrimary}>
                    {t("leadForm.next")}
                  </button>
                </div>
              </form>
            ) : (
              <form className={s.modalForm} onSubmit={handleSubmit} noValidate>
                <p className={s.consentNote}>{t("leadForm.consentNote")}</p>

                <dl className={s.reviewList}>
                  {reviewRows.map((row) => (
                    <div key={row.label} className={s.reviewRow}>
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className={s.captchaWrapper}>
                  {turnstileSiteKey ? (
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={turnstileSiteKey}
                      onSuccess={(token) => setCaptchaToken(token)}
                      onExpire={() => setCaptchaToken("")}
                    />
                  ) : (
                    <p className={s.errorText}>
                      {t("leadForm.errors.verificationUnavailable")}
                    </p>
                  )}
                </div>

                {submitError && (
                  <p className={s.errorText} role="alert">
                    {submitError}
                  </p>
                )}

                <div className={s.modalActions}>
                  <button
                    type="button"
                    className={s.modalSecondary}
                    onClick={() => setStep("form")}
                    disabled={isSubmitting}
                  >
                    <ChevronLeft size={16} aria-hidden="true" />
                    {t("leadForm.back")}
                  </button>
                  <button
                    type="submit"
                    className={s.modalPrimary}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className={s.spinner} aria-hidden="true" />
                        {t("leadForm.submitting")}
                      </>
                    ) : (
                      <>
                        {t("leadForm.submit")}
                        <Send size={16} aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
