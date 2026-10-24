# Rihmastovalta 2 — julkaisu 24.10.2026

https://rihmastovalta.pennyfive.workers.dev/

Täysi pelipivot: 2–6 oikeaa pelaajaa, huonekoodit, samanaikaiset kolme tekoa kuuden kierroksen ajan, viiden paikan aluehallinta, 12 korttityyppiä, kolme yöjuonta, kuusi salaista henkilökohtaista tavoitetta, kuusi kierrostapahtumaa ja yhteiset rahoitettavat kriisit. Ei botteja tai yksinpeliä.

## Julkaisut

Cloudflare-tilin `penny-five` Worker `rihmastovalta`: vain staattiset assetsit. Supabase-projektin `rihmastovalta` (`egnxfxjshpjedbdlxzmv`) Edge Function `game-v2`, gateway verify_jwt=false; pelaajien omat bearer-avaimet tarkistetaan palvelimella. Uusi yksityinen `rihma_v2.rooms` säilyttää huonekohtaiset revisionumerot ja JSON-pelitilat. Migraatio `20261024091406_multiplayer_pivot.sql`.

Vanha pelitila ja `game`-funktio säilytetty. Uusi frontti ei käytä niitä.

## Tarkistukset

- 14 uuden version sääntö-, API- ja PostgreSQL-testiä. 90 kokonaista peliä eri siemenillä ja 2, 4 tai 6 pelaajalla: ekonomia, käsien koko, vaikutusvaltakatot, kierrosten eteneminen, pisteytys, tietojen yksityisyys.
- Kaikki 12 korttia, kilpi, epäily, vallankumous, juonet, kriisi, huoneiden eristys, samanaikaiset kirjoitukset ja vanhentuneen revision hylkäys tarkistettu. Julkiset tietokantaroolit eivät saa lukea tai kirjoittaa huoneita/RPC:itä.
- Kaksi erillistä Chromiumin kosketuskontekstia: luonti, kutsulinkki, liittyminen, aloitus, yksityinen tavoiteopastus, kartta, juoni, lahjoitus, yön ratkaisu, kortin kohdistaminen, chat, uudelleenlataus, kuuden kierroksen lopputulos ja reset. Kaikki neljä pelivälilehteä 320, 360, 390, 430, 768 ja 1280 px leveyksillä ilman sivuttaisvieritystä.
- Oikea Supabase Edge + PostgreSQL: erillisen testihuoneen kaksi istuntoa, huoneiden eristys, väärän bearer-avaimen hylkäys, käsien/tavoitteiden/juonien suodatus, paikan valtaus, salainen juoni, kriisi, toimintokortti, kuusi kierrosta, pisteet ja uusi peli. Testihuoneet poistettu rajatulla SQL-kyselyllä niiden omien koodien ja testinimien perusteella.
- Julkaistu Cloudflare-sivu tarkistettu 390 px mobiiliselaimessa: oikea huoneen luonti, liittyminen, tavoiteopastus, kaksi samanaikaista Edge-toimintoa ja kartan valtaus käyttöliittymästä. Vain oma käsi/tavoite näkyy. Julkisen Supabase-avaimen RPC-luku estyi, SW aktiivinen, 11 tiedostoa välimuistissa, fontit latautuivat, ei sivuttaisvieritystä. Myös tämä testihuone poistettu.
- Syntaksit ja frontendin julkaisuosoitteen tarkistus läpi. Paikalliset fontit, SVG-kuvakkeet, pienempiä näyttöjä palveleva alavalikko, kosketusdialogit, iOS-kenttien 16 px kirjasinkoko ja reduced-motion.

Supabasen tietoturvatarkistuksessa vain INFO: yksityisillä RLS-tauluilla ei ole julkisia policyjä. Tämä on tarkoituksellista; pääsy on rajattu palvelin-RPC:ihin.

## Rajat

Mobiilitesti käyttää selainemulaatiota; fyysisellä puhelimella tehtyä pelisessiota tai PWA:n asennusdialogia ei ole todennettu. Viihdyttävyyttä ja tasapainoa ei voi todistaa teknisillä testeillä: ne tarvitsevat oikeiden ihmisten uuden pelikokeen. Ei vahvaa identiteettiä, isännän siirtoa tai selainavaimen palautusta. Kriisi ja juonet odottavat kierroksen loppua; isäntä voi ohittaa poissaolevat 90 sekunnin jälkeen.

Aiempi käyttäjän pyytämä `passa-grisar`-projektin poisto on edelleen tekemättä: käytettävissä olevassa Supabase-pluginissa ei ole projektin poistotoimintoa.
