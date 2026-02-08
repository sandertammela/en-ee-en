# EN↔EE sõnavara õppevahend (U17–32)

See repo on lihtne GitHub Pages’i **statiline** õppevahend:
- **EN → EE** ja **EE → EN**
- 1:1 sõnavarapaarid (andmed `data/vocab.json`)
- Režiimid: **Flashcards** + **Quiz** (4 valikut)

## Failid
- `index.html` – UI
- `styles.css` – stiil
- `app.js` – loogika
- `data/vocab.json` – sõnavara (EN/EE)

## Kohandamine
- Lisa/uuda sõnu failis `data/vocab.json` (objektid kujul `{ "en": "...", "ee": "..." }`).
- Kui tahad uusi komplekte (nt U33–40), tee eraldi `data/vocab-u33-40.json` ja lisa rippmenüü.

## Avaldamine GitHub Pages’iga (soovitus: public link)
1. Loo GitHubis uus repo (nt `en-ee-trainer`).
2. Lae siinsed failid repo juurkausta (root).
3. Repo → **Settings** → **Pages**
4. **Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: `main`
   - Folder: `/ (root)`
5. Salvesta. GitHub annab sulle lehe URL-i kujul `https://<kasutaja>.github.io/<repo>/`.

## Kohalik testimine (valikuline)
Lihtsaim: kasuta VS Code Live Serverit **või** Pythonit:
```bash
python -m http.server 8000
```
Siis ava brauseris `http://localhost:8000`.

## Litsents
Lisa soovi korral (nt MIT).
