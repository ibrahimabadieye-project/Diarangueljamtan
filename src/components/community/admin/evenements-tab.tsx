"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { eventKindFor, formatShortDate, formatTime } from "@/lib/format";
import type { VillageEvent } from "@/lib/types";
import { VILLAGE_QUARTIERS } from "@/lib/types";
import { EVENT_KIND_OPTIONS, toInputValue, apiErrorMessage } from "./shared";

type EventForm = {
  id?: string;
  kind: string;
  title: string;
  startAt: string;
  endAt: string;
  location: string;
  quartier: string;
  family: string;
  notes: string;
};

const EMPTY_EVENT: EventForm = {
  kind: "assemblee",
  title: "",
  startAt: "",
  endAt: "",
  location: "",
  quartier: "Centre du village",
  family: "CVD de Diaranguel",
  notes: "",
};

export default function EvenementsTab({ initial, onMutated }: { initial: VillageEvent[]; onMutated?: () => void }) {
  const [items, setItems] = useState<VillageEvent[]>(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<EventForm>(EMPTY_EVENT);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setItems(initial); }, [initial]);

  const submit = async () => {
    if (!form.title.trim() || !form.startAt) {
      toast({ title: "Titre et date obligatoires", variant: "destructive" });
      return;
    }
    setBusy(true);
    const payload = {
      ...form,
      startAt: new Date(form.startAt).toISOString(),
      endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
    };
    const res = form.id
      ? await fetch(`/api/events/${form.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setBusy(false);
    if (res.ok) {
      const saved: VillageEvent = await res.json();
      setItems((prev) => {
        const next = form.id ? prev.map((x) => (x.id === saved.id ? saved : x)) : [...prev, saved];
        return [...next].sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
      });
      setOpen(false);
      setForm(EMPTY_EVENT);
      onMutated?.();
      toast({ title: form.id ? "Événement modifié" : "Événement ajouté", description: "Il apparaîtra dans l'agenda du village." });
    } else {
      toast({ title: "Erreur d'enregistrement", description: await apiErrorMessage(res, "Vérifiez les champs saisis."), variant: "destructive" });
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cet événement ?")) return;
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((x) => x.id !== id));
      onMutated?.();
      toast({ title: "Événement supprimé" });
    }
  };

  return (
    <div className="space-y-3">
      <Button onClick={() => { setForm(EMPTY_EVENT); setOpen(true); }} className="h-12 w-full gap-2 bg-vert font-black hover:bg-vert-deep sm:w-auto">
        <Plus className="h-5 w-5" aria-hidden /> Nouvel événement
      </Button>
      {items.map((e) => {
        const meta = eventKindFor(e.kind);
        return (
          <div key={e.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold" style={{ backgroundColor: meta.bg, color: meta.color }}>
              {meta.label}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{e.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatShortDate(e.startAt)} {formatTime(e.startAt)} · {e.location}
              </p>
            </div>
            <Button size="icon" variant="outline" onClick={() => { setForm({ id: e.id, kind: e.kind, title: e.title, startAt: toInputValue(e.startAt), endAt: e.endAt ? toInputValue(e.endAt) : "", location: e.location, quartier: e.quartier, family: e.family, notes: e.notes ?? "" }); setOpen(true); }} aria-label="Modifier">
              <Pencil className="h-4 w-4" aria-hidden />
            </Button>
            <Button size="icon" variant="destructive" onClick={() => remove(e.id)} aria-label="Supprimer">
              <Trash2 className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        );
      })}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined} className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Modifier l'événement" : "Nouvel événement"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label className="font-bold">Type</Label>
              <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v })}>
                <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EVENT_KIND_OPTIONS.map((k) => <SelectItem key={k} value={k}>{eventKindFor(k).label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ev-title" className="font-bold">Titre</Label>
              <Input id="ev-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-12 font-semibold" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="ev-start" className="font-bold">Début</Label>
                <Input id="ev-start" type="datetime-local" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} className="h-12" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="ev-end" className="font-bold">Fin (option)</Label>
                <Input id="ev-end" type="datetime-local" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} className="h-12" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="ev-loc" className="font-bold">Lieu</Label>
                <Input id="ev-loc" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="h-12" />
              </div>
              <div className="grid gap-1.5">
                <Label className="font-bold">Quartier</Label>
                <Select value={form.quartier} onValueChange={(v) => setForm({ ...form, quartier: v })}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VILLAGE_QUARTIERS.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ev-family" className="font-bold">Famille / organisateur</Label>
              <Input id="ev-family" value={form.family} onChange={(e) => setForm({ ...form, family: e.target.value })} className="h-12" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ev-notes" className="font-bold">Détails</Label>
              <Textarea id="ev-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="font-semibold" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={submit} disabled={busy} className="bg-vert font-bold hover:bg-vert-deep">
              {busy ? "Enregistrement…" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
