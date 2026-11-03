"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { OfferInterest } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Typography } from "@remi/ui/server";
import { ChoiceButton } from "@/components/forms/choice-button";
import { ConsentField } from "@/components/forms/consent-field";
import { DoneBadge } from "@/components/forms/done-badge";
import { Honeypot } from "@/components/forms/honeypot";
import { LeadField } from "@/components/forms/lead-field";
import { SubmitError } from "@/components/forms/submit-error";
import { Faq } from "@/components/faq";
import { SELECT_OFFER_EVENT } from "@/components/select-offer";
import { FAQ, FLOW, OFFERS, offerById, type OfferId } from "@/lib/content/landing";
import { submitLead } from "@/lib/leads/actions";
import type { SubmitResult } from "@/lib/leads/state";
import { isEmail, isPhone, MSG, type FieldErrors } from "@/lib/leads/validation";
import { formatPrice } from "@/lib/site";

type Step = "intro" | "offer" | "contact" | "done" | "info" | "info-done";

const PATIENT_STEPS: Step[] = ["offer", "contact", "done"];

/**
 * Morgane's conversational sign-up.
 *   Path A: intro → formula → contact → thanks   (type `patient_pilot`)
 *   Path B: intro → FAQ + email / question → thanks (type `info_request`)
 * A sign-up is an expression of interest: no payment, no health data.
 */
export const SignupFlow = () => {
  const [step, setStep] = useState<Step>("intro");
  const [offer, setOffer] = useState<OfferInterest>("undecided");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  // Typed for the `p` Typography renders by default. The element is an `h3`, and `.focus()` is the same on both.
  const headingRef = useRef<HTMLParagraphElement>(null);
  const prevStep = useRef<Step>("intro");

  // The offer cards: formula pre-selected, straight to the contact step.
  useEffect(() => {
    const onSelect = (event: Event) => {
      setOffer((event as CustomEvent<OfferId>).detail);
      setErrors({});
      setResult(null);
      setStep("contact");
    };
    window.addEventListener(SELECT_OFFER_EVENT, onSelect);
    return () => window.removeEventListener(SELECT_OFFER_EVENT, onSelect);
  }, []);

  // Each step moves the focus to its title, except on the first render.
  useEffect(() => {
    if (prevStep.current !== step) {
      headingRef.current?.focus();
    }
    prevStep.current = step;
  }, [step]);

  const go = (next: Step) => {
    setErrors({});
    setResult(null);
    setStep(next);
  };

  const finish = async (
    type: "patient_pilot" | "info_request",
    next: Step,
    event: FormEvent,
  ) => {
    event.preventDefault();
    const found: FieldErrors = {};
    if (type === "patient_pilot" && !firstName.trim()) {
      found.firstName = MSG.required;
    }
    if (!isEmail(email)) {
      found.email = MSG.email;
    }
    if (type === "patient_pilot" && phone.trim() && !isPhone(phone)) {
      found.phone = MSG.phone;
    }
    if (!consent) {
      found.consent = MSG.consent;
    }
    setErrors(found);
    if (Object.keys(found).length > 0) {
      return;
    }
    if (trap) {
      // A robot. It hears « merci » and nothing is sent.
      go(next);
      return;
    }

    setSending(true);
    let outcome: SubmitResult;
    try {
      outcome = await submitLead(
        type === "patient_pilot"
          ? { type, firstName, email, phone, offerInterest: offer }
          : { type, email, message },
      );
    } catch {
      outcome = { ok: false, reason: "network" };
    }
    setSending(false);
    setResult(outcome);
    if (outcome.ok) {
      go(next);
    }
  };

  const stepIndex = PATIENT_STEPS.indexOf(step);

  const back = (to: Step) => (
    <Button type="button" variant="link" size="sm" className="self-start px-0" onClick={() => go(to)}>
      <ArrowLeft aria-hidden="true" />
      {FLOW.back}
    </Button>
  );

  return (
    <div
      id="inscription-flow"
      className="border-border bg-card flex flex-col gap-5 rounded-2xl border p-5 shadow-sm md:p-7"
    >
      {stepIndex >= 0 ? (
        <div
          role="img"
          aria-label={FLOW.progressLabel(stepIndex + 1, PATIENT_STEPS.length)}
          className="flex gap-1.5"
        >
          {PATIENT_STEPS.map((name, index) => (
            <span
              key={name}
              className={`h-1.5 flex-1 rounded-full ${index <= stepIndex ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
      ) : null}

      {step === "intro" ? (
        <div className="flex flex-col gap-4">
          <Typography as="h3" ref={headingRef} tabIndex={-1} size="xl" weight="semibold">
            {FLOW.intro.title}
          </Typography>
          <Typography size="sm" tone="muted">
            {FLOW.intro.sub}
          </Typography>
          <div className="flex flex-col gap-2">
            <ChoiceButton
              primary
              title={FLOW.intro.pilot}
              sub={FLOW.intro.pilotSub}
              onClick={() => go("offer")}
            />
            <ChoiceButton
              title={FLOW.intro.info}
              sub={FLOW.intro.infoSub}
              onClick={() => go("info")}
            />
          </div>
        </div>
      ) : null}

      {step === "offer" ? (
        <div className="flex flex-col gap-4">
          <Typography as="h3" ref={headingRef} tabIndex={-1} size="xl" weight="semibold">
            {FLOW.offer.title}
          </Typography>
          <Typography size="sm" tone="muted">
            {FLOW.offer.sub}
          </Typography>
          <div className="flex flex-col gap-2">
            {OFFERS.map((item) => (
              <ChoiceButton
                key={item.id}
                title={item.name}
                sub={`${formatPrice(item.price)} ${FLOW.offer.unit}`}
                onClick={() => {
                  setOffer(item.id);
                  go("contact");
                }}
              />
            ))}
            <ChoiceButton
              title={FLOW.offer.undecided}
              sub={FLOW.offer.undecidedSub}
              onClick={() => {
                setOffer("undecided");
                go("contact");
              }}
            />
          </div>
          {back("intro")}
        </div>
      ) : null}

      {step === "contact" ? (
        <form
          className="relative flex flex-col gap-4"
          onSubmit={(event) => finish("patient_pilot", "done", event)}
          noValidate
        >
          <Typography as="h3" ref={headingRef} tabIndex={-1} size="xl" weight="semibold">
            {FLOW.contact.title}
          </Typography>
          <Typography size="sm" tone="muted">
            {offer === "undecided"
              ? FLOW.contact.formulaUndecided
              : `${FLOW.contact.formulaBefore}${offerById(offer).name}${FLOW.contact.formulaAfter}`}{" "}
            <button
              type="button"
              className="text-primary underline underline-offset-4"
              onClick={() => go("offer")}
            >
              {FLOW.contact.change}
            </button>
          </Typography>
          <LeadField
            id="pilot-first-name"
            label={FLOW.contact.firstName}
            name="firstName"
            autoComplete="given-name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            error={errors.firstName}
          />
          <LeadField
            id="pilot-email"
            label={FLOW.contact.email}
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
          />
          <LeadField
            id="pilot-phone"
            label={FLOW.contact.phone}
            optional
            type="tel"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            error={errors.phone}
          />
          <Honeypot value={trap} onChange={setTrap} />
          <ConsentField
            id="pilot-consent"
            checked={consent}
            onChange={setConsent}
            error={errors.consent}
          />
          <Typography size="xs" tone="muted">
            {FLOW.contact.hint}
          </Typography>
          <SubmitError result={result} />
          <Button type="submit" size="lg" disabled={sending}>
            {sending ? FLOW.sending : FLOW.contact.submit}
          </Button>
          {back("offer")}
        </form>
      ) : null}

      {step === "done" ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <DoneBadge />
          <Typography as="h3" ref={headingRef} tabIndex={-1} size="xl" weight="semibold">
            {FLOW.done.title}
          </Typography>
          <Typography size="sm">{FLOW.done.text}</Typography>
          <Typography size="xs" tone="muted">
            {FLOW.done.hint}
          </Typography>
        </div>
      ) : null}

      {step === "info" ? (
        <form
          className="relative flex flex-col gap-4"
          onSubmit={(event) => finish("info_request", "info-done", event)}
          noValidate
        >
          <Typography as="h3" ref={headingRef} tabIndex={-1} size="xl" weight="semibold">
            {FLOW.info.title}
          </Typography>
          <Faq items={FAQ} />
          <Typography size="sm" weight="medium" className="mt-2">
            {FLOW.info.sub}
          </Typography>
          <LeadField
            id="info-email"
            label={FLOW.info.email}
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
          />
          <LeadField
            id="info-message"
            multiline
            label={FLOW.info.message}
            optional
            name="message"
            maxLength={1000}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <Honeypot value={trap} onChange={setTrap} />
          <ConsentField
            id="info-consent"
            checked={consent}
            onChange={setConsent}
            error={errors.consent}
          />
          <Typography size="xs" tone="muted">
            {FLOW.contact.hint}
          </Typography>
          <SubmitError result={result} />
          <Button type="submit" size="lg" disabled={sending}>
            {sending ? FLOW.sending : FLOW.info.submit}
          </Button>
          {back("intro")}
        </form>
      ) : null}

      {step === "info-done" ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <DoneBadge />
          <Typography as="h3" ref={headingRef} tabIndex={-1} size="xl" weight="semibold">
            {FLOW.infoDone.title}
          </Typography>
          <Typography size="sm">{FLOW.infoDone.text}</Typography>
          <Button type="button" variant="outline" onClick={() => go("offer")}>
            {FLOW.infoDone.cta}
          </Button>
        </div>
      ) : null}
    </div>
  );
};
