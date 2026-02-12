# 📁 Vodič Kroz Fajlove - MovieHub RN

## 🎯 GDE DA POČNEŠ?

```
┌────────────────────────────────────┐
│   🚀 START_HERE.md                 │  ← POČNI OVDE!
│   Prva stvar koja treba da pročitaš│
└────────────────────────────────────┘
```

---

## 📚 DOKUMENTACIJA (po redosledu)

### 1. 🟢 [START_HERE.md](START_HERE.md)
**PRVO OTVORI OVAJ FAJL!**
- Brzi uvod
- 3 koraka do pokretanja
- Pregled svega što imaš

### 2. 🔵 [INSTALLATION.md](INSTALLATION.md)
**Kompletno uputstvo:**
- Instalacija softvera
- Konfiguracija projekta
- Testiranje
- Build za Google Play
- Deploy na Play Store

### 3. 🟡 [QUICK_COMMANDS.md](QUICK_COMMANDS.md)
**Sve komande:**
- Development
- Building
- Debugging
- Customizacija

### 4. 🟠 [CHECKLIST.md](CHECKLIST.md)
**Pre-release checklist:**
- Pre pokretanja
- Pre testiranja
- Pre build-a
- Pre upload-a

### 5. 🟣 [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
**Tehnički pregled:**
- Struktura projekta
- Tehnologije
- API integracija
- Performance

### 6. 📖 [README.md](README.md)
**Brzi pregled:**
- Karakteristike
- Instalacija (kratko)
- Build komande

---

## 🗂️ STRUKTURA FOLDERA

```
MovieHubRN/
│
├── 📄 START_HERE.md              ← Počni ovde!
├── 📄 INSTALLATION.md            ← Detaljna uputstva
├── 📄 QUICK_COMMANDS.md          ← Brze komande
├── 📄 CHECKLIST.md               ← Pre-release checklist
├── 📄 PROJECT_OVERVIEW.md        ← Tehnički pregled
├── 📄 README.md                  ← Brzi pregled
├── 📄 FILE_GUIDE.md              ← Ovaj fajl
│
├── 📱 App.js                     ← Root komponenta
├── 📱 index.js                   ← Entry point
│
├── ⚙️ package.json               ← Dependencije
├── ⚙️ babel.config.js            ← Babel config
├── ⚙️ metro.config.js            ← Metro bundler config
├── ⚙️ app.json                   ← App metadata
├── ⚙️ .gitignore                 ← Git ignore
│
├── 📂 src/                       ← Izvorni kod
│   ├── 📂 components/            ← UI komponente
│   │   ├── MovieCard.js          ← Kartica filma
│   │   ├── MovieRow.js           ← Red filmova
│   │   └── HeroSection.js        ← Hero sekcija
│   │
│   ├── 📂 screens/               ← Glavni ekrani
│   │   ├── LoginScreen.js        ← Login ekran
│   │   ├── RegisterScreen.js     ← Registracija
│   │   ├── HomeScreen.js         ← Home ekran
│   │   ├── SearchScreen.js       ← Pretraga
│   │   ├── WishlistScreen.js     ← Wishlist
│   │   ├── ProfileScreen.js      ← Profil
│   │   └── MovieDetailsScreen.js ← Detalji filma
│   │
│   ├── 📂 services/              ← API servisi
│   │   ├── api.js                ← Backend API ⚠️ KONFIGURIŠI OVO!
│   │   └── tmdb.js               ← TMDB API
│   │
│   ├── 📂 context/               ← State management
│   │   ├── AuthContext.js        ← Autentikacija
│   │   └── WishlistContext.js    ← Wishlist state
│   │
│   ├── 📂 navigation/            ← Navigacija
│   │   └── AppNavigator.js       ← Stack & Tab navigation
│   │
│   └── 📂 utils/                 ← Helper funkcije
│       ├── theme.js              ← Boje, spacing, itd.
│       └── helpers.js            ← Utility funkcije
│
├── 📂 android/                   ← Android konfiguracija
│   ├── 📄 build.gradle           ← Root build config
│   ├── 📄 settings.gradle        ← Project settings
│   ├── 📄 gradle.properties      ← Gradle properties
│   │
│   └── 📂 app/
│       ├── 📄 build.gradle       ← App build config
│       ├── 📄 proguard-rules.pro ← ProGuard rules
│       │
│       └── 📂 src/main/
│           ├── AndroidManifest.xml        ← App manifest
│           ├── 📂 java/com/moviehubrn/
│           │   ├── MainActivity.java      ← Main activity
│           │   └── MainApplication.java   ← App entry
│           │
│           └── 📂 res/
│               ├── 📂 mipmap-*/           ← App icons
│               └── 📂 values/
│                   └── strings.xml        ← App name
│
└── 📂 assets/                    ← Static assets (slike, fonti)
```

---

## 🔧 KOJE FAJLOVE TREBAŠ MENJATI?

### ⚠️ OBAVEZNO PROMENI:

1. **`src/services/api.js`** - Linija 6
   ```javascript
   const API_BASE_URL = 'http://TVOJA-IP:8080';
   ```

2. **`android/app/build.gradle`** - Linije 15-16
   ```gradle
   namespace "com.tvoje_ime.moviehub"
   applicationId "com.tvoje_ime.moviehub"
   ```

3. **`android/app/src/main/res/values/strings.xml`** - Linija 3
   ```xml
   <string name="app_name">Tvoje Ime</string>
   ```

### 🟡 PREPORUČENO PROMENI:

4. **`android/gradle.properties`** - Linije 1-4
   ```
   MYAPP_UPLOAD_STORE_PASSWORD=tvoja-lozinka
   MYAPP_UPLOAD_KEY_PASSWORD=tvoja-lozinka
   ```

5. **App ikone** - Dodaj u:
   ```
   android/app/src/main/res/mipmap-*/ic_launcher.png
   ```

### 🟢 OPCIONO PROMENI:

6. **`src/utils/theme.js`** - Promeni boje
7. **`App.js`** - Dodaj dodatne feature-e
8. **Bilo koji screen** - Customizuj UI

---

## 📝 FAJLOVI KOJE NE TREBAŠ DIRATI:

❌ **Ne menjaj:**
- `index.js` - Entry point
- `metro.config.js` - Metro config
- `babel.config.js` - Babel config
- `android/gradle/wrapper/*` - Gradle wrapper
- `MainActivity.java` - Main activity (osim package name)
- `MainApplication.java` - App entry (osim package name)

---

## 🔍 KAKO NAĆI NEŠTO U PROJEKTU?

### Tražiš komponentu?
👉 Gledaj u `src/components/`

### Tražiš ekran?
👉 Gledaj u `src/screens/`

### Tražiš API poziv?
👉 Gledaj u `src/services/`

### Tražiš boje/stil?
👉 Gledaj u `src/utils/theme.js`

### Tražiš navigaciju?
👉 Gledaj u `src/navigation/AppNavigator.js`

### Tražiš Android config?
👉 Gledaj u `android/app/build.gradle`

### Tražiš komandu?
👉 Gledaj u `QUICK_COMMANDS.md`

---

## 📊 FAJLOVI PO VELIČINI:

```
Najveći fajlovi (po važnosti):

1. src/screens/*.js      ~300-400 linija svaki
2. src/services/api.js   ~150 linija
3. App.js                ~100 linija
4. android/app/build.gradle  ~80 linija
5. src/context/*.js      ~100 linija svaki
```

---

## 🎯 WORKFLOW: GDE ŠTA?

### Za Development:
1. **Pokreni app** → `npm start` + `npm run android`
2. **Izmeni kod** → `src/` folder
3. **Vidi promene** → Auto-reload u app-u

### Za Customizaciju:
1. **Promeni boje** → `src/utils/theme.js`
2. **Promeni ikonu** → `android/app/src/main/res/mipmap-*/`
3. **Promeni ime** → `strings.xml`

### Za Build:
1. **Konfiguriši** → `android/gradle.properties`
2. **Build** → `./gradlew bundleRelease`
3. **Pronađi AAB** → `android/app/build/outputs/bundle/release/`

---

## 🗺️ MAPA PROJEKTA (Vizuelno)

```
START_HERE.md
    ↓
    │
    ├──→ INSTALLATION.md ──→ npm install
    │                     └──→ Konfiguriši API
    │                     └──→ npm run android
    │
    ├──→ src/services/api.js ⚠️ KONFIGURIŠI OVO!
    │
    ├──→ src/
    │    ├── components/ ──→ MovieCard, MovieRow, Hero
    │    ├── screens/ ──→ Home, Search, Wishlist, Profile
    │    ├── services/ ──→ API calls
    │    ├── context/ ──→ Auth, Wishlist state
    │    └── navigation/ ──→ Stack & Tab nav
    │
    ├──→ android/
    │    ├── build.gradle
    │    ├── gradle.properties ⚠️ Keystore passwords
    │    └── app/
    │         ├── build.gradle ⚠️ Package name
    │         └── src/main/
    │              ├── AndroidManifest.xml
    │              └── res/
    │                   ├── mipmap-*/ ⚠️ App icons
    │                   └── values/strings.xml ⚠️ App name
    │
    └──→ QUICK_COMMANDS.md ──→ Sve komande
         ↓
    CHECKLIST.md ──→ Pre-release checklist
         ↓
    BUILD & UPLOAD na Google Play! 🚀
```

---

## 🎓 LEARNING PATH:

### Dan 1: Setup & Razumevanje
- [ ] Pročitaj `START_HERE.md`
- [ ] Pročitaj `INSTALLATION.md`
- [ ] Instaliraj sve (`npm install`)
- [ ] Konfiguriši API URL
- [ ] Pokreni app (`npm run android`)

### Dan 2: Testiranje & Customizacija
- [ ] Testiraj sve funkcionalnosti
- [ ] Promeni boje (opciono)
- [ ] Promeni ikonu
- [ ] Promeni package name
- [ ] Testiraj ponovo

### Dan 3: Build & Deploy Backend
- [ ] Deploy backend na Railway/Heroku
- [ ] Promeni API URL na production
- [ ] Generiši keystore
- [ ] Test build (`assembleRelease`)

### Dan 4-5: Google Play
- [ ] Napravi Play Console account
- [ ] Popuni store listing
- [ ] Build AAB (`bundleRelease`)
- [ ] Upload & submit

---

## 📞 QUICK HELP:

### "Gde je fajl X?"
👉 Koristi `Ctrl+P` (ili `Cmd+P`) u VS Code

### "Kako da nađem funkciju?"
👉 Koristi `Ctrl+F` (ili `Cmd+F`) za pretragu

### "Gde je naredba?"
👉 `QUICK_COMMANDS.md`

### "Šta treba da uradim pre build-a?"
👉 `CHECKLIST.md`

---

## ✨ ZAVRŠNA REKAPITULACIJA:

```
📄 Dokumentacija (čitaj po redosledu):
   1. START_HERE.md         ← Počni ovde
   2. INSTALLATION.md       ← Detaljno uputstvo
   3. QUICK_COMMANDS.md     ← Sve komande
   4. CHECKLIST.md          ← Pre-release
   5. PROJECT_OVERVIEW.md   ← Tehnički detalji

📱 Kod:
   • src/ - Sav izvorni kod
   • android/ - Android konfiguracija
   • App.js - Root komponenta

⚙️ Konfiguriši (OBAVEZNO):
   • src/services/api.js - API URL
   • android/app/build.gradle - Package name
   • strings.xml - App name
   • mipmap-*/ - App icons

🚀 Pokreni:
   • npm install
   • npm run android
   • node server.js (u drugom terminalu)
```

---

## 🎉 GOTOVO!

**Sada znaš gde je sve u projektu!** 📁

**Sledeći korak:** Otvori `START_HERE.md` i počni sa instalacijom! 🚀

---

**Srećno! 💪**
