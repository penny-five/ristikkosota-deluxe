# Nykytila 24.10.2026 — julkaistu

Peli: https://rihmastovalta.pennyfive.workers.dev/

Uusin päivitys: 3–10 pelaajaa. 3–4 pelaajalla yksi myrkyttäjä, jolla 4 alku-itiötä; muilla 2. Kolmella retkikunnat 2/2/2/2/2, neljällä 2/2/3/2/3. Edge Function game v2. 16 testiä läpi, kolmen mobiiliselaimen peli testattu. Kaikki koristeelliset Unicode-kuvakkeet korvattu SVG:llä. SW-välimuisti rihma-v5.

Jatkotyössä lue ensin README.md ja RELEASE.md. Alla oleva aiempi siirto-ohje kuvaa lähtötilannetta; sen avoimet julkaisuaskeleet on nyt tehty.

- Supabase-projekti `rihmastovalta`, ref `egnxfxjshpjedbdlxzmv`, eu-north-1, penny-five-organisaatio. Luotu käyttäjän pyynnöstä, get_cost ilmoitti hinnaksi 0/kk.
- SQL-migraatiot sovellettu, versiot vastaavat pilven migraatiohistoriaa. Edge Function `game` aktiivinen, verify_jwt=false, omat pelaajakohtaiset bearer-avaimet.
- Cloudflare-tili `c27fb32a8b3a98db16545aa0fb80ce5e`, Worker `rihmastovalta`, vain Static Assets (has_assets=true, has_modules=false). Ei pelitaustaa Cloudflaressa.
- Ulkoasu uusittu käyttäjän pyynnöstä: kaiverrosmainen sienimetsäkuvitus, paikalliset Fraunces/Manrope-fontit, oma SVG-kuvakieli, satokortit ja leimat, itiöanimaatiot, reduced-motion. Mobiili on ensisijainen alusta. Liittymisen jälkeen hero tiivistyy ja vuoron toiminnot ovat ennen pelaajalistaa.
- Viisi mobiiliselainta: liittyminen, puolueenvaihto, roolikortti, ehdotus, äänet, satokortit, voitto, reset, chat, reload. Leveydet 320,360,390,430,768; ei overflowta, painikkeet vähintään 44 px. Chromium-emulaatio, ei fyysisellä puhelimella tehty testi.
- Oikea Supabase Edge + PostgreSQL testattu erillisellä game-check-funktiolla/rihma_check-skeemalla: kokonainen peli ja vallankumous. Testidata ja testiskeema poistettu, testifunktio korvattu 410-vastauksella ja JWT-tarkistus palautettu päälle (poistotyökalua ei ole).
- Tuotannon 390px selain: HTTP 200, tyhjä aula, invalid bearer ei voi aloittaa peliä, julkisella avaimella RPC:t 401, SW activated ja 11 tiedostoa välimuistissa, fontit ladattu, ei sivuttaisvieritystä.
- Käyttäjä pyysi myös passa-grisar-projektin poistoa. Sitä EI poistettu: Supabase-pluginista puuttuu delete_project, ympäristössä ei Supabasen hallintakirjautumista. Kerrottu käyttäjälle. Ei saa väittää poistetuksi.
- Pilviympäristön egress ei salli Supabase-hostia tai workers.dev-hostia. Julkisen sivun ja taustan tarkistukset tehtiin Cloudflaren Browser Rendering -API:lla. Cloudflare-pluginilla luotiin asset-upload-session; tiedostot siirrettiin rajatulla upload JWT:llä APIin; julkaisu ja workers.dev-reitti pluginilla. Älä tallenna tai commitoi upload JWT:tä.

---

# Rihmastovalta — ohje seuraavalle agentille

Päivitetty 24.10.2026. Lue tämä ja README.md ennen muutoksia. Jatka toteutusta ja julkaisua; älä aloita projektia alusta.

## Käyttäjän tavoite ja viimeiset päätökset

Toteuta ja julkaise selaimessa pelattava, suomenkielinen, lautapelimäinen social deduction -moninpeli. Teemat: Suomen politiikka ja sienet. Esikuvat Secret Hitler, Avalon, Werewolf ja Battlestar Galactica, mutta käyttäjä halusi myös omaperäisiä mekaniikkoja. Yksi yhteinen pelihuone, 5–10 pelaajaa, asynkroniset vuorot, mobiilikäyttö ja asennettava PWA.

**Viimeksi sovittu julkaisujako:**

- Frontti: Cloudflare, vain staattiset tiedostot.
- Pelipalvelin: Supabase Edge Function `game`.
- Tietokanta: Supabase PostgreSQL.

Käyttäjä pyysi ensin kaiken Supabaseen, mutta hyväksyi sen jälkeen nimenomaisesti Cloudflaren frontin hostingiksi. Älä palauta Durable Objects -taustapalvelinta.

Käyttäjä ilmoitti asentaneensa/tagänneensä nämä pluginit:

- Supabase: `plugin://supabase@openai-curated-remote`
- Cloudflare: `plugin://app-6a99ceead2c481919fb44845267235c4@openai-curated-remote`

Tämän istunnon ALL_TOOLS-listassa kumpikaan ei silti näkynyt, myöskään uusimman Cloudflare-tagäyksen jälkeen. Uuden keskustelun tarkoitus on saada pluginit näkyviin. **Etsi ja käytä niitä ensin; älä pyydä käyttäjältä API-avaimia ennen kuin olet tarkistanut pluginien todelliset mahdollisuudet.** Älä väitä pluginin olevan käytettävissä pelkän tagin perusteella.

## Tiedostot ja säilyminen

Repo: `penny-five/ristikkosota-deluxe`, paikallinen hakemisto `/workspace/ristikkosota-deluxe`.

Alussa sekä paikallinen repo että GitHub-remote olivat tyhjiä (ei committeja eikä main-haaraa). GitHubin read-only-yhteys toimi. Tässä istunnossa **ei ole tehty commitia eikä pushia**. Toteutus on vielä untracked-tiedostoina. Tarkista `git status` ja säilytä kaikki tiedostot. Pelkkä uuden checkoutin kloonaaminen ei siis tuo tätä toteutusta mukana. Älä resetoi tai poista nykyistä hakemistoa. Käytä olemassa olevaa checkoutia; pilvitehtävä on jo eristetty eikä uutta worktreetä tarvita.

Tämän ohjeen rinnalle tehty `/workspace/ristikkosota-deluxe-handoff.tar.gz` sisältää lähdekoodin ja dokumentaation ilman node_modulesia, pelitietokantoja, ympäristöavaimia tai Git-metatietoja. Jos uusi chat saa eri koneen, siirrä paketti sinne ennen jatkamista. Paketti ei korvaa Git-historiaa.

## Toteutuksen nykytila

- `public/index.html`, `style.css`, `app.js`: suomenkielinen mobiili-UI, aula, salainen roolikortti, retkikunnat, äänestys, satokortit, puolueen valinta/vaihto aulassa, chat, pöytäkirja, tutkimus ja vallankumous.
- `public/manifest.webmanifest`, `sw.js`, kuvakkeet: PWA ja käyttöliittymän offline-välimuisti. Pelaaminen vaatii verkkoyhteyden. Kuvakkeet 192/512 PNG sekä SVG.
- `public/config.js`: **vielä paikallinen `/api`**, ei julkaistua Supabase-osoitetta.
- `src/game.js`: pelisäännöt ja palvelimella suodatettu näkymä.
- `src/api.js`: runtime-riippumaton HTTP-käsittelijä. Reitit `GET state`, `POST join`, `POST action`, CORS OPTIONS. Omat satunnaiset bearer-selainavaimet. Kokoraja 4096 tavua. 12 yrityksen compare-and-swap tallennukseen.
- `src/store.js`: Supabase REST RPC -adapteri, palvelinavain vain palvelimella.
- `supabase/functions/game/index.ts`: Deno.serve, käyttää API:a ja Supabasen automaattisia `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` -muuttujia.
- `supabase/config.toml`: funktion `game` asetuksena `verify_jwt=false`. Supabasen gateway ei saa tulkita pelin omaa bearer-avainta Supabase Auth JWT:ksi.
- `supabase/migrations/20261024000100_game.sql`: yksityinen `rihma_private.room`, RLS käytössä. RPC:t `public.rihma_read_room()` ja `public.rihma_save_room(expected_revision, next_state)`. Vain `service_role` saa kutsua niitä. Atominen revision vertailu estää samanaikaisten kirjoitusten ylikirjoittumisen.
- `scripts/dev.mjs`: Node-kehityspalvelin. Oletuksena yksityinen paikallinen `.local/room.json`; `.env`:n Supabase-palvelinmuuttujilla käyttää oikeaa Postgres-adapteria. Paikallinen tiedostotila EI todista pilven toimintaa.
- `scripts/configure.mjs`: kirjoittaa fronttiin julkisen Supabase-funktion osoitteen. Ei avaimia.
- `scripts/check-deploy.mjs`: estää frontin tuotantojulkaisun, jos Supabase-osoitetta ei ole asetettu.
- `scripts/smoke.mjs`: tyhjään testihuoneeseen viisi pelaajaa, kokonainen peli sekä uusi istunto ja sosialistinen vallankumous.
- `wrangler.jsonc`: vain Workers Static Assets `public/`, ei backendia eikä sidontoja.
- `README.md`: arkkitehtuuri, säännöt, kehitys ja julkaisuohjeet. Se on päivitetty Supabase/Cloudflare-jakoon.

## Sovitut pelimekaniikat

Puolueet ovat oikeat: SDP, Kokoomus, Perussuomalaiset, Keskusta, Vihreät, Vasemmistoliitto, RKP, Kristillisdemokraatit, Liike Nyt. Puolue ja salainen rooli ovat riippumattomia. Käyttäjä pyysi oikeita puolueita sekä sosialistisen vallankumouksen osaksi sääntöjä.

1. Ensimmäinen liittyjä on isäntä. Aloitus vaatii vähintään viisi pelaajaa ja kahta puoluetta. Enintään kymmenen pelaajaa.
2. Salaiset myrkyttäjät tuntevat toisensa. Muut ovat metsän puolustajia. Myrkyttäjiä 5–6 pelaajalla 2, 7–9 pelaajalla 3, 10 pelaajalla 4.
3. Vaihtuva puheenjohtaja ehdottaa retkikuntaa, jossa vähintään kahta puoluetta. Koko määrä riippuu kierroksesta/pelaajamäärästä.
4. Hyväksyntä vaatii kaikkien pelaajien enemmistön JA sisäisen enemmistön vähintään kahdessa puolueessa. Äänet julkaistaan, kun kaikki ovat vastanneet. Tasapeli hylkää.
5. Retkikunta antaa salaiset satokortit. Yksi myrkky riittää kaatamaan uudistuksen. Kolme onnistunutta retkeä voittaa metsälle, kolme myrkytettyä myrkyttäjille. Viisi peräkkäistä hylkäystä voittaa myrkyttäjille.
6. **Itiötalous:** jokaisella 2 salaista itiötä. Tuki +1 (maksimi 4), myrkky −2. Myrkyttäjän täytyy siis välillä auttaa.
7. **Näytetarkastus:** ehdotusvaiheessa 2 itiöllä voi paljastaa yhden edellisen retken pelaajan kortin julkisesti. Enintään yksi tarkastus kierroksessa. Tuki ei todista viattomuutta.
8. **Sosialistinen vallankumous:** avautuu ehdotusvaiheessa, kun kolme ehdotusta on hylätty peräkkäin TAI vähintään kaksi retkeä on päättynyt ja yksi on myrkytetty. Julkinen peruuttamaton liittyminen maksaa 2 itiötä. Kun vähintään ⅔ pelaajista (ylöspäin) ja kolme puoluetta (tai molemmat, jos vain kahta edustetaan) on mukana, peli päättyy yhteisomistukseen. Vain liittyneet voittavat, salaisesta roolista riippumatta.

## Todennetut tarkistukset

Viimeisin `npm test`: **13 testiä läpi** (9 pelisääntöä, 3 API/adapteritestiä, 1 PostgreSQL-migraatiotesti).

- PostgreSQL-testissä käytettiin paikallista PGliteä, sovellettiin migraatio kahdesti, tarkistettiin service_role-kutsut, vanhentuneen revision hylkäys sekä anon/authenticated-roolien luku- ja kirjoituskiellot. Tämä ei ole testi oikeassa Supabase-projektissa.
- API-testit: samanaikaiset liittymiset ja äänet, tietojen suodatus, CORS, virheelliset pyynnöt, kokoraja ja tietokantavirheet.
- `npm run check` läpi.
- `wrangler deploy --dry-run` staattiselle frontille läpi: 9 assets-tiedostoa, ei sidontoja. **Ei tuotantojulkaisu.**
- Uusi Node/API-toteutus testattiin HTTP:n läpi viidellä pelaajalla: kolme onnistunutta retkeä ja uusi peli vallankumouksella läpi. Sen jälkeen lisättiin vielä aulan puolueenvaihtolomake ja aulatietojen säilyttäminen pollauksessa; säännöt/syntaksi testattiin uudelleen, mutta tätä UI-lisäystä ei selaimella.
- Varsinaista visuaalista selaintestiä, PWA-asennusta tai Supabasen Deno Edge -julkaisua ei ole tehty.

## Seuraavat tehtävät järjestyksessä

1. Varmista että yllä olevat lähdetiedostot ovat uudessa ympäristössä. Tarkista nykyiset muutokset ja mahdolliset agenttiohjeet. `npm ci`, `npm test`, `npm run check` tarvittaessa.
2. Löydä ja lue Supabase- ja Cloudflare-pluginien työkalut/ohjeet. Käytä niitä ensisijaisesti CLI:n sijaan.
3. Selvitä käytettävissä oleva oikea Supabase-projekti. Projektiviitettä ei ole vielä tiedossa. Älä luo maksullista projektia tai valitse satunnaista olemassa olevaa projektia. Jos projekteja on useita eikä käyttötarkoitus selviä, kysy kohde.
4. Sovella SQL migraationa valittuun Supabase-projektiin. Julkaise Edge Function `game` `verify_jwt=false`. Sisällytä myös `src/api.js`, `src/game.js` ja `src/store.js` julkaistuun moduuligraafiin. Nykyinen import `../../../src/api.js` lähtee funktion hakemistosta repon juureen; jos pluginin deploy-työkalu edellyttää toisenlaista tiedostopakettia, säilytä riippuvuudet ja korjaa paketointi.
5. Tarkista oikeassa pilvessä `GET https://<project-ref>.supabase.co/functions/v1/game/state` → 200 ja kelvollinen JSON. Tarkista CORS, bearer-tunnistus sekä se, ettei julkisella Supabase-avaimella voi kutsua yksityisiä RPC:itä. Älä julkaise palvelinavainta selaimeen.
6. Kun backend toimii: `npm run configure -- https://<project-ref>.supabase.co/functions/v1/game`. Frontin `config.js`:ään tulee vain julkinen osoite.
7. Julkaise Cloudflare-frontti pluginilla (`public/` assets, nimi `rihmastovalta` tai käyttökelpoinen käyttäjän tilin nimi). CLI-varavaihtoehto: `npm run deploy:frontend`, kun tunnistautuminen toimii.
8. Tarkista tuotannon sivu oikeassa selaimessa: useampi pelaaja, roolien yksityisyys, puolueen valinta ja koalitiot, vuoron eteneminen, selaimen uudelleenlataus, PWA-asennus HTTPS:n yli. Tee koko pelin smoke vain erilliseen tyhjään testihuoneeseen/projektiin, ei käyttäjien käynnissä olevaan peliin.
9. Raportoi lopuksi oikea julkaistu URL ja todennetut toiminnot. Älä kutsu peliä julkaistuksi pelkän dry-runin perusteella.

Käyttäjä on pyytänyt toteutuksen ja julkaisun: jatka itsenäisesti järkevissä ja valtuutetuissa vaiheissa; älä kysy joka välissä lupaa jatkaa. Tarvittavat salaisuudet vain turvallisiin ympäristöasetuksiin, ei chattiin.

## Paikalliset komennot ja aiemmat esteet

```sh
cd /workspace/ristikkosota-deluxe
npm ci
npm test
npm run check
npm run dev
```

Tyhjän huoneen testi erillisessä palvelimessa:

```sh
PORT=8788 RIHMA_DATA_DIR=/tmp/rihma-smoke-UNIQUE npm run dev
# Toisessa terminaalissa:
SMOKE_URL=http://127.0.0.1:8788 npm run smoke
```

Aiempi ympäristö tarvitsi sandbox-escalationin kuunteluportin avaamiseen ja verkkoyhteyksiin. Se ei tarkoita, että uusi ympäristö tarvitsee saman.

Cloudflare `wrangler whoami` ei löytänyt tunnistautumista. Kokeiltu `wrangler deploy --temporary` pysähtyi verkkoyhteyteen. `curl -I https://api.cloudflare.com/client/v4/` sai proxyltä **CONNECT 403 Forbidden**. Tämä oli verkkopolitiikan havainto, ei Cloudflaren API:n sovellustason vastaus. Väliaikaista tiliä tai tuotantoa ei saatu luotua. Myös Supabasen dokumenttisivun haku sai 403:n. Älä toista samoja komentoja muuttumattomilla edellytyksillä; kokeile uuden pluginin tuettua reittiä.

Wranglerin loki-/asetushakemisto oli rajatussa ympäristössä kirjoitussuojattu. Toimiva paikallinen ohitus: `XDG_CONFIG_HOME=/tmp/rihma-config WRANGLER_LOG_PATH=/tmp/rihma-front-build.log npx wrangler deploy --dry-run` (ei muuta käyttäjän HOMEa).

Supabase CLI ei ollut asennettu. `deploy:backend`-npm-komento edellyttää CLI:tä sekä kirjautumista; pluginilla voi tehdä saman ilman CLI:tä.

Pilviympäristön onboarding-draftiin oli tallennettu ennen Supabase-siirtoa install_script/start_skill sekä `CLOUDFLARE_API_TOKEN`-vaatimus ja verkkokohde `api.cloudflare.com`. **Start_skill on vanhentunut:** se ohjaa edelleen Wrangler-pelipalvelimeen/Durable Objectiin. Päivitä draft nykyiseen Node-kehityspalvelimeen ja Supabase/Cloudflare-jakoon, jos onboarding-työkalut ovat uudessa chatissa saatavilla. Draftin tallennus ei ole suorittanut skriptejä, julkaissut sovellusta tai julkaissut ympäristöä. Älä kopioi vanhaa start_skill-ohjetta sellaisenaan.

## Tiedossa olevat ensimmäisen version rajat

Ei pelaajien poistamista, isännän siirtoa, hukatun selainavaimen palautusta, vahvaa identiteettitarkistusta, roskapostisuojausta tai push-ilmoituksia. Kaveriporukan yksi huone. Pelaajia ei voi lisätä kesken pelin. Sama ryhmä voi aloittaa uuden pelin lopputuloksen jälkeen. Offline toimii vain käyttöliittymälle. Pelitasapainoa ei ole testattu ihmisillä. Nämä eivät ole ratkaistuja ominaisuuksia; älä väitä niitä valmiiksi.
