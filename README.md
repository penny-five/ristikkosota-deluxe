# Rihmastovalta

**Pelaa:** https://rihmastovalta.pennyfive.workers.dev/

Julkaistu 24.10.2026. Frontti on Cloudflaren staattisissa tiedostoissa ja pelipalvelin Supabasen `rihmastovalta`-projektissa (`egnxfxjshpjedbdlxzmv`, eu-north-1). Tarkistukset ja julkaisutiedot: [RELEASE.md](RELEASE.md).

Suomen politiikkaa ja sienisatoa yhdistävä asynkroninen social deduction -peli 5–10 pelaajalle. Yksi yhteinen huone, suomenkielinen mobiilikäyttöliittymä ja asennettava PWA.

## Arkkitehtuuri

- **Cloudflare Workers Static Assets:** pelkkä `public/`-käyttöliittymä ja PWA. Ei pelipalvelinta, Durable Objectia tai tietokantasidoksia.
- **Supabase Edge Function `game`:** pelisäännöt ja palvelimella suodatetut pelaajakohtaiset näkymät.
- **Supabase PostgreSQL:** yksi huone `rihma_private.room`-taulussa. Atominen revision tarkistus estää samanaikaisten komentojen ylikirjoittumisen. Epäonnistunut tallennus ei julkaise muutosta.

Pelaajien selainavaimet, salaiset roolit ja satokortit eivät ole suoraan luettavissa tietokannan julkisella API:lla. Taulu on yksityisessä skeemassa RLS käytössä. Vain `service_role` saa kutsua tallennuksen RPC-funktioita. Palvelinavain tulee Edge Functionin valmiista `SUPABASE_SERVICE_ROLE_KEY`-ympäristömuuttujasta; sitä ei siirretä fronttiin. Edge Function käyttää pelin omia satunnaisia bearer-avaimia, joten Supabasen JWT-tarkistus on sille pois käytöstä. Julkinen pelaajatunniste on eri asia kuin selainavain.

## Mekaniikat

- **Puoluepolitiikka:** SDP, kokoomus, perussuomalaiset, keskusta, vihreät, vasemmistoliitto, RKP, kristillisdemokraatit ja Liike Nyt. Puolue valitaan liittyessä tai jaetaan automaattisesti. Sitä voi vaihtaa aulassa. Tarvitaan vähintään kaksi puoluetta. Puolue ja salainen rooli ovat riippumattomia.
- **Koalitiot:** vaihtuva puheenjohtaja ehdottaa retkikuntaa, jossa on vähintään kahta puoluetta. Hyväksyminen vaatii kaikkien pelaajien enemmistön sekä sisäisen enemmistön vähintään kahdessa puolueessa. Tasapeli hylkää. Äänet julkaistaan yhdessä.
- **Salainen sato:** valitut antavat tuki- tai myrkkykortin. Vain myrkyttäjät voivat myrkyttää. Yksikin myrkky kaataa uudistuksen. Kolme onnistunutta uudistusta voittaa metsän puolustajille, kolme myrkytettyä retkeä myrkyttäjille. Viisi peräkkäistä hylkäystä antaa myrkyttäjille voiton. Myrkyttäjiä on 5–6 pelaajalla 2, 7–9 pelaajalla 3 ja 10 pelaajalla 4.
- **Rihmastotalous:** kaikilla on 2 salaista itiötä. Retken tukeminen tuottaa yhden (enintään 4). Myrkyttäminen maksaa 2. Myrkyttäjien on myös autettava.
- **Näytetarkastus:** ehdotusvaiheessa 2 itiöllä voi julkaista yhden edellisen retken jäsenen antaman kortin. Yksi tarkastus kierroksessa. Tukikortti ei todista roolia.
- **Sosialistinen vallankumous:** kolmas voittoreitti avautuu ehdotusvaiheessa, kun kolme ehdotusta on hylätty peräkkäin tai vähintään kaksi retkeä on päättynyt ja ainakin yksi on myrkytetty. Julkinen, peruuttamaton liittyminen maksaa 2 itiötä. Vähintään ⅔ pelaajista ja kolme puoluetta (tai molemmat, jos vain kaksi on edustettuna) siirtää sienisadon yhteisomistukseen. Vain liittyneet voittavat, alkuperäisestä roolista riippumatta.

## Paikallinen kehitys

Node.js 22+ (testattu 24), npm.

```sh
npm ci
npm test
npm run check
npm run dev
```

Paikallinen kehityspalvelin tarjoilee käyttöliittymän ja saman API-käsittelijän. Ilman ympäristömuuttujia pelitila tallennetaan `.local/room.json`-tiedostoon. Tämä tila **ei testaa Supabase-pilviyhteyttä**. Supabaseen yhdistäminen paikallisesti: aseta `.env`-tiedostoon `SUPABASE_URL` ja `SUPABASE_SERVICE_ROLE_KEY` turvallisesti; älä lisää tiedostoa Gitiin. Sovella ensin tietokantamigraatio.

`npm test` tarkistaa pelisäännöt, API:n samanaikaisuuden ja migraation käyttöoikeudet paikallisessa PGlite PostgreSQL -moottorissa. Se ei todista Supabase Edge -julkaisun toimintaa. Toiminnallinen testi: aloita erillinen tyhjä palvelin `PORT=8788 RIHMA_DATA_DIR=/tmp/rihma-smoke-fresh npm run dev`, sitten `SMOKE_URL=http://127.0.0.1:8788 npm run smoke`. Testi luo viisi pelaajaa, pelaa kokonaisen pelin ja toteuttaa vallankumouksen. Älä suorita sitä oikeassa pelihuoneessa.

## Julkaisu: ensin Supabase

Käytä Supabase-pluginia, jos se on istunnon työkaluissa saatavilla. Valitse olemassa oleva projekti; älä luo maksullista projektia sokkona. Sovella `supabase/migrations/20261024000100_game.sql` migraationa ja julkaise `supabase/functions/game/index.ts` funktionimellä `game`, JWT-tarkistus pois käytöstä. Funktion riippuvuudet ovat `src/api.js`, `src/game.js` ja `src/store.js`.

Vaihtoehtoisesti Supabase CLI asennettuna ja omalle tilille kirjautuneena:

```sh
supabase login
supabase link --project-ref <project-ref>
npm run deploy:backend
```

CLI käyttää `supabase/config.toml`-tiedostoa. Älä koskaan tallenna henkilökohtaista access tokenia lähdekoodiin. `db push` soveltaa tietokantamigraation valittuun projektiin; tarkista projektiviite ennen komentoa.

Tarkista `GET https://<project-ref>.supabase.co/functions/v1/game/state`: vastauksen tulee olla HTTP 200 ja pelitilaa sisältävä JSON, ei 401 tai tietokantavirhe. Varmista myös, että julkisella anon/publishable-avaimella ei voi lukea yksityistä pelitilaa. Tee pilvipelin toiminnallinen testi vain erillisessä testiprojektissa, ei käynnissä olevan pelin huoneessa.

## Julkaisu: sitten Cloudflare-frontti

Kun Supabase-funktio toimii:

```sh
npm run configure -- https://<project-ref>.supabase.co/functions/v1/game
npx wrangler login
npm run deploy:frontend
```

Frontin julkaisu estetään, jos backendin osoite on vielä paikallinen `/api`. Fronttiin tallennetaan vain julkinen funktion URL, ei Supabasen palvelinavainta tai henkilökohtaisia access tokeneita. CI:ssä Cloudflare-tunnistautuminen voidaan antaa suojattuina `CLOUDFLARE_API_TOKEN`- ja `CLOUDFLARE_ACCOUNT_ID`-muuttujina. `wrangler.jsonc` julkaisee vain staattiset tiedostot.

Tarkista julkaistulla sivulla liittyminen, kahden selaimen tilapäivitykset ja PWA:n asennus HTTPS:n yli. Selainavaimen pitää säilyä sivun uudelleenlatauksessa. Supabase- ja Cloudflare-julkaisut ovat eri toimenpiteitä; paikalliset testit eivät tarkoita kumpaakaan julkaistuksi.

## Rajat

Ensimmäinen liittyjä on isäntä. Aloitus lukitsee huoneen. Äänestykset odottavat kaikkia ilman aikarajaa. Ei pelaajien poistamista, kadonneen selainavaimen palautusta tai push-ilmoituksia. Sama ryhmä voi avata uuden pelin lopputuloksen jälkeen. Käyttöliittymä päivittyy kolmen sekunnin välein. Offline-tilassa käyttöliittymä avautuu, pelaaminen vaatii yhteyden. Ei vahvaa henkilöllisyyden varmennusta tai roskapostin estoa: ensimmäinen versio on luotetulle kaveriporukalle. Pelitasapaino tarvitsee ihmisten pelitestejä.

Oikeat puolueet ovat satiirin kontekstia. Peli ei ole puolueiden tuottama tai hyväksymä. Salaiset roolit ovat fiktiivisiä ja arvotaan puolueesta riippumatta.
