"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import type { AlertState } from "@/lib/types";
import { apiErrorMessage } from "./shared";

export default function AlerteTab({ initial, onMutated }: { initial: AlertState; onMutated?: () => void }) {
  const [active, setActive] = useState(initial.active);
  const [message, setMessage] = useState(initial.message);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const res = await fetch("/api/admin/login", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active, message }),
    });
    setBusy(false);
    if (res.ok) {
      onMutated?.();
      toast({
        title: active ? "Alerte affichée au village" : "Alerte désactivée",
        description: active ? "Le bandeau rouge apparaît en haut de l'accueil." : "Le bandeau est retiré du tableau officiel.",
      });
    } else {
      toast({ title: "Erreur d'enregistrement", description: await apiErrorMessage(res, "Réessayez."), variant: "destructive" });
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-vert-deep">Bandeau d'alerte urgente</h2>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Message rouge en tête du tableau officiel — vaccination, crue, coupure d'eau…
            N'activez l'alerte qu'après vérification auprès du poste de santé.
          </p>
        </div>
        <Switch checked={active} onCheckedChange={setActive} aria-label="Activer l'alerte" />
      </div>
      <div className="mt-4 grid gap-1.5">
        <Label htmlFor="alert-msg" className="font-bold">Message d'alerte</Label>
        <Textarea id="alert-msg" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="font-semibold" />
      </div>
      {active && message && (
        <div className="mt-4 rounded-2xl border-2 border-destructive/60 bg-destructive/10 p-4" role="alert">
          <p className="text-xs font-extrabold uppercase tracking-wide text-destructive">Aperçu — Alerte urgente</p>
          <p className="mt-1 text-sm font-semibold">{message}</p>
        </div>
      )}
      <Button onClick={save} disabled={busy} className="mt-4 h-12 w-full gap-2 bg-vert font-black hover:bg-vert-deep sm:w-auto sm:px-8">
        {busy ? "Enregistrement…" : "Enregistrer l'alerte"}
      </Button>
    </div>
  );
}
