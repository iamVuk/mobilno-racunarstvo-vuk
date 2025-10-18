# MediaTrack

**Autor:** Vuk Šeovac  
**Predmet:** Mobilno računarstvo 2024/25  

## Opis  
MediaTrack je hibridna mobilna aplikacija razvijena pomoću Ionic frameworka.  
Omogućava korisniku prijavu, registraciju i praćenje filmova koje planira da gleda, trenutno gleda ili je završio.  
Aplikacija koristi Firebase Realtime Database i REST API za izvođenje CRUD operacija.

## Tehnologije korišćene  
- HTML, CSS, JavaScript  
- Ionic framework (CDN)  
- Firebase Realtime Database  
- REST API komunikacija (fetch)

## Struktura projekta  
📁 mobilno_racunarstvo_vuk  
 ┣ 📜 index.html → Glavna stranica aplikacije  
 ┣ 📜 app.js → Logika aplikacije i povezivanje sa Firebaseom  
 ┣ 📜 styles.css → Stilizacija interfejsa  
 ┣ 📜 README.md → Opis projekta  
 ┣ 🖼️ filmovi.jpg → Slika koja se prikazuje u aplikaciji


## Funkcionalnosti  
- Registracija i prijava korisnika  
- Dodavanje filmova sa napomenom i statusom  
- Pregled liste filmova  
- Ažuriranje statusa (Planiram, Gledam, Završeno)  
- Brisanje filmova  
- Odjava korisnika  

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
## Karakteristike

Aplikacija je hibridna, što znači da se može pokretati i u web browseru i kao mobilna aplikacija.

## Autor

Vuk Šeovac
Fakultet organizacionih nauka