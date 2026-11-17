// Seed Diaranguel — DONNÉES DE DÉMONSTRATION réalistes
// ⚠️ Tout ce contenu est fictif (personnes, téléphones, dates d'événements).
// À remplacer par les données réelles du village avant toute mise en ligne.
// Village de l'île à Morphil (arrondissement de Saldé, département de Podor, région de Saint-Louis)
//
// Garde-fou : le seed vide les six tables. Il refuse de s'exécuter si la base
// contient déjà des données, sauf si FORCE_SEED=1 est explicitement défini.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const D = (s: string) => new Date(s);

async function main() {
  const existing = await db.announcement.count();
  if (existing > 0 && process.env.FORCE_SEED !== "1") {
    console.error(
      "Seed interrompu : la base contient déjà des données. " +
        "Pour les remplacer volontairement, relancez avec FORCE_SEED=1."
    );
    return;
  }

  await db.announcement.deleteMany();
  await db.event.deleteMany();
  await db.contact.deleteMany();
  await db.healthTransportInfo.deleteMany();
  await db.routeStep.deleteMany();
  await db.historyArticle.deleteMany();

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 1 — Tableau d'affichage officiel
  // ─────────────────────────────────────────────────────────────────────────
  await db.announcement.createMany({
    data: [
      {
        kind: "conseil",
        title: "Ouverture de la campagne de récolte du riz dans le Walo",
        author: "Conseil Villageois de Développement",
        body: "Le comité de gestion du périmètre rizicole annonce le début de la récolte de décrue sur les terres du Walo, du lundi 23 novembre au 15 décembre 2026.\n\n• Répartition des parcelles : dimanche 22 novembre à 10h au pied du château d'eau.\n• Les propriétaires de terres du Diéri cultivant en pluvial (mil, sorgho, niébé) sont invités à finaliser leurs récoltes avant les fêtes.\n• L'entraide villageoise est sollicitée : chaque famille doit fournir au moins un bras pour les teams de coupe.\n\nJaraama à tous pour la mobilisation !",
        date: D("2026-11-18T08:30:00.000Z"),
      },
      {
        kind: "communique",
        title: "Visite de la délégation du Jumelage JAD (Saint-Pierre-de-Bœuf)",
        author: "Chefferie du village",
        body: "Une délégation de notre commune jumelée Saint-Pierre-de-Bœuf (France) sera reçue au village du vendredi 18 décembre au mardi 22 décembre 2026, dans le cadre du partenariat JAD qui nous lie depuis 1988.\n\nAu programme :\n• Remise de matériel scolaire à l'école primaire publique.\n• Visite de la case de santé et point sur le réseau d'adduction d'eau potable (château d'eau).\n• Échange avec les jeunes du village sur le maraîchage et la riziculture.\n\nUne cérémonie d'accueil aura lieu à la place publique. Tous les habitants et ressortissants présents sont attendus.",
        date: D("2026-11-15T16:00:00.000Z"),
      },
      {
        kind: "diaspora",
        title: "Assemblée générale de l'Association des Ressortissants de Diaranguel (ARD)",
        author: "ARD — Section Dakar",
        body: "L'ARD invite tous les ressortissants de Diaranguel vivant à Dakar et dans les régions à son assemblée générale annuelle :\n\n• Quand : dimanche 14 février 2027, 10h précises.\n• Où : Maison des jeunes de Pikine (salle réservée par la famille Dieye).\n\nÀ l'ordre du jour : cotisations 2027, projet d'équipement de la case de santé, soutien au périmètre rizicole du Walo et préparation de la fête annuelle de retrouvailles au village.\n\nLe village compte sur sa diaspora — No Diaranguel yaafi !",
        date: D("2026-11-10T18:00:00.000Z"),
      },
      {
        kind: "mariage",
        title: "Mariage traditionnel chez la famille Sy",
        author: "Familles Sy et Diop",
        body: "Les familles Sy de Diaranguel et Diop de Ndioum ont la joie d'annoncer le mariage de leurs enfants, prévu le dimanche 29 novembre 2026 au quartier du fleuve.\n\n• Cérémonie religieuse : 9h à la mosquée centrale.\n• Réception : à partir de 11h, cour de la famille Sy.\n\nLe village tout entier est convié. Que Dieu bénisse les mariés !",
        date: D("2026-11-08T09:00:00.000Z"),
      },
      {
        kind: "naissance",
        title: "Baptême traditionnel de l'enfant de la famille Ba",
        author: "Famille Ba",
        body: "La famille Ba du quartier de l'école annonce le baptême traditionnel (donnée du nom) de l'enfant de Moussa et Hawa Ba, le samedi 5 décembre 2026 dès 9h.\n\n• Rassemblement des griots et des anciens dès la veille.\n• Le repas communautaire est ouvert à tout le village : plats de riz au poisson du fleuve préparés par le GIE des femmes.\n\nJaraama pour vos prières et vos dons !",
        date: D("2026-11-06T10:00:00.000Z"),
      },
      {
        kind: "deces",
        title: "Avis de décès — El Hadj Mamadou Sy, doyen du village",
        author: "La communauté de Diaranguel",
        body: "La communauté de Diaranguel annonce avec tristesse le décès du doyen du village, El Hadj Mamadou Sy, survenu à l'âge de 92 ans, après une vie consacrée au fleuve, à la terre et à la paix du village.\n\n• Prière des morts : célébrée à la mosquée centrale.\n• Condoléances : auprès de la famille Sy, au quartier du fleuve.\n\n« Allah ayyana mo aljanna » — Que Dieu Tout-Puissant lui accorde le Paradis (Aljanna) et réconforte sa famille.",
        date: D("2026-11-04T07:00:00.000Z"),
      },
      {
        kind: "conseil",
        title: "Entretien du château d'eau et du réseau d'adduction",
        author: "Comité de gestion de l'eau",
        body: "Dans le cadre de l'entretien du château d'eau financé par le jumelage JAD et la mobilisation des habitants, le comité de gestion de l'eau procédera à la purge du réservoir :\n\n• Vendredi 27 novembre de 8h à 12h : coupure d'eau sur l'ensemble du réseau.\n• Les robinets du centre resteront fermés ; reprise progressive en fin de matinée.\n• La cotisation trimestrielle pour l'entretien du forage est due auprès du fontainier, Moussa Ba.\n\nL'eau potable est le bien commun du village : préservons-la ensemble.",
        date: D("2026-11-03T08:00:00.000Z"),
      },
      {
        kind: "communique",
        title: "Renforcement de l'éclairage solaire de la place publique",
        author: "Conseil Villageois de Développement",
        body: "Suite à l'installation de lampadaires solaires offerte par les ressortissants d'Italie (famille Ba), l'entretien des batteries sera effectué par l'électricien solaire du village.\n\nLes jeunes du village organisent une corvée volontaire de nettoyage de la place publique samedi matin. Participation de tous encouragée — la solidarité est notre richesse.",
        date: D("2026-10-28T17:30:00.000Z"),
      },
    ],
  });

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 2 — Agenda du village
  // ─────────────────────────────────────────────────────────────────────────
  await db.event.createMany({
    data: [
      {
        kind: "marche",
        title: "Marché hebdomadaire du village",
        startAt: D("2026-11-22T08:00:00.000Z"),
        endAt: D("2026-11-22T14:00:00.000Z"),
        location: "Place publique",
        quartier: "Centre du village",
        family: "Tous les commerçants",
        notes: "Chaque dimanche : bétail, poisson frais du fleuve, riz du Walo, tissus, thé et sucre. Venir tôt pour les meilleurs produits.",
      },
      {
        kind: "assemblee",
        title: "Répartition des parcelles de récolte du Walo",
        startAt: D("2026-11-22T10:00:00.000Z"),
        endAt: D("2026-11-22T12:00:00.000Z"),
        location: "Au pied du château d'eau",
        quartier: "Centre du village",
        family: "Comité de gestion du périmètre rizicole",
        notes: "Répartition des parcelles de récolte de décrue entre les familles. Présence obligatoire d'un représentant par ménage.",
      },
      {
        kind: "mariage",
        title: "Mariage des familles Sy & Diop",
        startAt: D("2026-11-29T09:00:00.000Z"),
        endAt: D("2026-11-29T18:00:00.000Z"),
        location: "Mosquée centrale puis cour de la famille Sy",
        quartier: "Quartier du fleuve",
        family: "Familles Sy et Diop (de Ndioum)",
        notes: "Cérémonie religieuse à 9h, réception toute la journée. Le village est convié.",
      },
      {
        kind: "sante",
        title: "Séance de vaccination (PEV) des enfants",
        startAt: D("2026-12-01T08:00:00.000Z"),
        endAt: D("2026-12-01T12:00:00.000Z"),
        location: "Case de santé de Diaranguel",
        quartier: "Quartier de l'école",
        family: "ASC — Aminata Dieye",
        notes: "Premier mardi du mois. Vaccinations gratuitées : BCG, rougeole, polio. Apporter le carnet de l'enfant.",
      },
      {
        kind: "sport",
        title: "Grand match de lutte — Diaranguel contre Mal",
        startAt: D("2026-12-12T16:30:00.000Z"),
        endAt: D("2026-12-12T19:00:00.000Z"),
        location: "Terrain de lutte de la place publique",
        quartier: "Centre du village",
        family: "Jeunesse de Diaranguel",
        notes: "Le village voisin de Mal vient défier nos lutteurs. Percussions (tama, sabar), boisson locale et ambassadeurs de chaque quartier attendus.",
      },
      {
        kind: "bapteme",
        title: "Baptême traditionnel de l'enfant de la famille Ba",
        startAt: D("2026-12-05T09:00:00.000Z"),
        endAt: D("2026-12-05T16:00:00.000Z"),
        location: "Cour de la famille Ba",
        quartier: "Quartier de l'école",
        family: "Famille Ba",
        notes: "Donnée du nom, rasage traditionnel et repas communautaire : riz au poisson du fleuve préparé par le GIE des femmes.",
      },
      {
        kind: "culture",
        title: "Visite de la délégation du jumelage JAD (Saint-Pierre-de-Bœuf)",
        startAt: D("2026-12-18T10:00:00.000Z"),
        endAt: D("2026-12-22T17:00:00.000Z"),
        location: "Place publique, école et case de santé",
        quartier: "Centre du village",
        family: "Comité de jumelage & CVD",
        notes: "4 jours d'échanges : remise de matériel scolaire, point eau potable, ateliers maraîchage. Cérémonie d'accueil vendredi à la place publique.",
      },
      {
        kind: "culture",
        title: "Soirée culturelle de la jeunesse — contes et chants pulaar",
        startAt: D("2026-12-26T20:00:00.000Z"),
        endAt: D("2026-12-26T23:30:00.000Z"),
        location: "Place publique (sous les lampadaires solaires)",
        quartier: "Centre du village",
        family: "Association des jeunes de Diaranguel",
        notes: "Contes du Fouta-Toro, chants pulaar, théâtre sur l'histoire du village. Prévoir une natte ou un tabouret.",
      },
      {
        kind: "assemblee",
        title: "Rentrée du 2e trimestre — école primaire publique",
        startAt: D("2027-01-04T08:00:00.000Z"),
        endAt: D("2027-01-04T12:00:00.000Z"),
        location: "École primaire publique de Diaranguel",
        quartier: "Quartier de l'école",
        family: "Direction de l'école — Modou Ndongo",
        notes: "Reprise des classes du 2e trimestre. Réunion des parents d'élèves à 10h : équipement offert par le jumelage JAD.",
      },
      {
        kind: "diaspora",
        title: "Assemblée générale de l'ARD à Dakar",
        startAt: D("2027-02-14T10:00:00.000Z"),
        endAt: D("2027-02-14T16:00:00.000Z"),
        location: "Maison des jeunes de Pikine, Dakar",
        quartier: "—",
        family: "Association des Ressortissants de Diaranguel",
        notes: "Cotisations 2027, projet case de santé, soutien riziculture, fête annuelle des retrouvailles. Contact : Cheikh Dieye.",
      },
      {
        kind: "religieux",
        title: "Nuit du Maouloud (Gamu) — veillée religieuse (date indicative)",
        startAt: D("2027-08-13T20:00:00.000Z"),
        endAt: D("2027-08-14T06:00:00.000Z"),
        location: "Mosquée centrale de Diaranguel",
        quartier: "Centre du village",
        family: "Imam El Hadj Kalidou Sall",
        notes: "Veillée de prières et chants religieux pour la nuit du Maouloud. Les femmes préparent le dègué et le café pour la nuit. ⚠️ Date indicative mi-août 2027 : la fête est fixée par les autorités religieuses (Conacoc) selon le calendrier lunaire — à confirmer.",
      },
      {
        kind: "marche",
        title: "Marché hebdomadaire du village",
        startAt: D("2026-11-29T08:00:00.000Z"),
        endAt: D("2026-11-29T14:00:00.000Z"),
        location: "Place publique",
        quartier: "Centre du village",
        family: "Tous les commerçants",
        notes: "Chaque dimanche. Exception : le 29 novembre, le marché se tient tôt pour laisser place au mariage de la famille Sy.",
      },
    ],
  });

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 3 — Annuaire
  // ─────────────────────────────────────────────────────────────────────────
  await db.contact.createMany({
    data: [
      // ── Urgences & Autorités ──
      { category: "urgence", name: "Amadou Tidiane Diop", role: "Chef de village", quartier: "Centre du village", phone: "77 512 04 41", whatsapp: "77 512 04 41", note: "Autorité coutumière — dossier administratif, conflits, représentation du village." },
      { category: "urgence", name: "Ibrahima Sy", role: "Président du Comité Villageois de Développement (CVD)", quartier: "Centre du village", phone: "77 645 18 22", whatsapp: "77 645 18 22", note: "Projets de développement, partenariats (JAD), entraide villageoise." },
      { category: "urgence", name: "El Hadj Kalidou Sall", role: "Imam de la mosquée centrale", quartier: "Centre du village", phone: "76 330 95 14", whatsapp: undefined, note: "Prière des morts, cérémonies religieuses, calendrier des fêtes." },
      { category: "urgence", name: "Mamadou Dieye", role: "Infirmier-chef — Case de santé", quartier: "Quartier de l'école", phone: "77 428 67 90", whatsapp: "77 428 67 90", note: "Premiers soins, urgences de jour. Cas graves : orientation vers Pété puis Ndioum." },
      { category: "urgence", name: "Aminata Dieye", role: "Présidente de l'ASC (Santé communautaire)", quartier: "Quartier de l'école", phone: "76 902 55 31", whatsapp: "76 902 55 31", note: "Matrones, CPN, vaccinations, sensibilisation sanitaire." },
      { category: "urgence", name: "Modou Ndongo", role: "Directeur de l'école primaire publique", quartier: "Quartier de l'école", phone: "77 864 20 07", whatsapp: "77 864 20 07", note: "Inscriptions, suivi scolaire, matériel offert par le jumelage JAD." },
      { category: "urgence", name: "Moussa Ba", role: "Fontainier — Comité de gestion de l'eau", quartier: "Au pied du château d'eau", phone: "70 741 36 18", whatsapp: undefined, note: "Réseau d'eau potable : robinets, cotisation d'entretien du forage, pannes." },
      { category: "urgence", name: "Gendarmerie de Pété", role: "Sécurité — brigade la plus proche (12 km)", quartier: "Pété (RN2)", city: "Pété", phone: "77 901 33 55", whatsapp: undefined, note: "Urgence : composer le 17 depuis tout téléphone. Traversées du Doué et sécurité de la piste." },
      { category: "urgence", name: "Poste de santé de Pété", role: "Orientation médicale (12 km)", quartier: "Pété", city: "Pété", phone: "77 233 46 08", whatsapp: undefined, note: "Cas graves : évacuation vers le centre de santé de Pété puis l'hôpital de Ndioum (45 km)." },
      { category: "urgence", name: "Cheikh Dieye", role: "Président de l'ARD — section Dakar", quartier: "—", city: "Dakar (Pikine)", phone: "77 556 71 92", whatsapp: "77 556 71 92", note: "Diaspora dakaroise : cotisations, entraide, transport des élèves internes." },

      // ── Ouvriers & Artisans ──
      { category: "artisan", name: "Demba Ba", role: "Maçon-bâtisseur", quartier: "Quartier du fleuve", phone: "77 609 88 42", whatsapp: "77 609 88 42", note: "Constructions en banco et ciment, puits, murets. 15 ans de métier." },
      { category: "artisan", name: "Hamady Ndongo", role: "Forgeron", quartier: "Centre du village", phone: "76 517 42 90", whatsapp: undefined, note: "Outils agricoles : houes, daba, réparation de secko (équipement de décrue)." },
      { category: "artisan", name: "Ousmane Sy", role: "Menuisier-charpentier", quartier: "Quartier du fleuve", phone: "77 358 14 66", whatsapp: "77 358 14 66", note: "Charpente, tables-bancs d'école, caisses de transport du poisson." },
      { category: "artisan", name: "Aliou Dieye", role: "Mécanicien motos", quartier: "Centre du village", phone: "77 134 79 25", whatsapp: "77 134 79 25", note: "Réparation motos Jakarta et tricycles — indispensable sur la piste de l'île à Morphil." },
      { category: "artisan", name: "Ndèye Diop", role: "Couturière", quartier: "Quartier de l'école", phone: "76 480 22 53", whatsapp: "76 480 22 53", note: "Robes de cérémonie, boubous, broderie pour baptêmes et mariages." },
      { category: "artisan", name: "Khady Sy", role: "Coiffeuse & tresses", quartier: "Centre du village", phone: "70 925 61 37", whatsapp: "70 925 61 37", note: "Tresses traditionnelles, soins avant cérémonies — se déplace à domicile." },
      { category: "artisan", name: "Moussa Dieye « le vieux »", role: "Maître des pirogues & pêcheur", quartier: "Embarcadère", phone: "77 247 05 89", whatsapp: undefined, note: "Traversées du fleuve et du Doué, connaissance des crues et du poisson." },
      { category: "artisan", name: "Aïssatou Sall", role: "Présidente du GIE des femmes maraîchères", quartier: "Quartier du fleuve (jardins)", phone: "76 613 90 74", whatsapp: "76 613 90 74", note: "Jardins maraîchers (oignons, tomates, gombo), périmètre féminin proche du fleuve." },
      { category: "artisan", name: "Ibra Ndongo", role: "Réparateur motos-pompes & périmètre rizicole", quartier: "Walo (périmètre rizicole)", phone: "77 302 48 16", whatsapp: "77 302 48 16", note: "Entretien des motos-pompes d'irrigation du périmètre rizicole du Walo." },
      { category: "artisan", name: "Adama Diop", role: "Électricien solaire", quartier: "Centre du village", phone: "76 758 11 09", whatsapp: "76 758 11 09", note: "Lampadaires solaires, kits solaires, batteries du village." },
      { category: "artisan", name: "Yaya Sall", role: "Éleveur — chef du parc à bétail", quartier: "Diéri (terres hautes)", phone: "77 941 63 27", whatsapp: undefined, note: "Bovins, ovins, caprins : vente de Tabaski, transhumance, soins vétérinaires de base." },

      // ── Habitants & Diaspora ──
      { category: "habitant", name: "Famille Dieye — Cheikh & Ndiaye Dieye", role: "Ressortissants à Dakar", quartier: "—", city: "Dakar (Pikine)", phone: "77 556 71 92", whatsapp: "77 556 71 92", note: "Accueil des étudiants dakarois, réunion ARD mensuelle, envois de colis au village." },
      { category: "habitant", name: "Famille Diop — Abdoulaye Diop", role: "Ressortissants à Dakar", quartier: "—", city: "Dakar (Guédiawaye)", phone: "77 818 27 44", whatsapp: "77 818 27 44", note: "Trésorier adjoint ARD : transport Dakar–Ndioum pour les congés scolaires." },
      { category: "habitant", name: "Famille Sy — Mariama Sy", role: "Ressortissants en France", quartier: "—", city: "Saint-Étienne (France)", phone: "+33 6 51 22 78 09", whatsapp: "+33 6 51 22 78 09", note: "Solidarité hivernage : envoi de médicaments pour la case de santé." },
      { category: "habitant", name: "Famille Sall — Saidou Sall", role: "Ressortissants en France", quartier: "—", city: "Lyon (France)", phone: "+33 6 74 39 15 62", whatsapp: "+33 6 74 39 15 62", note: "Contact du comité JAD côté Lyon : projets eau potable et école." },
      { category: "habitant", name: "Famille Ba — Oumar Ba", role: "Ressortissants en Italie", quartier: "—", city: "Turin (Italie)", phone: "+39 320 458 7712", whatsapp: "+39 320 458 7712", note: "Lampadaires solaires de la place publique et appui au GIE des femmes." },
      { category: "habitant", name: "Famille Ndongo — Modou Ndongo", role: "Ressortissants en Espagne", quartier: "—", city: "Valence (Espagne)", phone: "+34 611 90 42 37", whatsapp: "+34 611 90 42 37", note: "Soutien du club de jeunes et de l'école (fournitures, maillots de lutte)." },
      { category: "habitant", name: "Famille Diop — Kadiatou Diop", role: "Ressortissantes en Mauritanie", quartier: "—", city: "Nouakchott (Mauritanie)", phone: "+222 22 45 18 90", whatsapp: "+222 22 45 18 90", note: "Commerce transfrontalier : passage régulier par Rosso et Kaédi." },
      { category: "habitant", name: "Famille Sall — Amadou Sall", role: "Ressortissants à Kaédi (rive mauritanienne)", quartier: "—", city: "Kaédi (Mauritanie)", phone: "+222 47 71 22 06", whatsapp: "+222 47 71 22 06", note: "Traversée pirogue Diaranguel ↔ Kaédi selon la crue ; accueil des voyageurs." },
      { category: "habitant", name: "Famille Ba — Astou Ba", role: "Ressortissantes à Thiès", quartier: "—", city: "Thiès", phone: "77 405 96 13", whatsapp: "77 405 96 13", note: "Accueil des lycéens diaranguelois internes au lycée de Thiès." },
      { category: "habitant", name: "Comité JAD — Saint-Pierre-de-Bœuf", role: "Jumelage avec Diaranguel (depuis 1988)", quartier: "—", city: "Saint-Pierre-de-Bœuf (France)", phone: "+33 4 77 63 51 20", whatsapp: undefined, note: "Château d'eau, réseau d'eau potable, équipement de l'école et de la case de santé." },
    ],
  });

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 4 — Santé & Transport
  // ─────────────────────────────────────────────────────────────────────────
  await db.healthTransportInfo.createMany({
    data: [
      { section: "sante", key: "nom", label: "Case de santé de Diaranguel", value: "Quartier de l'école — à côté du château d'eau", sortOrder: 1 },
      { section: "sante", key: "urgence_tel", label: "Téléphone d'urgence (agent de garde)", value: "77 428 67 90", sortOrder: 0 },
      { section: "sante", key: "horaires", label: "Horaires d'ouverture", value: "Lundi – vendredi : 8h – 13h et 15h – 17h • Samedi : 8h – 12h • Dimanche : garde", sortOrder: 2 },
      { section: "sante", key: "equipe", label: "Équipe de garde de la semaine", value: "Infirmier-chef : Mamadou Dieye • Matrone : Hawa Sy • Présidente ASC : Aminata Dieye", sortOrder: 3 },
      { section: "sante", key: "cpn", label: "Consultations prénatales (CPN)", value: "Chaque mercredi dès 8h — suivi de grossesse et accouchements à la maternité rurale", sortOrder: 4 },
      { section: "sante", key: "pev", label: "Vaccinations des enfants (PEV)", value: "1er mardi du mois, 8h – 12h : BCG, rougeole, polio, fièvre jaune. Apporter le carnet", sortOrder: 5 },
      { section: "sante", key: "orientation", label: "Orientation des cas graves", value: "Poste de santé de Pété (12 km) → Centre de santé de Pété → Hôpital de Ndioum (45 km)", sortOrder: 6 },
      { section: "sante", key: "eau", label: "Eau potable — château d'eau", value: "Robinet du centre ouvert 7h – 10h et 16h – 19h. Réalisé grâce au jumelage JAD (Saint-Pierre-de-Bœuf) et à la mobilisation des habitants", sortOrder: 7 },
      { section: "sante", key: "pharmacie", label: "Pharmacie villageoise", value: "Médicaments essentiels en stock : paracétamol, ORS, antipaludiques. Réapprovisionnement CVD + ARD", sortOrder: 8 },

      { section: "transport", key: "sept_places", label: "Sept-places Ndioum ↔ Diaranguel", value: "Départs 7h30 et 13h30 depuis la gare de Ndioum, via Pété et le pont du Doué — 2 500 F/personne, 1h45 environ", sortOrder: 1 },
      { section: "transport", key: "dakar", label: "Dakar → Ndioum (sept-places)", value: "Gare de Pompiers à Dakar, départs toute la journée (dernier vers 17h) — 8 000 à 10 000 F, nuit possible à Ndioum", sortOrder: 2 },
      { section: "transport", key: "pirogue", label: "Pirogues & embarcadère", value: "Traversée du Doué à l'embarcadère : 50 F/personne • Liaison rive mauritanienne (Kaédi) selon la crue — contact : Moussa Dieye « le vieux »", sortOrder: 3 },
      { section: "transport", key: "piste", label: "État de la piste Pété ↔ Diaranguel", value: "PRATICABLE (saison sèche, novembre – juin) — 20 km de piste sableuse, environ 45 min", sortOrder: 4 },
      { section: "transport", key: "hivernage", label: "Période d'hivernage (juillet – septembre)", value: "DIFFICILE : prévoir 4x4, certains passages coupés après les pluies. Se renseigner au CVD avant de partir", sortOrder: 5 },
      { section: "transport", key: "charrette", label: "Charrettes pour bagages", value: "Transport des bagages depuis l'embarcadère et les gares : contacter le président du CVD, Ibrahima Sy", sortOrder: 6 },

      { section: "alerte", key: "active", label: "Bandeau d'alerte urgente", value: "false", sortOrder: 1 },
      { section: "alerte", key: "message", label: "Message d'alerte", value: "[EXEMPLE À VÉRIFIER AVANT ACTIVATION] Campagne de vaccination rougeole : tous les enfants de 0 à 5 ans sont attendus à la case de santé le mardi 1er décembre 2026, de 8h à 12h. Apporter le carnet de vaccination.", sortOrder: 2 },
    ],
  });

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 5 — Guide de route Dakar → Diaranguel (≈ 415 km)
  // ─────────────────────────────────────────────────────────────────────────
  await db.routeStep.createMany({
    data: [
      { stepNumber: 1, landmark: "Dakar → Thiès", instruction: "Au départ de la gare de Pompiers ou de l'autoroute à péage, prendre la direction de Thiès puis de Saint-Louis (RN2).", distanceKm: 70, tip: "Péage de Diamniadio. Les sept-places partent de la gare de Pompiers toute la journée." },
      { stepNumber: 2, landmark: "Thiès → Louga", instruction: "Rester sur la RN2 : Tivaouane, Mékhé, Kébémer puis Louga. Le paysage passe du baobab au dikko du Ferlo.", distanceKm: 110, tip: "Arrêt habituel des sept-places à Mékhé : café, beignets et réserves d'eau." },
      { stepNumber: 3, landmark: "Louga → Richard-Toll", instruction: "Toujours RN2 vers le nord : traversée de la zone du Ferlo puis arrivée sur le fleuve à Richard-Toll, porte du Walo.", distanceKm: 100, tip: "Dernière vraie station-service avant Ndioum : faire le plein du plein." },
      { stepNumber: 4, landmark: "Richard-Toll → Ndioum", instruction: "Suivre la RN2 qui longe le fleuve Sénégal vers l'est jusqu'à Ndioum, la « capitale » du Walo et grande gare de sept-places.", distanceKm: 80, tip: "À Ndioum : dernier marché complet, corriger les téléphones et prévoir la nuit si arrivée tardive." },
      { stepNumber: 5, landmark: "Ndioum → Pété", instruction: "Reprendre la RN2 direction Podor jusqu'à Pété, à l'entrée de l'île à Morphil.", distanceKm: 35, tip: "Contrôle de gendarmerie habituel à Pété : avoir ses papiers à portée de main." },
      { stepNumber: 6, landmark: "Pété → Diaranguel (île à Morphil)", instruction: "Franchir le pont du Doué (défluent du fleuve) puis pister vers le nord-est à travers les villages de l'île à Morphil jusqu'à Diaranguel.", distanceKm: 20, tip: "Dernier tronçon en sept-places, 4x4 ou charrette (45 min). En hivernage, se renseigner au CVD : la piste peut être coupée. Le village est face à la rive mauritanienne." },
    ],
  });

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 6 — Histoire & patrimoine
  // ─────────────────────────────────────────────────────────────────────────
  await db.historyArticle.createMany({
    data: [
      {
        section: "origines",
        title: "Le peuple du fleuve",
        subtitle: "Une île entre deux eaux — le Sénégal au nord, le Doué au sud",
        body: "Diaranguel est un village du peuple halpulaar, né au cœur de l'île à Morphil, cette bande de terre dressée entre le fleuve Sénégal et son défluent, le Doué. La vie du village suit le souffle du fleuve : la décrue ouvre le Walo, ses terres inondables qui donnent le riz ; le Diéri, terre haute du mil et du niébé, nourrit les troupeaux.\n\nLe village appartient au Fouta-Toro, ancien berceau du royaume du Tekrour, terre des savants, des pêcheurs et des cultivateurs. La solidarité — l'entraide pour la récolte, la pêche partagée, la caisse commune de la diaspora — reste la loi première. Face à la rive mauritanienne, Diaranguel regarde à la fois vers le fleuve et vers le monde.",
        period: "Fouta-Toro — région de Saint-Louis",
        image: "/images/fleuve-seneegal.jpg",
        sortOrder: 1,
      },
      {
        section: "origines",
        title: "Les lieux symboliques du village",
        subtitle: "Ce que chaque Diaranguelois reconnaît avant même de poser le pied",
        body: "• L'embarcadère : la porte du village, là où les pirogues amarrrent et où arrive le poisson frais.\n• La mosquée centrale : le cœur spirituel, où s'élèvent l'appel et les prières du Maouloud.\n• Le château d'eau : la fierté moderne, construit grâce au jumelage JAD et à la mobilisation des habitants — l'eau potable changea la vie du village.\n• Le périmètre rizicole du Walo : l'or blanc de Diaranguel, les parcelles de décrue réparties chaque saison entre les familles.\n• La place publique : théâtre de la lutte, des réunions du CVD et des soirées de contes.\n• L'école primaire publique : l'espérance des enfants, soutenue par la diaspora et le jumelage.",
        period: null,
        image: "/images/fleuve-seneegal-2.jpg",
        sortOrder: 2,
      },
      {
        section: "figures",
        title: "El Hadj Kalidou Sall",
        subtitle: "L'imam, gardien de la mémoire du village",
        body: "Plus de quarante ans à la mosquée centrale. On lui doit le cahier généalogique des familles de Diaranguel — Dieye, Diop, Sy, Sall, Ba, Ndongo — tenu à jour depuis les années 1970. Chaque dispute de bornage ou d'héritage passe d'abord par sa parole, qui rappelle le nom des ancêtres et la limite des terres du Walo et du Diéri.",
        period: "Mosquée centrale",
        image: null,
        sortOrder: 1,
      },
      {
        section: "figures",
        title: "Moussa Dieye « le vieux »",
        subtitle: "Le maître des pirogues",
        body: "Né sur l'eau, il connaît chaque crue depuis 1968 et lit le fleuve comme un livre : le sens du vent, la couleur de l'eau, l'endroit où le poisson se cache sous les racines. Toute une génération de jeunes pêcheurs a appris à pagayer dans sa pirogue. C'est lui qui ouvre la traversée vers la rive mauritanienne quand la crue le permet.",
        period: "Embarcadère de Diaranguel",
        image: null,
        sortOrder: 2,
      },
      {
        section: "figures",
        title: "Aïssatou Sall",
        subtitle: "Présidente du GIE des femmes maraîchères",
        body: "Sous son impulsion, les jardins maraîchers proches du fleuve — oignons, tomates, gombo, aubergines — approvisionnent le marché hebdomadaire et les ménages du village. Elle a formé plus de soixante femmes à l'irrigation au goutte-à-goutte offerte par le jumelage. Sa devise : « La femme qui cultive nourrit tout le village. »",
        period: "GIE des femmes — jardins du fleuve",
        image: null,
        sortOrder: 3,
      },
      {
        section: "figures",
        title: "Mamadou Dieye",
        subtitle: "L'infirmier-chef de la case de santé depuis 20 ans",
        body: "Arrivé jeune diplômé de l'école de santé de Saint-Louis, il a fait de la case de santé un poste de confiance : vaccinations, CPN du mercredi, garde de nuit, évacuations vers Pété et Ndioum. Les mères du village l'appellent « le docteur du fleuve ». Il veille aussi sur le stock de médicaments financé par la diaspora.",
        period: "Case de santé de Diaranguel",
        image: null,
        sortOrder: 4,
      },
      {
        section: "figures",
        title: "Cheikh Dieye",
        subtitle: "Le pionnier de la diaspora",
        body: "Parti à Dakar dans les années 1970 avec une natte et une cantine, commerçant puis transporteur, il fonde dans les années 1990 la première association de ressortissants. C'est par sa tontine que plusieurs familles ont construit au village, scolarisé leurs enfants et financé le puits du quartier de l'école. Chaque retour au village commence par la cour de la famille Dieye, où l'on raconte Diaranguel aux enfants nés en ville.",
        period: "ARD — Dakar",
        image: null,
        sortOrder: 5,
      },
      {
        section: "cooperation",
        title: "1988 — Le jumelage avec Saint-Pierre-de-Bœuf",
        subtitle: "Plus de trente-cinq ans d'amitié entre deux villages de deux continents",
        body: "Depuis 1988, l'association Jumelage avec Diaranguel (JAD) de Saint-Pierre-de-Bœuf (France) accompagne le comité villageois de développement. Le principe : renforcer l'autonomie des habitants par le transfert de savoir-faire, jamais la dépendance.\n\nRéalisations marquantes : le château d'eau et le réseau d'adduction d'eau potable, l'équipement de l'école primaire, le matériel de la case de santé, l'appui au maraîchage féminin et à la riziculture du Walo. La délégation vient chaque année au village ; les jeunes diaranguelois suivent les projets par lettres, puis par WhatsApp.",
        period: "Depuis 1988",
        sortOrder: 1,
      },
      {
        section: "cooperation",
        title: "L'or blanc du Walo",
        subtitle: "La riziculture, avenir économique du village",
        body: "Sur les terres de décrue bordant le fleuve, les aménagements hydro-agricoles permettent trois campagnes : riz irrigué, cultures de décrue dans le Walo, mil et niébé dans le Diéri. La récolte de riz — opérée en équipe villageoise, comme autrefois — nourrit les familles et se vend à Ndioum et Pété.\n\nLes motos-pompes entretenues par les jeunes du village, le repiquage collectif et la répartition équitable des parcelles par le comité de gestion font de la riziculture le principal levier d'un développement qui reste aux mains des habitants.",
        period: "Campagne agricole",
        sortOrder: 2,
      },
    ],
  });

  const counts = {
    announcements: await db.announcement.count(),
    events: await db.event.count(),
    contacts: await db.contact.count(),
    health: await db.healthTransportInfo.count(),
    routeSteps: await db.routeStep.count(),
    history: await db.historyArticle.count(),
  };
  console.log("Seed Diaranguel terminé :", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
