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

## Godine gostiju na svakoj rezervaciji

### Šta radi

Svaka rezervacija mora da nosi godine svakog gosta u rezervaciji. Ovaj podatak se prikuplja unaprijed kroz formu za rezervaciju i čuva na rezervaciji, bez obzira na to na kom lokalu je rezervacija. Podatak služi kao osnova za buduću analitiku super admina (raspodjela starosti rezervacija, prosječne godine osobe koja rezerviše po lokalu i slično) i kao ulaz u provjeru starosne politike lokala opisanu ispod.

Lokal dodatno može da deklariše **minimalnu starost gostiju**. Kada je postavljena, svaka unesena godina na rezervaciji za taj lokal mora biti jednaka ili veća od tog ograničenja, povrh toga što je svejedno prikupljena. Ovo omogućava lokalima poput barova i klubova da provode politike o godinama kroz tok rezervacije umjesto da hvataju neusklađenosti na ulazu. Kada minimum nije postavljen, godine se i dalje prikupljaju i čuvaju; samo ne postoji donja granica po polju.

### Kako se pojavljuje u formama lokala

I forma za kreiranje/izmjenu lokala super admina i editor "moj lokal" menadžera izlažu jedno opcionalno polje **minimalna starost gostiju**. Polje prima cio broj između 1 i 120, ili može ostati prazno. Prazno znači da lokal nema starosno ograničenje — godine se i dalje traže od osobe koja rezerviše, samo se primjenjuje gornja granica zdravog razuma (0–120).

### Kako se pojavljuje u formi za rezervaciju

Javna forma za rezervaciju uvijek prikazuje blok "godine" sa jednim numeričkim poljem po gostu. Mijenjanje broja gostiju dodaje ili uklanja polja kako bi se podudaralo. Naslov bloka i pomoćni tekst se prilagođavaju politici lokala: kada lokal ima postavljenu minimalnu starost, naslov glasi "Godine gostiju (minimalna starost: N)" i pomoćna linija objašnjava da svaki gost mora imati najmanje N godina; kada minimum nije postavljen, naslov glasi "Godine gostiju" a pomoćna linija samo traži godine za svakog gosta.

Svako polje za godine je numeričko polje ograničeno na opseg 0–120 samim poljem, tako da se kucanje van opsega sprečava na nivou pretraživača bez eksplicitne poruke o grešci. Prazna polja su obavezna prije slanja. Kada lokal ima minimum, godina ispod ograničenja se ističe crvenom ivicom i porukom po polju koja uključuje stvarni minimum, tako da gost razumije koja vrijednost bi bila prihvaćena. Slanje sa bilo kojim nepopunjenim poljem je blokirano.

Isti blok za godine je dio i menadžer-side forme za "kreiranje rezervacije" u dashboard-u. Menadžerska forma povlači minimum lokala iz `useMyVenue` tako da se ista provjera politike primjenjuje i tu.

Kada se forma pošalje, niz godina se šalje uz ostatak payload-a rezervacije — uvijek, na svakoj rezervaciji.

### Provođenje na strani servera

Frontend validacija je za UX. Backend ponavlja iste provjere prije čuvanja bilo koje rezervacije, i u toku gosta i u toku menadžerski-kreirane rezervacije. API zahtijeva da niz `guestAges` bude prisutan, da se po dužini podudara sa brojem gostiju, i da svaka vrijednost bude u opsegu 0–120. Ako lokal dodatno ima postavljenu minimalnu starost, svaka stavka mora dodatno biti na ili iznad tog minimuma. Bilo koji propust vraća lokalizovani 400; poruka za minimum imenuje stvarni minimum, tako da svako ko pogađa API direktno dobija istu zaštitu kao i forma.

### Skica implementacije

Entitet lokala ima jednu nullable integer kolonu za opcionalnu minimalnu starost, izloženu kroz oba puta upisivanja lokala (admin i menadžer) i uključenu u javni odgovor lokala tako da forma za rezervaciju može da je pročita bez dodatnog zahtjeva. Entitet rezervacije ima nullable kolonu niza za godine. Pošto su godine sada obavezne na svakoj rezervaciji, kolona će uvijek biti popunjena za nove rezervacije; starije rezervacije nastale prije ove promjene mogu i dalje biti `null`, tako da svaki analitički upit treba to da uzme u obzir.

Oba DTO-a za kreiranje rezervacije (`CreateGuestReservationDto` i `CreateReservationDto`) deklarišu `guestAges` kao obavezan niz cijelih brojeva između 0 i 120, dužine između 1 i 50. Reservations servis ima mali helper `validateGuestAges` koji potvrđuje prisutnost, podudaranje dužine sa `numberOfGuests`, i — kada lokal ima postavljen minimum — da nijedna stavka nije ispod njega. Oba endpoint-a za kreiranje rezervacije pozivaju isti helper, tako da menadžerski-kreirane rezervacije podliježu istom pravilu kao i one koje pošalje gost. Poruke o greškama žive u API i18n fajlovima na srpskom i engleskom; poruka "godine su obavezne" je nezavisna od lokala, dok poruka "ispod minimuma" interpolira stvarni minimum tako da tekst ostaje tačan kada se ograničenje lokala promijeni.

## Email obavještenja gostu o rezervaciji

### Šta radi

Kad god lokal potvrdi ili odbije gostovu rezervaciju, gost dobija automatski email o ishodu. Ovo je jedini način da gost sazna rezultat rezervacije van aplikacije, pa je to tvrd zahtjev, a ne nešto opcionalno.

### Kada se email-ovi šalju

- **Email o potvrdi** — šalje se u trenutku kada menadžer ili super admin potvrdi rezervaciju koja je na čekanju. Email obavještava gosta da je rezervacija potvrđena u imenovanom lokalu za izabrani datum i vrijeme, i podsjeća ga da kontaktira lokal direktno ili koristi svoj profil ako treba nešto da promijeni.
- **Email o odbijanju** — šalje se kada menadžer ili super admin odbije rezervaciju koja je na čekanju. Email obavještava gosta da rezervacija nije prihvaćena u imenovanom lokalu za izabrani datum i vrijeme. Ako je osoblje pri odbijanju uključilo pisani razlog, razlog se gostu prikazuje u istaknutom bloku.

Poseban email o otkazivanju je već postojao i nastavlja da radi na isti način; ova funkcionalnost samo dodaje tokove za potvrdu i odbijanje.

### Ko ih prima

Email-ovi se šalju samo gostima koji su rezervisali dok su bili prijavljeni (rezervacija je povezana sa korisničkim nalogom koji ima email). Rezervacije koje menadžer kreira u ime nekoga ko nema Table.ba nalog ne dobijaju email, jer ne postoji email adresa povezana sa rezervacijom.

### Pouzdanost

Ako je email provajder nedostupan ili poziv ne uspije, promjena statusa rezervacije i dalje uspijeva, a neuspjeh se loguje. Slanje email-a nikada ne blokira operaciju. Tekst je lokalizovan na srpskom i engleskom kroz isti i18n tok koji pokreće postojeće email-ove o otkazivanju, pozivnicama i verifikaciji.

### Skica implementacije

Email servis izlaže dvije nove metode koje preslikavaju oblik postojećeg email-a o otkazivanju: jednu za potvrdu i jednu za odbijanje. Svaka učitava svoj subject, body i footer iz API i18n fajlova sa interpolovanim imenom lokala, datumom i vremenom; email o odbijanju takođe uslovno renderuje istaknut blok "razlog" kada osoblje navede razlog. Obje metode hvataju i loguju Resend greške umjesto da bacaju.

Reservations servis ima mali privatni helper koji se pokreće nakon uspješnog čuvanja potvrde ili odbijanja. Provjerava da li je rezervacija povezana sa korisničkim nalogom gosta, učitava tog korisnika, učitava lokal radi imena, i šalje odgovarajući email. Ništa u helper-u ne može da spriječi promjenu statusa — umotan je u tihi try/catch — pa nedostupnost email servisa ne može da blokira menadžera da vodi svoj lokal.

## Podsjetnici menadžera o rezervacijama na čekanju (cron)

### Šta radi

Svake tri sata automatizovani posao provjerava svakog aktivnog menadžera i šalje mu email podsjetnik ako postoje nove rezervacije na čekanju koje još nije obradio. Ako menadžer nema ništa novo, email se ne šalje — tišina je signal da je sve pod kontrolom. Posao je sigurnosna mreža za menadžere koji ne drže dashboard otvoren: nikada neće proći više od tri sata a da im se ne kaže da imaju posao.

### Šta znači "novo"

Rezervacija se računa kao nova za menadžera samo ako je kreirana nakon posljednjeg podsjetnika koji je taj menadžer primio. Prvi podsjetnik ikada poslat menadžeru pokriva sve njegove trenutno rezervacije na čekanju; kasniji podsjetnici pokrivaju samo one koje su stigle nakon prethodnog podsjetnika. Na taj način menadžer koji ignoriše jednu rezervaciju na čekanju ne dobija obavještenje o njoj svake tri sate zauvijek — kada mu je rečeno za nju, ona je njegova odgovornost.

### Ko je uključen

Posao iterira kroz aktivne naloge menadžera koji su povezani sa aktivnim lokalom. Radnici, super admini, gosti, deaktivirani menadžeri i menadžeri bez lokala se preskaču. Sažetak koji endpoint vrati prijavljuje ukupan broj razmotrenih menadžera, koliko ih je dobilo email i koliko je preskočeno (nema email, nema lokala, nema novih na čekanju ili greška tokom obrade).

### Pouzdanost

Svaki menadžer se obrađuje nezavisno unutar try/catch-a. Greška na jednom menadžeru — neispravan email, prolazna greška mail provajdera, lokal koji nedostaje — loguje se i broji kao preskok; nikada ne prekida pokretanje za druge. Polje `lastReservationReminderAt` na korisniku se ažurira tek nakon uspješnog slanja email-a, tako da prolazna nedostupnost mailera znači da će menadžer biti ponovo pokušan u sljedećem pokretanju umjesto tihog gubitka.

### Endpoint

Posao živi na `POST /cron/reservation-reminders`. Endpoint **nije** zaštićen redovnom JWT autentikacijom — zaštićen je jednostavnim guardom sa zajedničkom tajnom koji zahtijeva header `Authorization: Bearer ${CRON_SECRET}`. Bez ispravne tajne endpoint vraća 401. Ako uopšte nema postavljene `CRON_SECRET` env varijable, endpoint odbija svaki zahtjev, tako da zaboravljena konfiguracija ne može slučajno da ga izloži.

### Podešavanje na Vercel-u

Cron se konfiguriše deklarativno u `vercel.json` pod `crons` nizom na vrhu. Raspored je standardna cron sintaksa — `0 */3 * * *` znači "minut 0 svakog trećeg sata" (00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00 UTC).

Da bi ovo radilo nakon deploy-a, vlasnik projekta mora da uradi dva jednokratna koraka u Vercel dashboard-u za ovaj projekat:

1. **Dodati env varijablu `CRON_SECRET`** na Production (i Preview okruženju, ako cron treba tu da se pokreće). Generiši nasumičnu vrijednost — na primjer komandom `openssl rand -hex 32` — i unesi je u "Environment Variables" panel u Vercel-u za API projekat. Ista vrijednost mora postojati i u `apps/api/.env` za lokalno testiranje.
2. **Provjeriti da je cron registrovan** pod "Settings → Cron Jobs" u Vercel dashboard-u nakon sljedećeg deploy-a. Vercel automatski čita `crons` blok iz `vercel.json`; dashboard treba da pokaže jedan unos koji pokazuje na `/cron/reservation-reminders` sa rasporedom od 3 sata. Ako se unos ne pojavi, ponovo deploy-uj.

Vercel automatski dodaje `Authorization: Bearer ${CRON_SECRET}` header kada pokrene posao, tako da guard vidi ispravnu tajnu bez ikakvog klijentskog koda. Da ručno testiraš endpoint sa svoje mašine, pokreni `curl -X POST -H "Authorization: Bearer <tajna>" https://<vaš-api-domen>/cron/reservation-reminders`.

Ako raspored treba da se promijeni, izmijeni `schedule` vrijednost u `vercel.json` i ponovo deploy-uj. Da pauziraš posao, ukloni unos iz `crons` i ponovo deploy-uj.

### Skica implementacije

Novi `CronModule` izlaže jedan endpoint zaštićen prilagođenim `CronAuthGuard`-om koji poredi bearer token sa `CRON_SECRET` env varijablom. Servis učitava aktivne menadžere povezane sa lokalom, pokreće jedan count upit po menadžeru ograničen na `lastReservationReminderAt` tog menadžera, i šalje lokalizovan email "imate N novih rezervacija" kroz postojeći email servis kada je broj veći od nule. Zapis korisnika dobija jednu nullable timestamp kolonu, `lastReservationReminderAt`, koju servis ažurira pri svakom uspješnom slanju. Šablon email-a podsjetnika prati isti obrazac kao i drugi transakcioni email-ovi projekta (verifikacija, pozivnice, otkazivanje rezervacije), sa subject-om, body-jem, dugmetom i footer-om iz i18n-a.

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

## Zaboravljena lozinka / resetovanje lozinke

### Šta radi

Gost koji ne može da se sjeti svoje lozinke može zatražiti resetovanje direktno iz login modala: ispod dugmeta za prijavu nalazi se link "Zaboravili ste lozinku?" koji prebacuje modal na formu sa jednim poljem za email. Slanjem emaila dobija link za resetovanje na svoju adresu. Klikom na link otvara se stranica za novu lozinku gdje bira svježu lozinku, nakon čega se vraća u login modal da se prijavi.

Tok je namjerno otporan na nabrajanje korisnika: bez obzira na to da li nalog za uneseni email postoji ili ne, korisnik vidi isti toast ("Ako nalog sa tom email adresom postoji, poslali smo link za resetovanje lozinke.") tako da napadač ne može da provjerava koje su adrese registrovane.

### Login modal: prebacivanje login ↔ zaboravljena lozinka

Isti modal/drawer koji prikazuje prijavu sada ima dva pogleda — `login` i `forgot` — koja se prebacuju kroz login UI store. Klik na "Zaboravili ste lozinku?" unutar login forme prebacuje modal na forgot-password pogled; naslov, opis, polja i submit dugme se prebacuju na tekst za zaboravljenu lozinku bez zatvaranja modala. Forgot pogled ima samo polje za email, isti narandžasti gradijentni submit i link "Nazad na prijavu" sa lijevom strelicom koji vraća na login pogled. Nakon uspješnog slanja modal se zatvara i korisnik vidi toast u uglu.

### Stranica za resetovanje

Email sadrži link u formi `/auth/reset-password?token=<hex>`. Stranica prikazuje malu karticu koja prati ostatak auth površine: serif naslov, dva polja za lozinku (nova lozinka + potvrda), narandžasti gradijentni submit i isti eye-toggle na svakom polju. Ako URL nema `token` query parametar, stranica prikazuje obavještenje "Link je nevažeći ili je istekao" umjesto forme. Po uspješnom resetovanju korisnik dobija toast, biva navigiran na početnu stranu i login modal se automatski otvara tako da može da se prijavi novom lozinkom u jednom kliku.

### Provođenje na strani servera

API ostaje isti kao i prije: `POST /auth/forgot-password` prima `{ email }`, generiše token za reset koji važi sat vremena, čuva ga na korisniku i šalje email kroz postojeći email servis; ako email ne odgovara nijednom korisniku, endpoint i dalje vraća generičku poruku o uspjehu. `POST /auth/reset-password` prima `{ token, newPassword }`, validira istek tokena, heširaš novu lozinku sa bcrypt-om i čisti kolone reset tokena. Kolone tokena i email šablon postojali su prije ove promjene; samo je web strana nedostajala.

### Skica implementacije

Novi `useForgotPassword` mutation hook poziva `POST /auth/forgot-password` i prikazuje lokalizovani toast po završetku. Novi `useResetPassword` mutation hook poziva `POST /auth/reset-password`, prikazuje toast, navigiraš na `/` i otvara login modal — korisnik je jedan klik od prijave. Login UI store dobija polje `view: 'login' | 'forgot'` plus akcije `showLogin` / `showForgot`; `open()` uvijek resetuje pogled na `'login'` tako da je ponovno otvaranje modala predvidljivo. Nova komponenta `ForgotPasswordForm` živi pored ostalih auth formi i dijeli stil cream-pill polja, narandžasti gradijentni CTA i rječnik "nazad" navigacije korišten kroz auth površinu. Nova `/auth/reset-password` ruta ponovo koristi pristup menadžerske `/auth/set-password` stranice (token iz query-a, nova-lozinka + potvrda forma, pravila jačine lozinke) ali komunicira sa reset endpoint-om umjesto sa set-password endpoint-om, tako da je tok menadžerske invitacije netaknut. Sav tekst živi u postojećem `auth` i18n namespace-u pod `forgot_password_*` i `reset_password_*` ključevima, na srpskom latiničnom i engleskom.
