# Rihmastovalta 2 — nykytila 24.10.2026

Peli: https://rihmastovalta.pennyfive.workers.dev/
Repo: `penny-five/ristikkosota-deluxe`, checkout `/workspace/ristikkosota-deluxe`. Lue README.md ja RELEASE.md. Käyttäjän viimeisin pyyntö oli täydellinen pivot viihdyttävämpään ja monipuolisempaan peliin. Hän kielsi botit: vain moninpeli riittää.

## Uusi peli

- 2–6 oikeaa pelaajaa, erilliset huoneet kuusimerkkisillä liittymiskoodeilla ja kutsulinkeillä.
- Kuusi kierrosta, jokaisella kolme samanaikaisesti käytettävää tekoa. Ei vanhan version retkikunta- tai enemmistöäänestyssilmukkaa.
- Viisi vallattavaa paikkaa: Sienitalo, Kauppatori, Iltarihmasto, Itiölaboratorio, Korpisalo. Suurin vaikutusvalta hallitsee, tasapeli ei. Paikat tuottavat tuloa seuraavan kierroksen alussa ja ovat lopussa 2 pistettä kukin.
- 12 korttityyppiä. Painotettu sekoitettu pakka. Markkinassa kolme eri korttia. Vallankumouskortti vain kerran pelissä. Käsi max6, kierroksen alussa +2 korttia jos tilaa.
- Kolme salaista yöjuonta. Juonet ratkeavat kierroksen lopussa satunnaisessa järjestyksessä.
- Kuusi henkilökohtaista tavoitetta, riippumattomia puolueista. Lopussa maine + paikat + tavoitebonus. Tasapeli jakaa voiton.
- Yhteinen kriisi, kuusi kierrostapahtumaa, kolme epäilyä aiheuttaa mainehaitan, suojakortti torjuu yhden hyökkäyksen.
- Isäntä voi ohittaa poissaolevat 90 sekunnin jälkeen. Ei automaattista aikakatkaisua.
- Vain SVG-kuvakkeita. Käyttäjä ei halua emoji-/Unicode-koristeita. Mobiili on ensisijainen alusta.

## Lähteet ja julkaisu

- Uusi koodi: `src/v2/game.js`, `api.js`, `store.js`.
- Edge: `supabase/functions/game-v2/index.ts`, gateway verify_jwt=false, oma bearer-tunnistus.
- Supabase `rihmastovalta`, ref `egnxfxjshpjedbdlxzmv`, eu-north-1. Uusi skeema `rihma_v2`, taulu `rooms`, RPC `rihma_v2_read_room(room_key)` ja `rihma_v2_save_room(room_key, expected_revision, next_state)`. Service_role yksin saa käyttää niitä, taulu yksityinen ja RLS päällä.
- Migraatio `20261024091406_multiplayer_pivot.sql`, sama versio pilvessä.
- Cloudflare `rihmastovalta`, account `c27fb32a8b3a98db16545aa0fb80ce5e`, `pennyfive.workers.dev`. Vain Static Assets, ei backendmoduuleja.
- Frontin config osoittaa `/functions/v1/game-v2`. SW-välimuisti `rihma-v6`.
- Vanha koodi `src/game.js` jne, vanha Edge `game`, vanha tietokanta `rihma_private.room` jätetty ennalleen. Frontti ei käytä niitä. Älä sotke uuden version sääntöjä vanhoihin.
- Vanha `game-check`-testifunktio on poistettu käytöstä JWT-tarkistuksella ja 410-handlerilla. Pluginissa ei ole function delete -toimintoa.

## Tarkistukset ja paikallinen työ

`npm test`, `npm run check`. Vanhan version testit: `npm run test:legacy`. Uuden version 14 testiin sisältyy 90 kokonaista simuloitua pelikulkua eri siemenillä; nämä eivät ole pelattavia botteja.

Paikallisen Node-palvelimen reitti `/api/v2`. Jokainen huone tallentuu omaan `v2-CODE.json`-tiedostoon. Tuotantoconfig osoittaa pilveen, joten paikallisessa selaintestissä `/config.js` ylikirjoitettiin vastauksella `window.RIHMA_API='/api/v2';`.

Playwright on ympäristössä valmiiksi saatavilla require('playwright') kautta, Chromium `/usr/bin/chromium`. Selaimen/kuunteluporttien ajo vaatii täällä sandbox-escalationin. Varsinaisen pelin kaksi mobiilikontekstia ja kaikkien neljän välilehden leveydet 320–1280 px testattu. Testiskripti `/workspace/work/pivot/mobile.cjs`. Näyttökuvat samassa work-hakemistossa. Nämä ovat väliaikaisia testiartefakteja, eivät lähdekoodin riippuvuuksia.

Oikean pilven kokonainen pelikoe tehtiin erilliseen satunnaiskoodiseen testihuoneeseen, ei käyttäjän huoneeseen. Testihuoneet poistettiin niiden tarkkojen koodien ja testinimien ehdolla. Julkinen Cloudflare-frontti on myös todennettu oikeassa 390 px pilviselaimessa: huoneen luonti, liittyminen, opastus, samanaikaiset teot ja paikan valtaus toimivat. Vain oma käsi ja tavoite palautuvat. RPC-luku julkisella avaimella estyi; SW aktivoitui ja 11 assetia välimuistissa. Tämäkin testihuone poistettu. Älä aja smokea käyttäjien käynnissä olevaan huoneeseen.

## Ympäristö ja työkalut

Supabase- ja Cloudflare-pluginit ovat käytettävissä. Käytä niitä ensisijaisesti; älä kysy API-avaimia. Pilven shell-egress ei salli Supabase-hostia tai workers.dev-hostia. Pilven HTTP- ja selaintarkistukset tehtiin Cloudflare Browser Rendering -API:n content-rajapinnalla ja addScriptTag/waitForSelector-asetuksilla.

Cloudflare-assetsien julkaisu: pluginilla assets-upload-session; palautettu rajattu upload-JWT turvalliseen väliaikaistiedostoon; shellin Python urllib siirtää base64 multipart -bucketit `api.cloudflare.com`-osoitteeseen. Lopuksi pluginilla metadata-only PUT assets-completion-tokenilla. Ei Worker-palvelinmoduulia. Poista upload-JWT:t työn jälkeen. Valmistelu- ja uploadskriptit `/workspace/work/visual/prepare-assets.cjs`, `upload.py`. Älä commitoi tokeneita. Manifest/hash/base64-aineisto `/workspace/work/visual/assets.json` on julkista fronttia.

## Keskeneräinen muu pyyntö

Käyttäjä pyysi aiemmin `passa-grisar`-Supabase-projektin poistamista. Sitä EI poistettu: pluginista puuttuu projektin poistotoiminto eikä ympäristössä ole erillistä Supabase-hallintakirjautumista. Käyttäjälle kerrottu. Älä väitä poistetuksi.
