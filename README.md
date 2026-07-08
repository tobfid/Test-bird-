# 🐦 Vogelbestimmung Deutschland

Eine Web-App zum Entdecken, Bestimmen und Lernen heimischer Vogelarten in Deutschland. Gedacht für den Einstieg in die Vogelbeobachtung – vom Garten bis zum nächsten Spaziergang im Wald.

## Funktionen

- **Übersicht** – 62 häufige deutsche Vogelarten mit Steckbrief, durchsuchbar und filterbar nach Lebensraum, Farbe, Größe und Häufigkeit.
- **Bestimmen** – Schritt-für-Schritt-Assistent: Größe, Lebensraum, Beobachtungsort (Boden, Baumrinde, Zweige, Wasser, Luft, Sitzwarte) und Farbe eingeben, passende Kandidaten werden vorgeschlagen.
- **Steckbrief je Art** – mehrere echte Fotos, Erkennungsmerkmale, Flugbild, wo man die Art typischerweise antrifft, sowie eine echte Gesangsaufnahme zum Anhören.
- **Quiz** – Lernquiz mit Bildern und Multiple-Choice-Antworten. Arten, die häufiger falsch beantwortet werden, kommen öfter dran. Lässt sich nach Häufigkeit und Vogelfamilie eingrenzen – am schnellsten lernt man, wenn man mit den häufigsten Arten startet und sich vorarbeitet.
- **Favoriten** – Vögel merken, um sie später schneller wiederzufinden.

Alle Fortschritte (Favoriten, Quiz-Statistik, Quiz-Auswahl) werden lokal im Browser gespeichert (`localStorage`) – jede Person, die die App nutzt, hat ihren eigenen Stand.

Fotos werden zur Laufzeit von Wikipedia geladen, Gesangsaufnahmen von [xeno-canto.org](https://xeno-canto.org) (offene, CC-lizenzierte Datenbank für Vogelstimmen) – damit die App keine großen Mediendateien mitbringen muss und immer aktuelle Inhalte zeigt. Das bedeutet aber auch: **Fotos und Gesang benötigen eine Internetverbindung.** Bei schwachem Empfang im Wald funktionieren Text, Steckbrief-Angaben und der Bestimmungs-Assistent trotzdem weiter, Fotos/Audio laden dann ggf. erst später nach.

## Lokal starten

Voraussetzung: [Node.js](https://nodejs.org/) (Version 20 oder neuer).

```bash
npm install
npm run dev
```

Die App ist danach unter `http://localhost:5173` erreichbar.

### Optional: Gesangsaufnahmen aktivieren (xeno-canto API-Key)

Ohne weitere Einrichtung zeigt die App bei „Stimme“ einen Link zum Anhören auf xeno-canto.org. Für den eingebetteten Abspielen direkt in der App:

1. Kostenlosen API-Key auf [xeno-canto.org/account](https://xeno-canto.org/account) registrieren.
2. Datei `.env.local` im Projektordner anlegen (wird nicht eingecheckt) mit:
   ```
   VITE_XENO_CANTO_KEY=dein-key-hier
   ```
3. Dev-Server neu starten bzw. neu bauen.

## Build für die Veröffentlichung

```bash
npm run build
```

Das Ergebnis liegt im Ordner `dist/` und kann auf jedem statischen Hoster (GitHub Pages, Netlify, Vercel, eigener Webspace, …) veröffentlicht werden. Falls Gesangsaufnahmen eingebunden werden sollen, muss `VITE_XENO_CANTO_KEY` auch beim Build (bzw. beim Hoster als Umgebungsvariable) gesetzt sein.

## Mit der Familie teilen

Im Repository liegt bereits ein GitHub-Actions-Workflow (`.github/workflows/deploy.yml`), der die App bei jedem Push auf `main` automatisch baut und veröffentlicht:

1. Im Repository unter **Settings → Pages** als Quelle **„GitHub Actions“** auswählen (einmalig).
2. Änderungen auf den `main`-Branch mergen bzw. pushen.
3. Nach ein bis zwei Minuten ist die App unter der von GitHub angezeigten Pages-URL erreichbar (z. B. `https://<benutzername>.github.io/<repo-name>/`).

Diesen Link kannst du dann einfach an deine Familie schicken – kein Login, keine Installation nötig, funktioniert auf Handy, Tablet und PC.

**Für die schnelle Weitergabe aufs Smartphone:** Der „📲 Teilen“-Button oben in der App zeigt einen QR-Code der aktuellen Adresse – einfach mit der Handykamera scannen, um die App direkt zu öffnen (kein Ausdrucken von Links nötig). Über das Browser-Menü „Zum Startbildschirm hinzufügen“ lässt sich die App danach wie eine normale App-Kachel auf dem Homescreen ablegen.

## Technik

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/) für das Styling
- Keine eigene Bilddatenbank/Backend nötig – Fotos kommen live von der deutschen Wikipedia-API, Gesang von der xeno-canto-API
- QR-Code-Generierung läuft komplett im Browser (Paket `qrcode`), ohne externen Dienst

## Hinweis

Diese App ist als Lernwerkzeug gedacht und ersetzt keine professionelle Artbestimmung, insbesondere nicht bei seltenen oder geschützten Arten. Gesangsaufnahmen stammen von Freiwilligen auf xeno-canto.org und sind CC-lizenziert – Aufnehmer:in und Quelle werden in der App bei jeder Aufnahme angezeigt.
