# rezz-platform

Platforma za rezervacije lokala i događaja.

Ovaj fajl je živa dokumentacija projekta. Svaka značajna funkcionalnost, poslovno pravilo ili podesivo ponašanje opisani su ovdje jednostavnim jezikom, tako da bilo ko — inženjer, proizvodni tim ili klijent — može razumjeti šta sistem radi bez čitanja izvornog koda. Kada se neka funkcionalnost doda ili promijeni, ovaj fajl mora biti ažuriran u istoj izmjeni kako se ne bi razlikovao od stvarnog stanja.

> Ovaj dokument je srpski (latinica) prevod fajla `README.md`. Engleska verzija je glavna; oba fajla moraju biti ažurirana zajedno pri svakoj izmjeni.

## Struktura repozitorijuma

- `apps/api` — NestJS backend.
- `apps/web` — React + Vite frontend.
- `packages/shared` — zajednički TypeScript tipovi.

## Najčešće komande

- `pnpm dev` — pokreće sve aplikacije u razvojnom modu.
- `pnpm build` — gradi sve aplikacije.
- `cd apps/api && pnpm seed` — inicijalno popunjavanje baze.

---

# Uloge

Sistem ima četiri uloge. Svaki korisnik ima tačno jednu. Dozvole ispod opisuju šta uloga može da radi; sve što nije navedeno je zabranjeno.

## Super admin

Vlasnik platforme. Ima potpun pristup svim dijelovima sistema.

- **Upravljanje lokalima** — kreiranje, izmjena, aktivacija ili deaktivacija, i brisanje lokala.
- **Pozivnice za lokal** — pozivanje menadžera ili radnika na lokal putem email-a.
- **Upravljanje korisnicima** — listanje i pretraga svih korisnika, pregled detalja, izmjena imena ili uloge gosta, aktiviranje ili deaktiviranje naloga, dodavanje ili uklanjanje sa crne liste uz razlog, i brisanje naloga.
- **Postavke** — upravljanje podesivim enumeracijama poput tipova stolova i drugih admin-podesivih vrijednosti.
- **Landing stranica** — pregled i izmjena konfiguracije javne landing stranice.
- **Sve menadžerske dozvole** — može uraditi i sve što menadžer može na bilo kom lokalu.

## Menadžer

Upravlja jednim lokalom koji posjeduje.

- **Moj lokal** — pregled i izmjena profila lokala, radnog vremena, načina plaćanja i rasporeda stolova. (Upravljanje galerijom još nije implementirano; sekcija trenutno prikazuje "uskoro" placeholder.)
- **Zaposleni** — pozivanje radnika na svoj lokal, izmjena uloge radnika i uklanjanje zaposlenih.
- **Događaji** — kreiranje, izmjena i brisanje događaja za svoj lokal, plus dodavanje ili uklanjanje promotivnih slika za događaje.
- **Rezervacije** — pregled cijele liste rezervacija lokala, detaljan pregled rezervacije, potvrda ili odbijanje rezervacija na čekanju, evidentiranje dolaska ili nedolaska, otkazivanje rezervacija i ocjenjivanje gostiju nakon završene rezervacije.
- **Obavještenja** — primanje i čitanje obavještenja o novim i ažuriranim rezervacijama.
- **Uvid u gosta** — pregled prosječne ocjene gosta i broja nedolazaka u skorijem periodu iz bilo koje rezervacije svog lokala.

## Radnik

Osoblje na podu jednog lokala. Dozvoljene akcije radnika su namjerno uske: ocjenjivanje gosta i evidentiranje da li je gost došao ili ne. Ništa drugo.

- **Evidentiranje dolaska** — označavanje potvrđene rezervacije kao završene (gost došao) ili kao nedolazak. Ishod nedolaska je akcija koja hrani brojač automatske crne liste.
- **Ocjenjivanje gosta** — ocjenjivanje gosta zvjezdicama uz opcionalnu napomenu nakon što je rezervacija označena kao završena. Postojeće ocjene se mogu i izmijeniti.
- Radnici ne vide obavještenja, ne vide nikakav uvid u gosta (broj nedolazaka, prosječnu ocjenu), ne vide listu rezervacija, ne potvrđuju i ne odbijaju rezervacije na čekanju, i ne upravljaju događajima, zaposlenima, postavkama ili profilom lokala.

Posebna radnička UI površina koja bi radnicima omogućila da pronađu i akcioniraju rezervacije za koje su zaduženi još nije izgrađena. Za sada, jedina stranica dostupna radniku u dashboard-u je njegov vlastiti profil. Endpoint-i za evidentiranje dolaska i ocjenjivanje su na API strani dostupni radničkoj ulozi i spremni da budu povezani kada se radnički UI osmisli.

## Gost

Običan korisnik javne aplikacije. Može imati nalog i slati rezervacije.

- **Pregledanje** — pregled lokala i događaja na javnim stranicama bez prijave.
- **Rezervisanje** — slanje zahtjeva za rezervaciju u lokalu ili za događaj, kada je prijavljen. Podliježe pravilima crne liste opisanim u funkcionalnosti Crna lista ispod.
- **Profil** — pregled i izmjena vlastitog profila, pregled predstojećih rezervacija i istorije rezervacija, otkazivanje rezervacije dok je još na čekanju ili potvrđena.
- Gosti ne vide nikakav dashboard, upravljanje lokalima, niti podatke drugih korisnika.

---

# Funkcionalnosti

## Crna lista

### Šta radi

Crna lista sprečava goste koji se ponavljano ne pojavljuju da prave nove rezervacije. Gost koji se ne pojavi previše puta unutar nedavnog vremenskog prozora automatski se blokira za rezervacije. Nakon konfigurabilnog perioda mirovanja, blokada ističe sama, a u svakom trenutku super admin može ručno blokirati ili odblokirati gosta uz pisani razlog.

### Kako gost biva blokiran, blokiran i na kraju odblokiran

Gost rezerviše uobičajeno preko javne stranice lokala ili događaja. Tokom rezervisanja nema interakcije sa crnom listom osim ako gost već nije blokiran.

Kada datum rezervacije prođe, osoblje lokala bilježi ishod — ili je gost došao, ili se nije pojavio. Ishod nedolaska je jedini signal koji prati automatska crna lista.

Kad god osoblje označi rezervaciju kao nedolazak, sistem broji koliko je rezervacija sa nedolaskom isti gost akumulirao u konfigurisanom kliznom prozoru (podrazumijevano: posljednjih 30 dana). Ako broj dostigne konfigurisani prag (podrazumijevano: 3), gost se odmah označava kao na crnoj listi, sa vremenskom oznakom, i lokalizovani automatski generisan razlog se upisuje u njegov nalog. Tekst razloga uključuje prag i prozor riječima, tako da ostaje tačan kada se politika kasnije promijeni. Ako je gost već na crnoj listi, druga oznaka se ne upisuje — postojeća blokada ostaje.

Kada blokirani gost pokuša ponovo da rezerviše, sistem provjerava da li je njegova blokada istekla. Istek se računa kao vremenska oznaka blokade plus konfigurisano trajanje blokade (podrazumijevano: 1 dan). Ako je period mirovanja prošao, blokada se u tom trenutku briše i rezervacija se nastavlja normalno. Ako period mirovanja nije istekao, zahtjev se odbija i gost vidi lokalizovanu poruku "vaš nalog je blokiran".

Blokirani gost vidi crveni baner umjesto forme za rezervaciju na stranicama detalja lokala, detalja događaja i profila. Baner objašnjava situaciju, opcionalno prikazuje upisani razlog i nudi `mailto:` link ka podršci kako bi gost mogao da uloži žalbu. Baner se prikazuje samo dok je blokada zaista na snazi — ako je period mirovanja tehnički istekao ali je trajno sačuvano stanje autentikacije zastarjelo, prikazuje se forma umjesto banera koji bi obmanuo.

Blokada se takođe oportunistički briše kad god se sesija korisnika osvježi: endpoint `/auth/me` primjenjuje isto pravilo isteka i tiho briše kolone kada je period mirovanja prošao. Ne postoji zakazani posao — čišćenje se dešava gdje god korisnik prođe kroz sistem.

### Ručno preimanje od strane super admina

Nezavisno od automatskog toka, super admin može da blokira ili odblokira bilo kog gosta iz admin drawer-a sa detaljima korisnika. Blokiranje zahtijeva korak potvrde da/ne i opcionalno upisani razlog. Odblokiranje zahtijeva isti korak potvrde. Obje akcije koriste ista polja u bazi kao automatski tok, tako da ručno postavljena blokada ističe po istim pravilima osim ako je admin ranije ne obriše.

### Šta osoblje lokala vidi

Kada osoblje otvori rezervaciju u dashboard drawer-u, sistem prikazuje koliko nedolazaka je taj gost akumulirao u konfigurisanom prozoru. Ako broj nije nula, mali bedž se pojavljuje pored imena gosta — ćilibarski kada je ispod praga, crven kada je na ili iznad. Tekst bedža i tooltip čitaju dužinu prozora iz API odgovora, tako da UI ostaje sinhronizovan ako se politika promijeni bez ikakvog frontend deploy-a.

### Podesivost

Sva tri broja politike žive u environment varijablama koje se čitaju jednom pri pokretanju:

- `BLACKLIST_NO_SHOW_THRESHOLD` — koliko nedolazaka okida blokadu (podrazumijevano 3).
- `BLACKLIST_NO_SHOW_WINDOW_DAYS` — klizni prozor u danima koji se koristi pri brojanju nedolazaka (podrazumijevano 30).
- `BLACKLIST_BLOCK_DAYS` — koliko blokada traje prije nego automatski istekne (podrazumijevano 1).

Nevalidne ili nedostajuće vrijednosti vraćaju se na podrazumijevane umjesto da ruše pokretanje.

### Skica implementacije

Tri broja politike umotani su u mali injektabilni provider koji izlaže tipizovane akcesore i pomoćne metode poput "da li je isteklo?" i "kada ističe?". Provider je registrovan kao globalni modul tako da bilo koji servis može da ga injektira bez eksplicitnih importa.

Postoje tačno tri mjesta u API-ju koja diraju stanje crne liste. Kreiranje rezervacije provjerava da li je trenutni korisnik na crnoj listi, lijeno briše red ako je blokada prošla istek, a inače odbija zahtjev. Evidentiranje dolaska broji nedavne nedolaske u konfigurisanom prozoru, poredi sa pragom i postavlja kolone crne liste kada oba uslova okidaju. Razrješavanje trenutnog korisnika na `/auth/me` pokreće isti prolaz lijenog brisanja tako da sljedeće osvježavanje sesije nakon isteka vraća čisto stanje.

Zapis korisnika čuva tri kolone: boolean zastavicu, vremensku oznaku i string razloga. Ne postoji posebna kolona "ističe u" — istek se uvijek izvodi pri čitanju iz vremenske oznake plus konfigurisanog trajanja blokade. To znači da promjena perioda mirovanja u environment-u retroaktivno skraćuje ili produžava postojeće blokade, što je željeno ponašanje pri kasnijem pooštravanju politike. Tekst automatski generisanog razloga se proizvodi kroz i18n servis na srpskom i engleskom, sa pragom i prozorom prosljeđenim kao argumenti interpolacije, tako da razlog za sljedeću automatsku blokadu uvijek odražava trenutnu politiku.

Posvećen endpoint na reservations kontroleru vraća broj nedavnih nedolazaka uz dužinu prozora korištenu za izračunavanje. Web strana ovo upituje pri otvaranju drawer-a sa detaljima rezervacije. Vraćanje dužine prozora uz broj je ono što omogućava da bedž ostane dinamičan umjesto da se brojevi tvrdo kodiraju u prevodnim fajlovima.

Na web strani, auth odgovor uključuje tri polja relevantna za crnu listu plus izvedenu vremensku oznaku isteka. Auth store ih trajno čuva kroz reload-ove. Jedan helper, `isUserCurrentlyBlocked`, odgovara na "da li je ovaj korisnik trenutno blokiran, uzimajući u obzir istek?" i izvor je istine za to da li se prikazuje forma za rezervaciju ili baner. To čuva tri lokacije banera konzistentnim.

Ručno blokiranje i odblokiranje obrađuje već postojeći super-admin endpoint na users-admin modulu. Postavljanje na true postavlja vremensku oznaku i razlog; postavljanje na false briše sve tri kolone. Admin drawer sa detaljima korisnika u dashboard-u izlaže obje akcije iza koraka potvrde da/ne, u skladu sa pravilom projekta o potvrdi destruktivnih akcija.

### Pooštravanje politike kasnije

Da bi crna lista postala stroža, promijenite tri environment varijable i redeploy-ujte API. Bez migracije baze, bez izmjene koda, bez frontend release-a. Tekst automatski generisanog razloga, oznaka bedža za osoblje i kapija forme za rezervaciju će svi odražavati nove brojeve čim se API restartuje. Postojeći redovi se ne prepisuju — ali se njihov efektivni istek ponovo izračunava iz sačuvane vremenske oznake plus novog trajanja blokade pri sljedećem čitanju.

Ako politika treba da postane uređiva od strane admina iz same aplikacije umjesto kroz environment varijable, prirodan sljedeći korak je migracija ova tri broja u postojeću settings tabelu koja već pokreće druge admin-podesive vrijednosti. Sve nizvodno — provođenje, statistika, baner — bi ostalo nepromijenjeno.

## Minimalna starost gostiju lokala

### Šta radi

Lokal može da deklariše minimalnu starost za goste. Kada je to ograničenje postavljeno, svaka rezervacija na tom lokalu mora da nosi godine svakog gosta, i svake godine moraju da zadovolje ograničenje. Ovo omogućava lokalima poput barova i klubova da provode politike o godinama kroz tok rezervacije umjesto da hvataju neusklađenosti na ulazu.

### Kako se pojavljuje u formama lokala

I forma za kreiranje/izmjenu lokala super admina i editor "moj lokal" menadžera izlažu jedno opcionalno polje **minimalna starost gostiju**. Polje prima cio broj između 1 i 120, ili može ostati prazno. Prazno znači da lokal nema starosno ograničenje i da se neće pojaviti polja za godine u njegovom toku rezervacije.

### Kako se pojavljuje u formi za rezervaciju

Javna forma za rezervaciju prati dvije stvari: minimalnu starost gostiju lokala i broj gostiju izabran za rezervaciju. Ako lokal nema minimum, ništa se ne mijenja — forma izgleda kao i prije, bez polja za godine, bez payload-a za godine. Ako lokal ima minimum, pojavljuje se blok "godine" sa jednim numeričkim poljem po gostu. Mijenjanje broja gostiju dodaje ili uklanja polja kako bi se podudaralo. Svako polje je označeno i prikazuje minimum lokala u naslovu sekcije tako da gost zna pravilo prije kucanja.

Svako polje za godine je numeričko polje ograničeno na opseg 0–100 samim poljem, tako da se kucanje van opsega sprečava na nivou pretraživača bez eksplicitne poruke o grešci. Jedina poruka koju forma prikazuje je za politiku lokala: godina ispod minimuma lokala se ističe crvenom ivicom i porukom po polju koja uključuje stvarni minimum, tako da gost razumije koja vrijednost bi bila prihvaćena. Prazna polja su obavezna prije slanja. Dugme za slanje je omogućeno samo kada je svako polje validno; slanje sa bilo kojim nevalidnim poljem je blokirano.

Kada se forma pošalje, niz godina se šalje uz ostatak payload-a rezervacije. Kada lokal nema ograničenje, godine se ne šalju.

### Provođenje na strani servera

Frontend validacija je za UX. Backend ponavlja iste provjere prije čuvanja bilo koje rezervacije, i u toku gosta i u toku menadžerski-kreirane rezervacije. Ako lokal ima postavljenu minimalnu starost, API zahtijeva da niz godina bude prisutan, da se po dužini podudara sa brojem gostiju, i da svaki unos bude na ili iznad minimuma. Bilo koji propust vraća lokalizovani 400 sa porukom koja imenuje stvarni minimum, tako da svako ko pogađa API direktno dobija istu zaštitu kao i forma.

### Skica implementacije

Entitet lokala dobija jednu nullable integer kolonu za minimalnu starost. Oba puta upisivanja lokala (admin kreiranje/izmjena i menadžer izmjena) prihvataju polje i čuvaju ga. Javni odgovor lokala uključuje ga tako da forma za rezervaciju može da ga pročita bez dodatnog zahtjeva. Entitet rezervacije dobija nullable kolonu niza za godine, sačuvanu samo kada je lokal imao ograničenje u trenutku rezervacije. Reservations servis ima mali helper koji učitava lokal, odlučuje da li su godine potrebne, i ili validira ili vraća null. Oba endpoint-a za kreiranje rezervacije pozivaju isti helper, tako da menadžerski-kreirane rezervacije podliježu istom pravilu kao i one koje pošalje gost. Poruke o greškama žive u API i18n fajlovima na srpskom i engleskom sa interpolovanim minimumom, tako da poruka ostaje tačna kada se ograničenje lokala promijeni.

## Neradni dani lokala

### Šta radi

Lokal može da označi određene kalendarske datume kao neradne dane. Neradni dani su godišnje-nezavisni — čuvaju se kao parovi mjesec-i-dan, i isti datumi važe svake godine, tako da lokal koji je zatvoren 1. januara ostaje zatvoren 1. januara u 2026, 2027 i dalje, bez da iko ponovo unosi datum. Lista je opcionalna. Lokali bez neradnih dana ponašaju se tačno kao i prije.

### Kako se pojavljuje u formama lokala

I forma za kreiranje/izmjenu lokala super admina i editor "moj lokal" menadžera izlažu kalendarski biraju označen "Neradni dani". Birač prikazuje jedan mjesec u jedan, sa strelicama prethodni/sljedeći, imenom mjeseca i mrežom dana. Klik na dan ga prebacuje u crveno (zatvoren) ili nazad u bijelo (otvoren). Navigacija na sljedeći mjesec čuva selekcije. Godina prikazana u zaglavlju je čisto za vizuelni kontekst — selekcije ne zavise od nje, jer je osnovni podatak samo par mjesec-i-dan. Ostavljanje birača praznim znači da lokal nema neradne dane.

### Kako se pojavljuje u formi za rezervaciju

Kada gost otvori formu za rezervaciju lokala i izabere datum, forma provjerava da li se mjesec i dan tog datuma podudaraju sa nekim od neradnih dana lokala. Ako da, stranica lokala se i dalje prikazuje normalno — gost može da pročita sve o lokalu — ali je dugme za slanje rezervacije onemogućeno i njegova oznaka se mijenja u "Neradni dan". Ovo jasno saopštava da rezervacija nije dozvoljena za izabrani datum bez sakrivanja lokala iz kataloga.

### Provođenje na strani servera

Frontend kapija je za UX. Backend ponavlja istu provjeru prije čuvanja bilo koje rezervacije. I u toku gosta i u toku menadžerski-kreirane rezervacije, servis učitava lokal, izvlači mjesec i dan traženog datuma rezervacije i traži podudaranje u nizu neradnih dana lokala. Podudaranje vraća lokalizovani 400 sa porukom "lokal ne radi tog datuma", tako da svako ko poziva API direktno dobija istu zaštitu kao i forma.

### Skica implementacije

Entitet lokala dobija jednu jsonb kolonu koja sadrži niz parova `{ month, day }`. Oba puta upisivanja lokala prihvataju niz i pokreću normalizator u servisu: nevalidni unosi se odbacuju, duplikati se uklanjaju, a rezultat se sortira mjesec-pa-dan tako da je čuvana forma stabilna. Javni odgovor lokala uključuje niz tako da forma za rezervaciju ima ga bez dodatnog zahtjeva. Forma za rezervaciju računa jedan boolean iz izabranog datuma plus niza lokala; ništa drugo u formi se ne mijenja. Reservations servis izlaže mali helper koji ponovo pokreće isti boolean nasuprot sačuvanog lokala i baca lokalizovani 400 kada se podudari. Oba endpoint-a za kreiranje rezervacije pozivaju helper, tako da menadžerski-kreirane rezervacije podliježu istom pravilu kao i one koje pošalje gost. UI birača je posebna komponenta koja dijeli vizuelni jezik postojećeg date pickera projekta.
