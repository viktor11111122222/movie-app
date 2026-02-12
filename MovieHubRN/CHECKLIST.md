# ✅ Checklist - MovieHub React Native

Pre nego što pokreneš ili publish-uješ aplikaciju, proveri sve stavke:

---

## 📋 Pre Pokretanja

### Instalacija
- [ ] Node.js instaliran (verzija 16+)
- [ ] React Native CLI instaliran
- [ ] Android Studio instaliran
- [ ] JDK 11 instaliran
- [ ] ANDROID_HOME environment variable podešen

### Projekat
- [ ] `npm install` uspešno završen
- [ ] Nema error-a u konzoli
- [ ] Backend server pokrenut (`node server.js`)

### Konfiguracija
- [ ] IP adresa promenjena u `src/services/api.js`
- [ ] Backend server dostupan sa te IP adrese
- [ ] Telefon/emulator na istoj WiFi mreži

---

## 🧪 Pre Testiranja

### Android Setup
- [ ] USB debugging omogućen na telefonu
- [ ] Telefon povezan (`adb devices` pokazuje uređaj)
- [ ] Developer mode aktivan na telefonu

### App Test
- [ ] Login/Register radi
- [ ] Filmovi se učitavaju
- [ ] Pretraga radi
- [ ] Wishlist add/remove radi
- [ ] Movie Details prikazuje informacije
- [ ] Profile update radi
- [ ] Navigacija između ekrana radi

---

## 🏗️ Pre Build-a

### Customizacija
- [ ] Package name promenjen (nije više `com.moviehubrn`)
- [ ] App name promenjen u `strings.xml`
- [ ] App ikona dodata u `mipmap` foldere
- [ ] Splash screen (opciono)
- [ ] Boje prilagođene (opciono)

### Backend
- [ ] Backend deployed online (Railway, Heroku, itd.)
- [ ] API URL promenjen u `src/services/api.js`
- [ ] Backend dostupan sa interneta
- [ ] TMDB API key validan

---

## 🔐 Pre Release Build-a

### Signing
- [ ] Keystore generisan
- [ ] Keystore backup sačuvan na sigurnom mestu
- [ ] `gradle.properties` konfigurisano sa keystore podacima
- [ ] Lozinka za keystore zapisana i sačuvana

### Build Configuration
- [ ] `versionCode` povećan u `build.gradle`
- [ ] `versionName` ažuriran
- [ ] ProGuard/R8 omogućen
- [ ] Testiran release build na telefonu

### Security
- [ ] Debug logs uklonjeni
- [ ] Sensitive podaci nisu hardcoded
- [ ] API keys zaštićeni
- [ ] HTTPS korišćen za backend

---

## 📤 Pre Google Play Upload-a

### Google Play Console
- [ ] Developer account kreiran ($25 plaćeno)
- [ ] App kreirana u konzoli
- [ ] App name jedinstven i dostupan

### Store Listing
- [ ] App opis napisan (kratak i dugačak)
- [ ] Screenshots pripremljeni (min 2, preporuka 8)
- [ ] Feature graphic kreiran (1024x500)
- [ ] Promo video (opciono)
- [ ] App ikona (512x512)
- [ ] App kategorija izabrana

### Legal
- [ ] Privacy Policy URL dodat
- [ ] Content rating popunjen
- [ ] Target audience definisan

### Build
- [ ] AAB fajl generisan (`bundleRelease`)
- [ ] AAB testiran pre upload-a
- [ ] Release notes napisani

---

## 🚀 Pre Submit-a za Review

### Testiranje
- [ ] Testiran na minimum 3 različita uređaja
- [ ] Testiran sa sporim internetom
- [ ] Testiran bez interneta (error handling)
- [ ] Sve funkcionalnosti rade kako treba
- [ ] Nema crasheva

### Compliance
- [ ] GDPR compliance (ako je relevantno)
- [ ] Age restrictions pravilno postavljene
- [ ] Ads disclosure (ako ima reklama)
- [ ] In-app purchases (ako ima)

### Final Check
- [ ] Backend server stabilan i online 24/7
- [ ] Monitoring postavljen (opciono)
- [ ] Support email dodat u store listing
- [ ] FAQ/Help section u app (opciono)

---

## 📊 Nakon Upload-a

### Monitoring
- [ ] Google Play Console: proveravaj status review-a
- [ ] Error reports: proveri crashlytics
- [ ] User reviews: odgovaraj na komentare
- [ ] Analytics: prati installs i retention

### Updates
- [ ] Plan za bugfix releases
- [ ] Plan za feature updates
- [ ] Versioning strategija
- [ ] Beta testing grupa (opciono)

---

## 🎯 Scorecard

**Minimalno potrebno za upload:**
- Osnovni setup ✅
- Build uspešan ✅
- Keystore kreiran ✅
- Store listing kompletan ✅
- Privacy policy ✅

**Za kvalitetan launch:**
- Sve gore + testiranje na više uređaja
- Professional screenshots
- Promo materijali
- Beta testing period

---

## ⚠️ Kritične Stavke (NE PROPUSTI!)

1. **BACKUP KEYSTORE-a** - Ako ga izgubiš, ne možeš update-ovati app!
2. **Jedinstveno Package Name** - Ne koristi `com.moviehubrn`
3. **Backend Online 24/7** - Aplikacija bez backend-a neće raditi
4. **Privacy Policy** - Obavezan za Google Play
5. **Testiranje** - Testiraj sve pre release-a!

---

## 📝 Dodatne Napomene

- Review proces traje 1-7 dana
- Google može zatražiti dodatne informacije
- Možeš update-ovati app bilo kada nakon odobrenja
- Beta testing može ubrzati proces

---

**Kada označiš SVE ✅, spreman si za Google Play! 🚀**

---

## 🆘 Pomoć

Ako imaš problema sa nekom stavkom:
1. Proveri INSTALLATION.md za detalje
2. Proveri QUICK_COMMANDS.md za komande
3. Google search za specifične error-e
4. React Native dokumentacija
5. Stack Overflow

---

**Srećno! 🎉**
