"use client";

import { useEffect, useState } from "react";
import { FiMail } from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";
import { useToast } from "@/components/ui/toast";
import { ApiError, sendVerificationEmail, verifyEmailCode } from "@/lib/api";

type EmailVerifyModalProps = {
  open: boolean;
  email: string;
  onVerified: () => void;
};

export function EmailVerifyModal({
  open,
  email,
  onVerified,
}: EmailVerifyModalProps) {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  useEffect(() => {
    if (open) setCode("");
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = code.replace(/\D/g, "");
    if (digits.length !== 6) {
      toast("Entre le code à 6 chiffres.", "error");
      return;
    }
    setLoading(true);
    try {
      await verifyEmailCode({ email, code: digits });
      toast("Email confirmé.", "success");
      onVerified();
    } catch (err) {
      toast(
        err instanceof ApiError ? err.body.message : "Code invalide ou expiré.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setLoading(true);
    try {
      const res = await sendVerificationEmail(email);
      if (res.code) setDevCode(res.code);
      toast("Nouveau code envoyé.", "success");
    } catch (err) {
      toast(
        err instanceof ApiError
          ? err.body.message
          : "Impossible d’envoyer le code.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="sm:max-w-md"
      >
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FiMail className="h-5 w-5" />
          </div>
          <DialogTitle className="text-center">Confirme ton email</DialogTitle>
          <DialogDescription className="text-center">
            Un code à 6 chiffres a été envoyé à{" "}
            <strong className="text-foreground">{email}</strong>. Entre-le pour
            accéder à ton espace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {(devCode || process.env.NODE_ENV === "development") && (
            <p className="rounded-md bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
              {devCode
                ? <>Dev : <strong>{devCode}</strong></>
                : <>Dev : si Resend n’est pas configuré, le code est <strong>000000</strong>.</>}
            </p>
          )}
          <OtpInput
            value={code}
            onChange={setCode}
            disabled={loading}
            autoFocus
            aria-label="Code email"
          />
          <Button
            type="submit"
            disabled={loading || code.length !== 6}
            className="h-12 w-full rounded-full font-semibold"
          >
            {loading ? "Vérification..." : "Confirmer"}
          </Button>
          <button
            type="button"
            disabled={loading}
            onClick={resend}
            className="w-full text-sm text-muted-foreground hover:text-foreground"
          >
            Renvoyer le code
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
