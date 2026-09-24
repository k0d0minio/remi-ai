"use client";

import { useState } from "react";
import { Field, Textarea } from "@remi/ui/server";
import { Button } from "@remi/ui";
import { sendMessageAction, type WriteState } from "@/lib/patient-link/actions";
import type { Content } from "@/lib/content/types";

type Props = {
  /** The whole credential, straight from the route — never a patient id. */
  token: string;
  locale: string;
  /** Distinct per placement, so the home card and the segment never share one. */
  id: string;
  content: Content["patientLink"];
};

/**
 * One text box and « Envoyer ». Controlled for the meal form's reason: a
 * refused send must not wipe what the patient just wrote, so the text is
 * cleared on success only.
 */
export const MessageForm = ({ token, locale, id, content }: Props) => {
  const [body, setBody] = useState("");
  const [state, setState] = useState<WriteState>({ error: null });

  return (
    <form
      action={async (formData: FormData) => {
        const result = await sendMessageAction({ error: null }, formData);
        setState(result);
        if (!result.error) {
          setBody("");
        }
      }}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="locale" value={locale} />

      <Field
        id={id}
        label={content.messages.bodyLabel}
        error={state.error ? content.messages.errors[state.error] : undefined}
      >
        <Textarea
          id={id}
          name="body"
          required
          rows={3}
          maxLength={2000}
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
      </Field>

      <div>
        <Button type="submit" variant="primary" className="min-h-11">
          {content.messages.send}
        </Button>
      </div>
    </form>
  );
};
