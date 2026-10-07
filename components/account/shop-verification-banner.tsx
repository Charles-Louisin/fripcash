import { verificationLabel, type AccountType } from "@/lib/account-type";
import { FiAlertCircle, FiCheckCircle, FiClock, FiLock } from "react-icons/fi";

export function ShopVerificationBanner({ type }: { type: AccountType }) {
  if (!type.isSeller || !type.requiresAdminApproval) return null;

  if (type.verificationStatus === "approved") {
    return (
      <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        <FiCheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">{type.label} — {verificationLabel("approved")}</p>
          <p className="mt-0.5 text-emerald-800/80">
            Tes articles peuvent paraître dans {type.destination}.
          </p>
        </div>
      </div>
    );
  }

  if (type.verificationStatus === "rejected") {
    return (
      <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
        <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">Dossier {type.shortLabel.toLowerCase()} refusé</p>
          <p className="mt-0.5 text-red-800/80">
            Tu restes vendeur, mais la publication publique est bloquée. Recontacte
            l’équipe pour un nouveau dossier.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <FiClock className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-medium">
          {type.label}
        </p>
        <p className="mt-0.5 text-amber-900/80">
          Ton espace vendeur est ouvert. La mise en ligne, l’import Excel
          {type.id === "commerceLocal" ? ", la bibliothèque" : ""} et
          l’apparition dans {type.destination} se débloquent après validation
          de l’équipe.
        </p>
      </div>
    </div>
  );
}

export function FeatureLockedNotice({
  type,
  feature,
}: {
  type: AccountType;
  feature: string;
}) {
  if (type.canPublish) return null;
  return (
    <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <FiLock className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-medium">{feature} verrouillé</p>
        <p className="mt-0.5 text-amber-900/80">
          {type.isShop
            ? `Disponible dès que l’équipe valide ta ${type.shortLabel.toLowerCase()}.`
            : "Réservé aux comptes vendeur validés."}
        </p>
      </div>
    </div>
  );
}
