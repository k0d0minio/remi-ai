"use client";

import { useState, type FormEvent } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@remi/ui";
import { ConsentField } from "@/components/forms/consent-field";
import { DoneBadge } from "@/components/forms/done-badge";
import { Honeypot } from "@/components/forms/honeypot";
import { LeadField } from "@/components/forms/lead-field";
import { SubmitError } from "@/components/forms/submit-error";
import { PRACTITIONERS } from "@/lib/content/landing";
import { submitLead } from "@/lib/leads/actions";
import type { SubmitResult } from "@/lib/leads/state";
import { isEmail, isPhone, MSG, type FieldErrors } from "@/lib/leads/validation";

const copy = PRACTITIONERS.dialog;

/** The practitioners' waiting list (type `practitioner_pilot`), in a dialog. */
export const PractitionerDialog = () => {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profession, setProfession] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found: FieldErrors = {};
    if (!lastName.trim()) {
      found.lastName = MSG.required;
    }
    if (!firstName.trim()) {
      found.firstName = MSG.required;
    }
    if (!profession.trim()) {
      found.profession = MSG.required;
    }
    if (!isEmail(email)) {
      found.email = MSG.email;
    }
    if (phone.trim() && !isPhone(phone)) {
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
      setDone(true);
      return;
    }

    setSending(true);
    let outcome: SubmitResult;
    try {
      outcome = await submitLead({
        type: "practitioner_pilot",
        firstName,
        lastName,
        profession,
        email,
        phone,
        message,
      });
    } catch {
      outcome = { ok: false, reason: "network" };
    }
    setSending(false);
    setResult(outcome);
    if (outcome.ok) {
      setDone(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="border-background text-background hover:bg-background/10 hover:text-background"
        >
          {PRACTITIONERS.cta}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        {done ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <DoneBadge />
            <DialogHeader className="items-center text-center">
              <DialogTitle>{copy.doneTitle}</DialogTitle>
              <DialogDescription>{copy.doneText}</DialogDescription>
            </DialogHeader>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {copy.close}
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="relative flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>{copy.title}</DialogTitle>
              <DialogDescription>{copy.sub}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <LeadField
                id="prac-first-name"
                label={copy.firstName}
                name="firstName"
                autoComplete="given-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                error={errors.firstName}
              />
              <LeadField
                id="prac-last-name"
                label={copy.lastName}
                name="lastName"
                autoComplete="family-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                error={errors.lastName}
              />
            </div>
            <LeadField
              id="prac-profession"
              label={copy.profession}
              name="profession"
              placeholder={copy.professionPlaceholder}
              value={profession}
              onChange={(event) => setProfession(event.target.value)}
              error={errors.profession}
            />
            <LeadField
              id="prac-email"
              label={copy.email}
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={errors.email}
            />
            <LeadField
              id="prac-phone"
              label={copy.phone}
              optional
              type="tel"
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              error={errors.phone}
            />
            <LeadField
              id="prac-message"
              multiline
              label={copy.message}
              optional
              name="message"
              maxLength={1000}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <Honeypot value={trap} onChange={setTrap} />
            <ConsentField
              id="prac-consent"
              checked={consent}
              onChange={setConsent}
              error={errors.consent}
            />
            <SubmitError result={result} />
            <Button type="submit" size="lg" disabled={sending}>
              {sending ? "Envoi…" : copy.submit}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
