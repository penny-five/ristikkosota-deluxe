# Julkaisu 24.10.2026

Peliosoite: https://rihmastovalta.pennyfive.workers.dev/

## Julkaistut osat

- Cloudflare Workers Static Assets: `rihmastovalta`, tili `penny-five`, workers.dev-alidomain `pennyfive`. Ei palvelinmoduuleja tai tietokantasidontoja.
- Supabase: `rihmastovalta`, `egnxfxjshpjedbdlxzmv`, Tukholma (`eu-north-1`). Pelipalvelin `https://egnxfxjshpjedbdlxzmv.supabase.co/functions/v1/game`.
- Edge Function `game`, JWT-gatewaytarkistus pois, omat satunnaiset selainavaimet. Palvelinavain pysyy Supabasessa.
- Tietokannan yksityinen huone, RLS ja vain service_rolelle sallitut RPC:t. Migraatiotiedostot vastaavat pluginin luomaa pilvihistoriaa.

## Todennetut tarkistukset

16 sääntö-, API- ja PostgreSQL-testiä sekä syntaksitarkistukset. Chromiumin viisi erillistä mobiilikontekstia: liittyminen, puolueen valinta/vaihto, roolikortti, retkikunnat, äänestys, sato, voitto, uusi peli ja chat. Uudelleenlataus säilyttää jäsenyyden. Leveydet 320–768 px, ei sivuttaisvieritystä, lomakekontrollit vähintään 44 px.

Pilven erillinen testihuone: viisi istuntoa, samanaikaiset äänet, kolme onnistunutta retkeä, salattujen tietojen suodatus, reset ja sosialistinen vallankumous. Testiskeema ja data poistettu. `game-check` on käytöstä poistettu testifunktio (JWT päällä, handler palauttaa 410).

Julkinen mobiilisivu: HTTP 200, tyhjä aula, HTTPS, oikeat fontit, service worker aktiivinen ja 11 käyttöliittymätiedostoa offline-välimuistissa. Kelpaamaton selainavain ei voi tehdä toimintoja; julkisella Supabase-avaimella yksityiset RPC:t palauttavat 401.

Supabasen tietoturvatarkistus ilmoitti vain informatiivisesti, ettei yksityisellä RLS-taululla ole julkisia policyjä. Tämä on tarkoituksellista: vain palvelin-RPC:t käsittelevät tilaa. Suorituskykytarkistuksessa ei huomautuksia.

## Käyttö ja rajat

Avaa sama osoite 3–10 pelaajan selaimissa. Ensimmäinen liittyjä on isäntä. Vähintään kaksi puoluetta tarvitaan. Pelaaminen edellyttää verkkoa; offline-välimuisti näyttää käyttöliittymän. Fyysisellä puhelimella tehtyä pelitestiä tai käyttöjärjestelmän PWA-asennusdialogia ei ole todennettu. Ei vahvaa identiteettiä, isännän siirtoa, hukatun selainavaimen palautusta tai roskapostisuojausta.

Käyttäjän pyytämä `passa-grisar`-projektin poisto jäi tekemättä, koska käytettävissä oleva Supabase-plugin ei tarjoa projektin poistamista. Projekti on yhä olemassa.

## Pienpelipäivitys ja SVG-kuvakkeet

Peli alkaa nyt kolmella pelaajalla. 3–4 pelaajan pienpelissä yksi myrkyttäjä aloittaa neljällä itiöllä; muut kahdella. Retkikunnat ovat kolmella aina 2 ja neljällä 2/2/3/2/3. Kolmen mobiiliselaimen kokonainen peli, puolueenvaihto, reload, chat ja kaikki aiemmat mobiilileveydet testattu. Testit varmistavat myös neljän pelaajan pelin ja molempien roolien voittomahdollisuuden pienpelin itiötaloudella. Varsinaisten isojen pelien säännöt säilyvät. Koristeelliset Unicode-kuvakkeet vaihdettu SVG:hen myös hero-otsikosta ja pelitoiminnoista.
