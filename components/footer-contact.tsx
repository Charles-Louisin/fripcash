"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPublicSettings } from "@/lib/api";
import { TfiEmail } from "react-icons/tfi";
import { LuPhoneCall } from "react-icons/lu";
import { MdLocationOn } from "react-icons/md";

export function FooterContact() {
  const { data } = useQuery({
    queryKey: ["public-settings"],
    queryFn: fetchPublicSettings,
    staleTime: 60_000,
  });
  const email = data?.contactEmail || "support@fripcash.com";
  const phone = data?.contactPhone || "+224 6XX XXX XXX";

  return (
    <div className="border-t border-border pt-6 pb-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
      <div className="flex items-center gap-3">
        <TfiEmail className="text-primary text-lg" />
        <div>
          <div className="font-bold text-xs text-muted-foreground">EMAIL</div>
          <div className="text-foreground">{email}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <LuPhoneCall className="text-primary text-lg" />
        <div>
          <div className="font-bold text-xs text-muted-foreground">TÉLÉPHONE</div>
          <div className="text-foreground">{phone}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <MdLocationOn className="text-primary text-lg" />
        <div>
          <div className="font-bold text-xs text-muted-foreground">ADRESSE</div>
          <div className="text-foreground">Conakry, Guinée</div>
        </div>
      </div>
    </div>
  );
}
