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
import { badgeFor, formatShortDate } from "@/lib/format";
import type { Announcement } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ANNOUNCE_KINDS, toInputValue, apiErrorMessage } from "./shared";

type AnnouncementForm = {
  id?: string;
  kind: string;
  title: string;
  author: string;
  body: string;
  date: string;
};

const EMPTY_ANNOUNCE: AnnouncementForm = {
  kind: "communique",
  title: "",
  author: "Conseil Villageois de Développement",
  body: "",
  date: "",
};

export default function AnnoncesTab({ initial, onMutated }: { initial: Announcement[]; onMutated?: () => void }) {
  const [items, setItems] = useState<Announcement[]>(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AnnouncementForm>(EMPTY_ANNOUNCE);
  const [busy, setBusy] = useState(false);

  // Synchronisation avec les données serveur après un router.refresh()
  useEffect(() => { setItems(initial); }, [initial]);

  const submit = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast({ title: "Titre et contenu obligatoires", variant: "destructive" });
      return;
    }
    setBusy(true);
    const payload = { ...form, date: form.date ? new Date(form.date).toISOString() : new Date().toISOString() };
    const res = form.id
      ? await fetch(`/api/announcements/${form.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setBusy(false);
    if (res.ok) {
      const saved: Announcement = await res.json();
      setItems((prev) => {
        const next = form.id ? prev.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...prev];
        return [...next].sort((a, b) => +new Date(b.date) - +new Date(a.date));
      });
      setOpen(false);
      setForm(EMPTY_ANNOUNCE);
      onMutated?.();
      toast({ title: form.id ? "Annonce modifiée" : "Annonce publiée", description: "Le village la verra au tableau officiel." });
    } else {
      toast({ title: "Erreur d'enregistrement", description: await apiErrorMessage(res, "Vérifiez les champs saisis."), variant: "destructive" });
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((x) => x.id !== id));
      onMutated?.();
      toast({ title: "Annonce supprimée" });
    }
  };

  return (
    <div className="space-y-3">
      <Button onClick={() => { setForm(EMPTY_ANNOUNCE); setOpen(true); }} className="h-12 w-full gap-2 bg-vert font-black hover:bg-vert-deep sm:w-auto">
        <Plus className="h-5 w-5" aria-hidden /> Nouvelle annonce
      </Button>
      {items.map((a) => (
        <div key={a.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase", badgeFor(a.kind).className)}>
            {badgeFor(a.kind).label}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">{a.title}</p>
            <p className="text-xs text-muted-foreground">{formatShortDate(a.date)} · {a.author}</p>
          </div>
          <Button size="icon" variant="outline" onClick={() => { setForm({ id: a.id, kind: a.kind, title: a.title, author: a.author, body: a.body, date: toInputValue(a.date) }); setOpen(true); }} aria-label="Modifier">
            <Pencil className="h-4 w-4" aria-hidden />
          </Button>
          <Button size="icon" variant="destructive" onClick={() => remove(a.id)} aria-label="Supprimer">
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined} className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Modifier l'annonce" : "Nouvelle annonce"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label className="font-bold">Catégorie</Label>
              <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v })}>
                <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ANNOUNCE_KINDS.map((k) => <SelectItem key={k.id} value={k.id}>{k.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="an-title" className="font-bold">Titre</Label>
              <Input id="an-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-12 font-semibold" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="an-author" className="font-bold">Signataire</Label>
              <Input id="an-author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="h-12" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="an-date" className="font-bold">Date</Label>
              <Input id="an-date" type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="h-12" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="an-body" className="font-bold">Contenu</Label>
              <Textarea id="an-body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={6} className="font-semibold" />
              <p className="text-xs text-muted-foreground">
                Astuce : n'écrivez pas le jour de la semaine dans le texte (ex. « jeudi 27… ») — il s'affiche automatiquement à partir de la date choisie.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={submit} disabled={busy} className="bg-vert font-bold hover:bg-vert-deep">
              {busy ? "Enregistrement…" : "Publier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
