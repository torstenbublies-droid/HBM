/**
 * Wissensdatenbank für Schieder-Schwalenberg
 * Diese Daten werden dem Chatbot zur Verfügung gestellt
 */

export const knowledgeBase = {
  rathaus: {
    name: "Rathaus Schieder-Schwalenberg",
    adresse: "Domäne 3, 32816 Schieder-Schwalenberg",
    telefon: "05282 / 601-0",
    fax: "05282 / 601-35",
    oeffnungszeiten: {
      "Montag bis Freitag": "08:00 - 12:00 Uhr",
      "Donnerstag": "14:00 - 17:00 Uhr"
    },
    bankverbindung: {
      bank: "Sparkasse Paderborn-Detmold-Höxter",
      iban: "DE78 4765 0130 0000 5207 91",
      bic: "WELADE3LXXX"
    }
  },
  
  buergermeister: {
    name: "Marco Müllers",
    titel: "Bürgermeister",
    partei: "Parteilos (Independent)",
    amtsantritt: "1. November 2025",
    wahl: "Gewählt in der Stichwahl am 28. September 2025",
    vorgaenger: "Jörg Bierwirth (2020 - 31. Oktober 2025)",
    adresse: "Domäne 3, 32816 Schieder-Schwalenberg",
    telefon: "05282 / 601-0",
    fax: "05282 / 601-35",
    oeffnungszeiten: {
      "Montag bis Freitag": "08:00 - 12:00 Uhr",
      "Donnerstag": "14:00 - 17:00 Uhr"
    },
    website: "www.wirliebenschieder-schwalenberg.de"
  },
  
  freibad: {
    name: "Freibad Schieder",
    beschreibung: "Das schönste Freibad im Kreis Lippe befindet sich in Schieder in unmittelbarer Nähe des SchiederSees. Es ist ein städtisches Freibad, welches von Ehrenamtlichen in Form einer gGmbH geführt wird.",
    ausstattung: [
      "Vier 50m-Bahnen für Schwimmer",
      "Nichtschwimmerbecken mit Rutsche",
      "Planschbecken für die ganz Kleinen",
      "Solarthermieanlage für angenehme Wassertemperaturen",
      "Überdachte Terrasse",
      "Weitläufige Liegewiesen zum Verweilen und Ausruhen",
      "Beach-Volleyballfeld",
      "Torwand für sportliche Aktivitäten",
      "Großes Bücherangebot für Leseratten",
      "Matschanlage mit verschiedenen Spielgeräten für Kinder",
      "Kiosk mit Speisen und Getränken (süß und herzhaft, heiß und kalt)"
    ],
    oeffnungszeiten: {
      saison: "Mitte Mai bis Mitte September",
      regulaer: "12:00 - 19:00 Uhr",
      schulferien: "11:00 - 19:00 Uhr (in den Schulferien NRW)",
      fruehschwimmen: "06:00 - 10:00 Uhr (nur für Mitglieder des Fördervereins)",
      schlechtwetter: "Bei schlechter Witterung für Vereinsmitglieder geöffnet"
    },
    kontakt: {
      adresse: "Parkstraße 22, 32816 Schieder-Schwalenberg",
      telefon: "05282/9839",
      website: "www.freibad-schieder-schwalenberg.net",
      facebook: "Facebook",
      instagram: "Instagram"
    },
    besonderheiten: [
      "Seepferdchen-Kurs für Kinder: Montags bis samstags 10:00 - 11:00 Uhr während der Sommerferien",
      "Spätschwimmen (regelmäßige Veranstaltung)",
      "Von Ehrenamtlichen in Form einer gGmbH geführt",
      "Unterstützt durch den Förderverein Freibad Schieder-Schwalenberg e.V.",
      "In den letzten Jahren umfassend modernisiert und erweitert"
    ],
    foerderverein: {
      name: "Förderverein Freibad Schieder-Schwalenberg e.V.",
      adresse: "Lönsstraße 8, 32816 Schieder-Schwalenberg",
      telefon: "05282/4001-65",
      kontaktform: "Kontaktformular verfügbar"
    }
  },
  
  stadt: {
    name: "Schieder-Schwalenberg",
    kreis: "Kreis Lippe",
    bundesland: "Nordrhein-Westfalen",
    plz: "32816",
    besonderheiten: [
      "SchiederSee - beliebtes Naherholungsgebiet",
      "Historische Altstadt Schwalenberg mit Fachwerkhäusern",
      "Künstlerstadt mit aktiver Künstlerkolonie",
      "Staatlich anerkannter Erholungsort",
      "Ländlich geprägte Stadt mit hoher Lebensqualität"
    ],
    ortsteile: [
      "Schieder",
      "Schwalenberg",
      "Glashütte",
      "Lothe",
      "Siekholz",
      "Wöbbel"
    ]
  },
  
  tourismus: {
    sehenswuerdigkeiten: [
      "SchiederSee mit Wassersportmöglichkeiten",
      "Historische Altstadt Schwalenberg",
      "Burg Schwalenberg",
      "Künstlerkolonie Schwalenberg",
      "Freibad Schieder"
    ],
    freizeitangebote: [
      "Freibad Schieder mit umfangreicher Ausstattung",
      "Wassersport am SchiederSee (Segeln, Surfen, Schwimmen)",
      "Wandern und Radfahren in der Umgebung",
      "Kunst und Kultur in Schwalenberg",
      "Wellness und Gesundheitszentrum"
    ]
  },
  
  bildung: {
    kindergaerten: "Mehrere Kindergärten in den Ortsteilen",
    schulen: [
      "Alexander-Zeiß-Grundschule Schwalenberg (ausgezeichnet als MINT-freundliche Schule und Digitale Schule)",
      "Weitere Schulen in der Stadt"
    ],
    volkshochschule: "VHS-Angebote verfügbar",
    stadtbuecherei: "Stadtbücherei mit umfangreichem Angebot"
  },
  
  sport: {
    einrichtungen: [
      "Freibad Schieder",
      "Beach-Volleyballfeld im Freibad",
      "Sportanlagen in verschiedenen Ortsteilen",
      "Wellness- und Gesundheitszentrum"
    ],
    vereine: "Zahlreiche Sportvereine aktiv (Fußball, Tennis, Turnen, etc.)",
    paktFuerDenSport: "Stadt engagiert sich im Pakt für den Sport"
  },
  
  kontakte: {
    notfaelle: {
      feuerwehr_rettungsdienst: "112",
      polizei: "110",
      aerztlicher_notdienst: "116 117"
    },
    stadtverwaltung: {
      zentrale: "05282 / 601-0",
      fax: "05282 / 601-35"
    }
  }
};

export function getKnowledgeBaseContext(tenantSlug?: string): string {
  // Nur für Schieder gibt es aktuell eine Knowledge Base
  if (tenantSlug !== 'schieder') {
    return '(Keine spezifische Wissensdatenbank verfügbar)';
  }
  
  return `
# Wissensdatenbank Schieder-Schwalenberg

## Rathaus
- **Name**: ${knowledgeBase.rathaus.name}
- **Adresse**: ${knowledgeBase.rathaus.adresse}
- **Telefon**: ${knowledgeBase.rathaus.telefon}
- **Fax**: ${knowledgeBase.rathaus.fax}
- **Öffnungszeiten**:
  - Montag bis Freitag: ${knowledgeBase.rathaus.oeffnungszeiten["Montag bis Freitag"]}
  - Donnerstag: ${knowledgeBase.rathaus.oeffnungszeiten["Donnerstag"]}
- **Bankverbindung**: ${knowledgeBase.rathaus.bankverbindung.bank}, IBAN: ${knowledgeBase.rathaus.bankverbindung.iban}

## Bürgermeister
- **Name**: ${knowledgeBase.buergermeister.name}
- **Titel**: ${knowledgeBase.buergermeister.titel}
- **Partei**: ${knowledgeBase.buergermeister.partei}
- **Amtsantritt**: ${knowledgeBase.buergermeister.amtsantritt}
- **Wahl**: ${knowledgeBase.buergermeister.wahl}
- **Vorgänger**: ${knowledgeBase.buergermeister.vorgaenger}
- **Adresse**: ${knowledgeBase.buergermeister.adresse}
- **Telefon**: ${knowledgeBase.buergermeister.telefon}
- **Öffnungszeiten**:
  - Montag bis Freitag: ${knowledgeBase.buergermeister.oeffnungszeiten["Montag bis Freitag"]}
  - Donnerstag: ${knowledgeBase.buergermeister.oeffnungszeiten["Donnerstag"]}

## Freibad Schieder
- **Name**: ${knowledgeBase.freibad.name}
- **Beschreibung**: ${knowledgeBase.freibad.beschreibung}
- **Öffnungszeiten**:
  - Saison: ${knowledgeBase.freibad.oeffnungszeiten.saison}
  - Regulär: ${knowledgeBase.freibad.oeffnungszeiten.regulaer}
  - Schulferien NRW: ${knowledgeBase.freibad.oeffnungszeiten.schulferien}
  - Frühschwimmen für Mitglieder: ${knowledgeBase.freibad.oeffnungszeiten.fruehschwimmen}
- **Kontakt**:
  - Adresse: ${knowledgeBase.freibad.kontakt.adresse}
  - Telefon: ${knowledgeBase.freibad.kontakt.telefon}
  - Website: ${knowledgeBase.freibad.kontakt.website}
- **Ausstattung**: ${knowledgeBase.freibad.ausstattung.join(", ")}
- **Besonderheiten**: ${knowledgeBase.freibad.besonderheiten.join("; ")}
- **Förderverein**: ${knowledgeBase.freibad.foerderverein.name}, ${knowledgeBase.freibad.foerderverein.adresse}, Tel: ${knowledgeBase.freibad.foerderverein.telefon}

## Stadt Schieder-Schwalenberg
- **Name**: ${knowledgeBase.stadt.name}
- **Kreis**: ${knowledgeBase.stadt.kreis}
- **Bundesland**: ${knowledgeBase.stadt.bundesland}
- **PLZ**: ${knowledgeBase.stadt.plz}
- **Ortsteile**: ${knowledgeBase.stadt.ortsteile.join(", ")}
- **Besonderheiten**: ${knowledgeBase.stadt.besonderheiten.join("; ")}

## Tourismus & Freizeit
- **Sehenswürdigkeiten**: ${knowledgeBase.tourismus.sehenswuerdigkeiten.join(", ")}
- **Freizeitangebote**: ${knowledgeBase.tourismus.freizeitangebote.join(", ")}

## Bildung
- **Schulen**: ${knowledgeBase.bildung.schulen.join("; ")}
- **Weitere Bildungseinrichtungen**: Kindergärten, Volkshochschule, Stadtbücherei

## Sport
- **Einrichtungen**: ${knowledgeBase.sport.einrichtungen.join(", ")}
- **Vereine**: ${knowledgeBase.sport.vereine}

## Notfallnummern
- **Feuerwehr/Rettungsdienst**: ${knowledgeBase.kontakte.notfaelle.feuerwehr_rettungsdienst}
- **Polizei**: ${knowledgeBase.kontakte.notfaelle.polizei}
- **Ärztlicher Notdienst**: ${knowledgeBase.kontakte.notfaelle.aerztlicher_notdienst}

## Stadtverwaltung Kontakt
- **Zentrale**: ${knowledgeBase.kontakte.stadtverwaltung.zentrale}
- **Fax**: ${knowledgeBase.kontakte.stadtverwaltung.fax}
`;
}

