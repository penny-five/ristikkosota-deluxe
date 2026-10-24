# Rihmastovalta 2 — hyvän veljen huonot aikeet

**Pelaa:** https://rihmastovalta.pennyfive.workers.dev/

Suomenkielinen, mobiiliin suunniteltu kortti- ja valtapeli **2–6 oikealle pelaajalle**. Luo oma kabinetti, jaa liittymiskoodi ystäville ja aloita. Ei botteja tai yksinpeliä. Julkaistu 24.10.2026.

Tämä versio vaihtaa aiemman retkikunta- ja äänestyspelin kokonaan toiseen pelisilmukkaan. Samanaikaiset teot, aluehallinta, resurssitalous, toimintokortit ja henkilökohtaiset tavoitteet ovat pelin ydin.

## Pelaaminen

Kuusi kierrosta. Jokaisella on kolme tekoa per kierros. Pelaajat toimivat haluamassaan järjestyksessä ja voivat käyttää tekojaan samaan aikaan. Jokaisen yksittäisen toimenpiteen hyväksyntää ei äänestetä. Kun kaikki ovat käyttäneet tekonsa tai painaneet Olen valmis, yöjuonet ratkeavat ja seuraava kierros alkaa.

Teko voi olla:

- Kortin pelaaminen: 12 erilaista taktiikkaa, mm. kampanjointi, skandaali, sabotaasi, suojautuminen, tietovuoto ja sosialistinen vallankumous. Kortilla voi olla kolikko- tai itiöhinta.
- Paikan vahvistaminen: 2 kolikolla 2 vaikutusvaltaa. Viidestä paikasta suurimman vaikutusvallan haltija saa hallinnan. Tasapeli jättää paikan ilman hallitsijaa.
- Rahankeruu (3 kolikkoa), sienestys (2 itiötä), kortin hankinta avoimesta tarjonnasta (1 kolikko) tai lahjoitus yhteiseen kriisiin (1–3 kolikkoa).
- Salainen yöjuoni: soluttautuminen, tihutyö tai nimetön mesenaatti. Yksi juoni per pelaaja ja kierros. Muut näkevät valmistelun, sisältö ja kohde selviävät yön aikana.

Viisi paikkaa tuottavat seuraavan kierroksen alussa mainetta, rahaa tai itiöitä. Uusi tapahtuma muuttaa kierroksen olosuhteita. Yhteinen kriisi vaatii 2 kolikkoa pelaajaa kohti; onnistuminen antaa kaikille 1 maineen ja lahjoittajille vielä 1. Epäonnistuminen vie kaikilta 1 maineen ja 1 kolikon.

Kolmas onnistunut likainen hyökkäys aiheuttaa 2 maineen sakon. Koskemattomuus torjuu yhden hyökkäyksen. Kolikoita ja itiöitä voi varastoida enintään 15, vaikutusvaltaa 8 per pelaaja ja paikka, kortteja 6. Kierroksen alussa saat 2 kolikkoa ja enintään 2 uutta korttia. Avoin tarjonta sisältää kolme eri korttia; vallankumouskortti esiintyy enintään kerran koko pelissä.

Lopputulos: **maine + 2 pistettä per hallittu paikka + salaisen tavoitteen bonus**. Tasapisteissä voitto jaetaan. Kuusi tavoitetta painottavat varallisuutta, itiöitä, hallintaa, likaisia hyökkäyksiä, lahjoituksia tai laajaa vaikutusverkostoa. Oma bonus näkyy Juonet-välilehdellä. Muiden tavoitteet paljastuvat lopussa tai tietovuodossa.

Puolueet ovat oikeita suomalaisia puolueita, mutta toimivat julkisena pelihahmon taustana. Ne eivät määrää liittolaisia tai salaista tavoitetta. Peli on fiktiivistä satiiria eikä puolueiden tuottama tai hyväksymä.

## Moninpeli ja mobiili

Jokaisella huoneella on oma kuusimerkkinen koodi ja kutsulinkki. Ensimmäinen liittyjä on isäntä. Pelaajan satunnainen selainavain säilyy paikallisesti ja toimii samassa huoneessa uudelleenlatauksen jälkeen. Pelaaminen tarvitsee verkon. PWA:n käyttöliittymä avautuu myös offline-välimuistista.

Vuoroilla ei ole automaattista aikarajaa. Isäntä voi kierroksen alusta kuluneiden 90 sekunnin jälkeen ohittaa poissaolevat ja päättää kierroksen. Vain isäntä voi käynnistää uuden pelin lopputuloksen jälkeen. Ei isännän siirtoa, kadonneen selainavaimen palautusta, vahvaa identiteettiä tai roskapostisuojausta.

## Arkkitehtuuri

- **Cloudflare Workers Static Assets:** vain `public/`, ei pelipalvelinta tai tietokantasidontoja.
- **Supabase Edge Function `game-v2`:** `src/v2/game.js`, `api.js` ja `store.js`. Supabase-projekti `rihmastovalta`, ref `egnxfxjshpjedbdlxzmv`, eu-north-1.
- **PostgreSQL:** `rihma_v2.rooms`, huonekohtainen revision compare-and-swap. SQL-RPC:t `rihma_v2_read_room(room_key)` ja `rihma_v2_save_room(room_key, expected_revision, next_state)` on sallittu vain service_rolelle. Taulu on yksityisessä skeemassa ja RLS käytössä.
- Fronttiin menee vain julkinen funktion URL. Supabasen palvelinavain pysyy Edge Functionissa. Gatewayn JWT-tarkistus on pois käytöstä, koska peli tunnistaa pelaajat omilla satunnaisilla bearer-avaimillaan.
- Palvelin palauttaa vain pyytäjän käden, tavoitteen, juonen ja tiedustelutiedot. Vastustajien kädet, juonien sisältö, tokenit ja korttipakka eivät tule julkiseen näkymään. Tavoitteet ja bonukset julkaistaan pelin lopussa; korttikädet pysyvät silloinkin yksityisinä.

Aiempi `game`-funktio, `rihma_private.room` ja vanhat lähdemoduulit on jätetty talteen. Niitä ei käytetä uudessa käyttöliittymässä. Uudistus ei ylikirjoita aiempaa huonetta tai sen pelaajien tietoja.

## Kehitys

Node.js 22+ ja npm.

```sh
npm ci
npm test
npm run check
npm run dev
```

Paikallinen API on `/api/v2`. Kehityspalvelin tallentaa huoneet erillisiin `.local/v2-<koodi>.json`-tiedostoihin. Override-testiin: `PORT=8793 RIHMA_DATA_DIR=/tmp/rihma-test npm run dev`. Julkinen `config.js` osoittaa tuotantoon; vaihda se paikallisen kehityksen ajaksi `window.RIHMA_API = '/api/v2';` tai ylikirjoita vastaus selaintestin reitityksellä. Älä commitoi paikallista URL:ia tuotantoon.

`npm test`: uuden pelin sääntö-, API- ja tietokantatestit. Mukana 90 toistettavaa kokonaista peliä 2, 4 ja 6 pelaajalla. `npm run test:legacy` tarkistaa vanhan version. Vanha `npm run smoke` on vain aiempaa `/api`-peliä varten.

## Julkaisu

Sovella migraatiot Supabase-projektiin. Julkaise `supabase/functions/game-v2/index.ts` ja kaikki `src/v2/`-riippuvuudet. JWT-gatewaytarkistus pois, pelin oma tunnistus jää päälle.

```sh
npm run configure -- https://<project-ref>.supabase.co/functions/v1/game-v2
npm run deploy:frontend
```

Pluginilla voi suorittaa migraatiot, julkaista funktion ja siirtää Cloudflare-assetsit ilman paikallisia hallinta-avaimia. `check-deploy.mjs` vaatii `game-v2`-osoitteen. Älä julkaise palvelinavaimia tai asset-upload-JWT:tä lähdekoodiin.

Tarkistusten ja julkaisun tiedot: [RELEASE.md](RELEASE.md).
