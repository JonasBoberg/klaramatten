# Lektionsdatabas

Lektionsframsteg sparas i Supabase. Webbplatsen anropar `/api/progress` på Vercel; databasens service-rollnyckel används endast av API:t och får aldrig läggas i klientkod.

## Konfigurera Supabase

1. Skapa ett Supabase-projekt.
2. Öppna SQL Editor och kör [`schema.sql`](./schema.sql).
3. I Supabase-projektets API-inställningar kopierar du projektets URL och `service_role`-nyckel. Lägg dem som Vercel environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Lägg till variablerna i samtliga relevanta Vercel-miljöer och gör en ny deploy.

`service_role`-nyckeln är hemlig. Den ska endast finnas som server-side environment variable i Vercel, aldrig i `index.html`, `tasks.js` eller annan fil som skickas till webbläsaren.

## Publicera webbplatsen

Lägg projektmappen i ett Git-repo och importera repot i Vercel. Vercel publicerar `index.html` och kör `api/progress.js` som serverless function. Elever behöver öppna den publicerade HTTPS-sajten; `file://`-öppning och statisk filhosting utan serverfunktion kan inte spara progression i databasen.

API:t använder lektionskoder och uppgifts-ID:n i `lesson-bank.js` som tillåtelselista. När en lektion läggs till där kan dess elevprofiler skapas automatiskt när en elev ansluter.

## Elev-ID och integritet

Elevens ID normaliseras till versaler, får innehålla 4–24 bokstäver/siffror och är unikt inom respektive lektionskod. Första gången väljer eleven att skapa ett nytt ID; om det redan används väljer eleven ett annat. Vid återbesök väljer eleven att fortsätta med sitt befintliga ID. Samma lektionskod och ID hämtar samma markeringar på olika datorer. Eftersom inloggning/PIN inte används är ID:t inte en hemlighet: den som känner till både lektionskoden och elev-ID:t kan läsa och ändra den profilen. API:t lämnar inte ut profiler genom sökning eller listning, och lagrar inga elevnamn.
