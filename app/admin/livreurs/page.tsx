"use client";

import { useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import type { MaritalStatus } from "@/lib/admin-platform";
import { FiTruck, FiUserCheck, FiUsers } from "react-icons/fi";

const maritalLabels: Record<MaritalStatus, string> = {
  celibataire: "Célibataire",
  marie: "Marié(e)",
  divorce: "Divorcé(e)",
  veuf: "Veuf / Veuve",
};

export default function AdminCouriersPage() {
  const {
    couriers,
    zones,
    stuckOrders,
    addCourier,
    toggleCourierActive,
    reassignOrder,
  } = useAdminPlatformStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>("celibataire");
  const [zoneId, setZoneId] = useState("zone_1");
  const [idFront, setIdFront] = useState<string | undefined>();
  const [idBack, setIdBack] = useState<string | undefined>();
  const [vehicleType, setVehicleType] = useState("Moto");
  const [plateNumber, setPlateNumber] = useState("");

  const activeCount = couriers.filter((c) => c.active).length;

  const resetForm = () => {
    setName("");
    setPhone("");
    setAge("");
    setMaritalStatus("celibataire");
    setZoneId("zone_1");
    setIdFront(undefined);
    setIdBack(undefined);
    setVehicleType("Moto");
    setPlateNumber("");
  };

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string | undefined) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) setter(URL.createObjectURL(file));
  };

  const handleCreate = () => {
    if (!name.trim() || !phone.trim()) return;
    addCourier({
      name: name.trim(),
      phone: phone.trim(),
      zoneId,
      active: true,
      age: age ? parseInt(age, 10) : undefined,
      maritalStatus,
      idCardFrontUrl: idFront,
      idCardBackUrl: idBack,
      vehicleType,
      plateNumber: plateNumber.trim() || undefined,
      isVerified: false,
      registeredAtLabel: new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    });
    resetForm();
    setOpen(false);
    toast("Livreur enregistré", "success");
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Livreurs"
        description="Équipe de livraison — inscription, zones et réassignation"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Nouveau livreur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Enregistrer un livreur
                </DialogTitle>
                <DialogDescription>
                  Informations personnelles, zone d&apos;affectation et pièce
                  d&apos;identité.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="c-name">Nom complet</Label>
                  <Input
                    id="c-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex. Mamadou Keita"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="c-phone">Téléphone</Label>
                    <Input
                      id="c-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+224 6XX XXX XXX"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="c-age">Âge</Label>
                    <Input
                      id="c-age"
                      type="number"
                      min={18}
                      max={65}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="25"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>Statut matrimonial</Label>
                    <Select
                      value={maritalStatus}
                      onValueChange={(v) => setMaritalStatus(v as MaritalStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.entries(maritalLabels) as [MaritalStatus, string][]
                        ).map(([k, label]) => (
                          <SelectItem key={k} value={k}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Zone assignée</Label>
                    <Select value={zoneId} onValueChange={setZoneId}>
                      <SelectTrigger>
                        <SelectValue />
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>Véhicule</Label>
                    <Select value={vehicleType} onValueChange={setVehicleType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Moto">Moto</SelectItem>
                        <SelectItem value="Vélo">Vélo</SelectItem>
                        <SelectItem value="Voiture">Voiture</SelectItem>
                        <SelectItem value="Tricycle">Tricycle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="c-plate">Immatriculation</Label>
                    <Input
                      id="c-plate"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      placeholder="GN-XXXX-XX"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="c-id-front">CNI — recto</Label>
                    <Input
                      id="c-id-front"
                      type="file"
                      accept="image/*"
                      className="text-xs"
                      onChange={(e) => handleFile(e, setIdFront)}
                    />
                    {idFront && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={idFront}
                        alt="CNI recto"
                        className="h-16 w-full rounded-md object-cover border"
                      />
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="c-id-back">CNI — verso</Label>
                    <Input
                      id="c-id-back"
                      type="file"
                      accept="image/*"
                      className="text-xs"
                      onChange={(e) => handleFile(e, setIdBack)}
                    />
                    {idBack && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={idBack}
                        alt="CNI verso"
                        className="h-16 w-full rounded-md object-cover border"
                      />
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!name.trim() || !phone.trim()}
                >
                  Enregistrer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total livreurs"
          value={couriers.length.toString()}
          change="Équipe enregistrée"
          changeType="neutral"
          icon={FiUsers}
        />
        <StatCard
          title="Disponibles"
          value={activeCount.toString()}
          change={`${couriers.length - activeCount} indisponible(s)`}
          changeType="positive"
          icon={FiUserCheck}
        />
        <StatCard
          title="Commandes bloquées"
          value={stuckOrders.length.toString()}
          change="À réassigner"
          changeType={stuckOrders.length > 0 ? "negative" : "positive"}
          icon={FiTruck}
        />
      </div>

      <DataTable
        data={couriers}
        getRowKey={(c) => c.id}
        columns={[
          {
            key: "name",
            header: "Livreur",
            render: (c) => (
              <div>
                <p className="font-medium">{c.name}</p>
                {c.registeredAtLabel && (
                  <p className="text-xs text-muted-foreground">
                    Depuis {c.registeredAtLabel}
                  </p>
                )}
              </div>
            ),
          },
          { key: "phone", header: "Téléphone", render: (c) => c.phone },
          {
            key: "zone",
            header: "Zone",
            render: (c) =>
              zones.find((z) => z.id === c.zoneId)?.name ?? c.zoneId,
          },
          {
            key: "profile",
            header: "Profil",
            className: "hidden md:table-cell",
            render: (c) => (
              <span className="text-sm text-muted-foreground">
                {c.age ? `${c.age} ans` : "—"}
                {c.maritalStatus
                  ? ` · ${maritalLabels[c.maritalStatus]}`
                  : ""}
              </span>
            ),
          },
          {
            key: "vehicle",
            header: "Véhicule",
            className: "hidden lg:table-cell",
            render: (c) => (
              <span className="text-sm text-muted-foreground">
                {c.vehicleType || "—"}
                {c.plateNumber ? ` · ${c.plateNumber}` : ""}
              </span>
            ),
          },
          {
            key: "id",
            header: "KYC",
            className: "hidden lg:table-cell",
            render: (c) =>
              c.isVerified || c.idCardFrontUrl ? (
                <Badge variant="outline" className="text-xs">
                  Vérifié
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  En attente
                </Badge>
              ),
          },
          {
            key: "active",
            header: "Disponible",
            render: (c) => (
              <Switch
                checked={c.active}
                onCheckedChange={() => toggleCourierActive(c.id)}
              />
            ),
          },
        ]}
      />

      <div>
        <h3 className="font-semibold mb-3 text-sm">
          Commandes bloquées — réassignation
        </h3>
        <DataTable
          data={stuckOrders}
          getRowKey={(o) => o.id}
          emptyMessage="Aucune commande bloquée"
          columns={[
            { key: "id", header: "Commande", render: (o) => o.id },
            { key: "status", header: "Statut", render: (o) => o.status },
            { key: "zone", header: "Trajet", render: (o) => o.zoneLabel },
            {
              key: "courier",
              header: "Livreur",
              render: (o) => (
                <Select
                  value={o.courierId ?? ""}
                  onValueChange={(id) => {
                    reassignOrder(o.id, id);
                    toast(`Commande ${o.id} réassignée`, "success");
                  }}
                >
                  <SelectTrigger className="h-9 w-40">
                    <SelectValue placeholder="Assigner" />
                  </SelectTrigger>
                  <SelectContent>
                    {couriers
                      .filter((c) => c.active)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
