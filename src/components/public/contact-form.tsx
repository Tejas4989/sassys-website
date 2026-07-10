"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { submitContact, type ContactState } from "@/lib/actions/contact";

const initial: ContactState = { ok: false };

const inputClass =
  "w-full px-3 py-3 border border-line rounded-lg font-body text-base bg-white focus:outline-2 focus:outline-gold focus:outline-offset-1 mb-3.5";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-sassy-red text-cream-hi rounded-full px-[26px] py-[13px] font-display font-bold text-[15px] disabled:opacity-60 hover:brightness-105 transition"
    >
      {pending ? "Sending…" : "Send Message"}
    </button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitContact, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success("Thanks! Your message is on its way.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="bg-white border border-line rounded-[18px] p-7">
      <div className="font-editorial font-semibold text-[21px] mb-[18px]">
        Send us a message
      </div>
      <form ref={formRef} action={formAction}>
        <label className="block text-[13px] font-semibold mb-1.5" htmlFor="name">
          Name
        </label>
        <input id="name" name="name" type="text" placeholder="Your name" className={inputClass} required />

        <label className="block text-[13px] font-semibold mb-1.5" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" placeholder="you@email.com" className={inputClass} required />

        <label className="block text-[13px] font-semibold mb-1.5" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="How can we help?"
          className={`${inputClass} resize-y mb-[18px]`}
          required
        />

        <SubmitButton />
      </form>
    </div>
  );
}
