# Lernbibliothek

Deine Lernskripte (PDF) an einem Ort. In der Bibliothek siehst du jedes Skript mit Titelbild und kannst Haken setzen für „bereit für die Klausur“ und „Klausur geschrieben“. Der Lesemodus hat Hell/Sepia/Dunkel, Volltextsuche, Zoom, Zoom-Sperre, Lesezeichen und Vollbild-Lesen (Menü nach oben wischen).

Zum Lernen gibt es Textmarker in vier Farben mit Notizen, Karteikarten mit Wiederholung in wachsenden Abständen (aus Markierungen oder per KI zur Seite), ein Klausurdatum mit Countdown und Seiten pro Tag, abhakbare Kapitel, ein KI-Quiz pro Kapitel und Vorlesen. Mit Gemini-Schlüssel liest eine natürliche KI-Stimme vor, sonst die beste Stimme des Geräts.

Mit dem Cloud-Sync (Supabase) sind Skripte, Haken, Lesefortschritt und Lesezeichen auf allen Geräten gleich.

## Wo die App läuft

| Gerät | Wie |
| --- | --- |
| Mac / PC | Web-Version über GitHub Pages. In Chrome oder Edge über „App installieren“, in Safari über „Ablage → Zum Dock hinzufügen“. |
| Android | `Lernbibliothek.apk` aus dem Release „Android-App“ herunterladen und öffnen. |
| iPhone / iPad | Über Xcode auf dem Mac installieren (siehe unten). |

## Projektaufbau

- `src/app.html`: die ganze App in einer Datei. Dieselbe Datei läuft auch als Claude-Artifact, dort ohne Sync.
- `src/config.js`: Supabase-Zugangsdaten (Project URL und anon-Schlüssel).
- `scripts/build-web.mjs`: baut `www/` komplett offline (pdf.js, Schriften und Supabase liegen lokal).
- `supabase/setup.sql`: Tabelle, Speicher-Bucket und Zugriffsregeln. Einmal im Supabase SQL Editor ausführen.
- `android/`, `ios/`: native Hüllen (Capacitor).
- `.github/workflows/`: bauen bei jedem Push die Android-APK und veröffentlichen die Web-Version.

## iPhone-App installieren (am Mac)

Du brauchst Xcode aus dem App Store, Node.js (nodejs.org) und CocoaPods (`sudo gem install cocoapods`).

```sh
git clone https://github.com/NiklasBoeck/Lernbibliothek.git
cd Lernbibliothek
npm install
npm run ios
```

So geht es in Xcode weiter:
1. Links „App“ wählen, dann „Signing & Capabilities“ öffnen und bei „Team“ deine Apple-ID auswählen.
2. Das iPhone per Kabel anschließen, oben als Ziel wählen und auf ▶ klicken.
3. Beim ersten Mal auf dem iPhone unter Einstellungen → Allgemein → VPN & Geräteverwaltung dem Entwickler vertrauen.

Mit einer kostenlosen Apple-ID läuft die App 7 Tage. Danach musst du sie neu aus Xcode installieren, deine Skripte bleiben dabei erhalten. Mit einem Apple-Entwicklerkonto (99 €/Jahr) geht es dauerhaft über TestFlight.

## Entwickeln

```sh
npm install
npm run build      # www/ bauen
npm run android    # Android Studio öffnen
npm run ios        # Xcode öffnen
```

## Android-Signatur

Ohne weitere Einrichtung wird die APK mit einem wechselnden Debug-Schlüssel signiert. Ein Update geht dann nur, wenn du die alte App vorher deinstallierst. Deine Skripte kommen nach dem Anmelden aus der Cloud zurück.

Für Updates ohne Deinstallieren kannst du einen eigenen Schlüssel als GitHub-Secrets hinterlegen: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD` und `ANDROID_KEY_ALIAS`.
