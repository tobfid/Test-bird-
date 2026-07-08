# 🐦 Vogelbestimmung Deutschland

Eine Web-App zum Entdecken, Bestimmen und Lernen heimischer Vogelarten in Deutschland. Gedacht für den Einstieg in die Vogelbeobachtung – vom Garten bis zum nächsten Spaziergang im Wald.

## Funktionen

- **Übersicht** – 62 häufige deutsche Vogelarten mit Steckbrief, durchsuchbar und filterbar nach Lebensraum, Farbe und Größe.
- **Bestimmen** – Schritt-für-Schritt-Assistent: Größe, Lebensraum und Farbe des beobachteten Vogels eingeben, passende Kandidaten werden vorgeschlagen.
- **Quiz** – Lernquiz mit Bildern und Multiple-Choice-Antworten. Arten, die häufiger falsch beantwortet werden, kommen öfter dran.
- **Favoriten** – Vögel merken, um sie später schneller wiederzufinden.

Alle Fortschritte (Favoriten, Quiz-Statistik) werden lokal im Browser gespeichert (`localStorage`) – jede Person, die die App nutzt, hat ihren eigenen Stand.

Bilder und weiterführende Informationen werden zur Laufzeit von Wikipedia geladen, damit die App keine großen Bilddateien mitbringen muss und immer aktuelle Fotos zeigt.

## Lokal starten

Voraussetzung: [Node.js](https://nodejs.org/) (Version 20 oder neuer).

```bash
npm install
npm run dev
```

Die App ist danach unter `http://localhost:5173` erreichbar.

## Build für die Veröffentlichung

```bash
npm run build
```

Das Ergebnis liegt im Ordner `dist/` und kann auf jedem statischen Hoster (GitHub Pages, Netlify, Vercel, eigener Webspace, …) veröffentlicht werden.

## Mit der Familie teilen (GitHub Pages)

Im Repository liegt bereits ein GitHub-Actions-Workflow (`.github/workflows/deploy.yml`), der die App bei jedem Push auf `main` automatisch baut und veröffentlicht:

1. Im Repository unter **Settings → Pages** als Quelle **„GitHub Actions“** auswählen (einmalig).
2. Änderungen auf den `main`-Branch mergen bzw. pushen.
3. Nach ein bis zwei Minuten ist die App unter der von GitHub angezeigten Pages-URL erreichbar (z. B. `https://<benutzername>.github.io/<repo-name>/`).

Diesen Link kannst du dann einfach an deine Familie schicken – kein Login, keine Installation nötig, funktioniert auf Handy, Tablet und PC.

## Technik

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/) für das Styling
- Keine eigene Bilddatenbank/Backend nötig – Bilder & Zusatzinfos kommen live von der deutschen Wikipedia-API

## Hinweis

Diese App ist als Lernwerkzeug gedacht und ersetzt keine professionelle Artbestimmung, insbesondere nicht bei seltenen oder geschützten Arten.
