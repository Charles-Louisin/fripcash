import { resolveAccountType, type AccountUserLike } from "@/lib/account-type";
import { cn } from "@/lib/utils";

export function AccountTypeBadge({
  user,
  className,
  size = "sm",
}: {
  user?: AccountUserLike | null;
  className?: string;
  size?: "sm" | "md";
}) {
  const type = resolveAccountType(user);
  const pending = type.requiresAdminApproval && type.verificationStatus === "pending";
  const rejected = type.verificationStatus === "rejected";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-[11px]",
        rejected
          ? "bg-red-100 text-red-800"
          : pending
            ? "bg-amber-100 text-amber-900"
            : "bg-primary/10 text-primary",
        className
      )}
    >
      {type.shortLabel}
      {pending && <span className="font-medium opacity-80">· attente</span>}
      {rejected && <span className="font-medium opacity-80">· refusé</span>}
    </span>
  );
}
