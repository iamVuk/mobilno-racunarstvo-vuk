# MediaTrack

**Autor:**: Vuk Šeovac
**Predmet:** Mobilno računarstvo 2024/25

## Opis

MediaTrack je hibridna mobilna aplikacija izrađena pomoću Ionic frameworka.
Omogućava korisniku prijavu, registraciju i praćenje filmova koje planira da gleda, trenutno gleda ili je završio.
Podaci se čuvaju u Firebase Realtime Database pomoću REST API zahteva.

Aplikacija uključuje i integraciju sa OMDb API-jem koja omogućava pretragu filmova, automatsko preuzimanje naslova, postera i kratkog opisa, čime se olakšava dodavanje filmova u ličnu kolekciju.

## Tehnologije

- HTML, CSS, JavaScript

- Ionic framework (CDN)

- Firebase Authentication (REST)

- Firebase Realtime Database (REST)

- OMDb API (Open Movie Database)

## Struktura projekta

📁 mobilno_racunarstvo_vuk <br>
┣ 📜 index.html – glavna stranica aplikacije <br>
┣ 📜 app.js – logika aplikacije, autentikacija, rad sa bazom i API pozivi <br>
┣ 📜 styles.css – stilizacija korisničkog interfejsa <br>
┣ 📜 README.md – opis projekta <br>
┣ 🖼️ filmovi.jpg – ilustracija prikazana u zaglavlju aplikacije

## Funkcionalnosti

- Registracija i prijava korisnika

- Pretraga filmova putem OMDb API-ja

- Automatsko dodavanje naslova, slike i opisa iz baze filmova

- Pregled liste filmova po korisniku

- Ažuriranje statusa gledanja (Planiram, Gledam, Gotovo)

- Brisanje filmova iz liste

- Odjava korisnika

- Responsivan prikaz i prilagođen izgled za mobilne uređaje

## Kratak opis rada

Autentifikacija korisnika i rad sa bazom podataka realizovani su pomoću Firebase REST servisa.
Svaki korisnik ima svoj odvojeni prostor u bazi (/users/{uid}/media/) gde se čuvaju filmovi sa atributima: naslov, opis, poster, status i vreme dodavanja.
Pretraga filmova vrši se putem OMDb API-ja, gde se za izabrani film automatski preuzimaju podaci i čuvaju u Firebase bazi.

## Dodatne funkcionalnosti

Osim osnovnih CRUD operacija, aplikacija uključuje:

- Validaciju sesije i automatsko odjavljivanje pri isteku tokena

- Dinamičko menjanje statusa filma jednim klikom

- Prikaz postera u kvadratnom formatu radi preglednijeg interfejsa

- Automatsko čišćenje polja za pretragu i zatvaranje sugestija nakon dodavanja filma

## Firebase konfiguracija  
Podaci o projektu se nalaze u fajlu `app.js`:  
```js
const firebaseConfig = {
  apiKey: "tvojAPIkey",
  authDomain: "tvojprojekat.firebaseapp.com",
  databaseURL: "https://tvojprojekat-default-rtdb.firebaseio.com",
  ...
};
```
## Autor

Vuk Šeovac
Fakultet organizacionih nauka



