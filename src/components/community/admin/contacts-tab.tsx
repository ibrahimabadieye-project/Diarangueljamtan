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
import type { Contact } from "@/lib/types";
import { CONTACT_CATEGORY_OPTIONS, apiErrorMessage } from "./shared";

type ContactForm = {
  id?: string;
  category: string;
  name: string;
  role: string;
  quartier: string;
  city: string;
  phone: string;
  whatsapp: string;
  note: string;
};

const EMPTY_CONTACT: ContactForm = { category: "urgence", name: "", role: "", quartier: "", city: "", phone: "", whatsapp: "", note: "" };

export default function ContactsTab({ initial, onMutated }: { initial: Contact[]; onMutated?: () => void }) {
  const [items, setItems] = useState<Contact[]>(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ContactForm>(EMPTY_CONTACT);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setItems(initial); }, [initial]);

  const submit = async () => {
    if (!form.name.trim() || !form.role.trim() || !form.phone.trim()) {
      toast({ title: "Nom, fonction et téléphone obligatoires", variant: "destructive" });
      return;
    }
    setBusy(true);
    const res = form.id
      ? await fetch(`/api/contacts/${form.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      : await fetch("/api/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setBusy(false);
    if (res.ok) {
      const saved: Contact = await res.json();
      setItems((prev) => {
        const next = form.id ? prev.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...prev];
        return [...next].sort((a, b) => a.name.localeCompare(b.name, "fr"));
      });
      setOpen(false);
      setForm(EMPTY_CONTACT);
      onMutated?.();
      toast({ title: form.id ? "Contact modifié" : "Contact ajouté" });
    } else {
      toast({ title: "Erreur d'enregistrement", description: await apiErrorMessage(res, "Vérifiez les champs saisis."), variant: "destructive" });
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce contact ?")) return;
    const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((x) => x.id !== id));
      onMutated?.();
      toast({ title: "Contact supprimé" });
    }
  };

  return (
    <div className="space-y-3">
      <Button onClick={() => { setForm(EMPTY_CONTACT); setOpen(true); }} className="h-12 w-full gap-2 bg-vert font-black hover:bg-vert-deep sm:w-auto">
        <Plus className="h-5 w-5" aria-hidden /> Nouveau contact
      </Button>
      {items.map((c) => (
        <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vert-pale font-black text-vert-deep">
            {c.name.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">{c.name}</p>
            <p className="truncate text-xs text-muted-foreground">{c.role} · {c.phone}</p>
          </div>
          <Button size="icon" variant="outline" onClick={() => { setForm({ id: c.id, category: c.category, name: c.name, role: c.role, quartier: c.quartier ?? "", city: c.city ?? "", phone: c.phone, whatsapp: c.whatsapp ?? "", note: c.note ?? "" }); setOpen(true); }} aria-label="Modifier">
            <Pencil className="h-4 w-4" aria-hidden />
          </Button>
          <Button size="icon" variant="destructive" onClick={() => remove(c.id)} aria-label="Supprimer">
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined} className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Modifier le contact" : "Nouveau contact"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label className="font-bold">Catégorie</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTACT_CATEGORY_OPTIONS.map((k) => <SelectItem key={k.id} value={k.id}>{k.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="c-name" className="font-bold">Nom</Label>
                <Input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-12 font-semibold" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="c-phone" className="font-bold">Téléphone</Label>
                <Input id="c-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-12" placeholder="77 000 00 00" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="c-role" className="font-bold">Fonction</Label>
              <Input id="c-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="h-12" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="c-quartier" className="font-bold">Quartier</Label>
                <Input id="c-quartier" value={form.quartier} onChange={(e) => setForm({ ...form, quartier: e.target.value })} className="h-12" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="c-city" className="font-bold">Ville (diaspora)</Label>
                <Input id="c-city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="h-12" placeholder="Dakar, Lyon…" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="c-wa" className="font-bold">WhatsApp</Label>
              <Input id="c-wa" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="h-12" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="c-note" className="font-bold">Note</Label>
              <Textarea id="c-note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} className="font-semibold" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={submit} disabled={busy} className="bg-vert font-bold hover:bg-vert-deep">
              {busy ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
