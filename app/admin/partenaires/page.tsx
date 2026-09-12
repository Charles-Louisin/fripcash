"use client";

import { useMemo, useState } from "react";
import { Plus, MapPin } from "lucide-react";
import { FiBriefcase, FiClock, FiTrash2 } from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminPlatformStore } from "@/stores/admin-platform-store";
import { useToast } from "@/components/ui/toast";

export default function AdminPartnersPage() {
  const { partners, zones, addPartner, removePartner } = useAdminPlatformStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sla, setSla] = useState("4h");
  const [zoneId, setZoneId] = useState("zone_1");

  const stats = useMemo(
    () => ({
      total: partners.length,
      express: partners.filter((p) => p.sla === "2h").length,
      zones: new Set(partners.map((p) => p.zoneId)).size,
    }),
    [partners]
  );

  const resetForm = () => {
    setName("");
    setEmail("");
    setSla("4h");
    setZoneId("zone_1");
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    const initials = name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    addPartner({
      name: name.trim(),
      sla,
      zoneId,
      logoInitials: initials,
      contactEmail: email.trim() || undefined,
      active: true,
    });
    resetForm();
    setOpen(false);
    toast("Enseigne partenaire créée", "success");
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Enseignes partenaires"
        description="Univers Enseignes de l'app — grandes surfaces / partenaires (SLA express 2h / 4h / 48h). Les commerces locaux vont dans Boutiques de quartier."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle enseigne
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Créer une enseigne partenaire</DialogTitle>
                <DialogDescription>
                  Ajoutez une boutique partenaire avec son SLA de livraison et sa zone
                  de couverture.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="partner-name">Nom de l&apos;enseigne</Label>
                  <Input
                    id="partner-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex. Carrefour Market"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="partner-email">Email contact (optionnel)</Label>
                  <Input
                    id="partner-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@enseigne.gn"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>SLA livraison</Label>
                    <Select value={sla} onValueChange={setSla}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2h">Express 2h</SelectItem>
                        <SelectItem value="4h">Standard 4h</SelectItem>
                        <SelectItem value="48h">Économique 48h</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Zone</Label>
                    <Select value={zoneId} onValueChange={setZoneId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map((z) => (
                          <SelectItem key={z.id} value={z.id}>
                            {z.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 p-3">
                  Le logo sera généré automatiquement à partir des initiales du nom.
                  Upload de fichier : prochaine version.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreate} disabled={!name.trim()}>
                  Créer l&apos;enseigne
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Enseignes actives"
          value={stats.total.toString()}
          change="Partenaires enregistrés"
          changeType="neutral"
          icon={FiBriefcase}
        />
        <StatCard
          title="SLA express (2h)"
          value={stats.express.toString()}
          change="Livraison prioritaire"
          changeType="positive"
          icon={FiClock}
        />
        <StatCard
          title="Zones couvertes"
          value={stats.zones.toString()}
          change={`sur ${zones.length} zones`}
          changeType="neutral"
          icon={MapPin}
        />
      </div>

      <DataTable
        data={partners}
        getRowKey={(p) => p.id}
        columns={[
          {
            key: "logo",
            header: "Enseigne",
            render: (p) => (
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {p.logoInitials}
                </div>
                <div>
                  <p className="font-medium">{p.name}</p>
                  {p.contactEmail && (
                    <p className="text-xs text-muted-foreground">{p.contactEmail}</p>
                  )}
                </div>
              </div>
            ),
          },
          {
            key: "sla",
            header: "SLA",
            render: (p) => (
              <Badge
                variant={p.sla === "2h" ? "default" : "secondary"}
                className={p.sla === "2h" ? "bg-green-600 hover:bg-green-600" : undefined}
              >
                Livraison {p.sla}
              </Badge>
            ),
          },
          {
            key: "zone",
            header: "Zone",
            render: (p) => (
              <div className="flex items-center gap-1.5 text-sm">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                {zones.find((z) => z.id === p.zoneId)?.name ?? p.zoneId}
              </div>
            ),
          },
          {
            key: "status",
            header: "Statut",
            render: (p) => (
              <Badge variant={p.active !== false ? "outline" : "secondary"}>
                {p.active !== false ? "Active" : "Suspendue"}
              </Badge>
            ),
          },
          {
            key: "actions",
            header: "",
            render: (p) => (
              <button
                type="button"
                onClick={() => {
                  removePartner(p.id);
                  toast("Enseigne supprimée", "success");
                }}
                className="text-destructive p-2 rounded-lg hover:bg-destructive/10"
                aria-label={`Supprimer ${p.name}`}
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            ),
          },
        ]}
      />
    </div>
  );
}
