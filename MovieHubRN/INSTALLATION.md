# 📱 MovieHub React Native - Uputstvo za Instalaciju

## 🎯 Kompletno Uputstvo za Google Play

### Šta si dobio:

Tvoja web aplikacija je sada potpuno konvertovana u **React Native aplikaciju** koja radi isto kao web verzija ali je spremna za **Google Play Store**!

---

## 📋 Preduslov (Šta ti treba):

### 1. Instalacija Softvera

**Node.js:**
```bash
# Proveri da li već imaš:
node --version  # Treba 16+

# Ako nemaš, preuzmi sa: https://nodejs.org/
```

**Android Studio:**
- Preuzmi: https://developer.android.com/studio
- Instaliraj Android SDK (API 33)
- Podesi ANDROID_HOME environment variable

**JDK 11:**
```bash
# macOS (sa Homebrew):
brew install openjdk@11

# Ili preuzmi sa: https://adoptium.net/
```

**React Native CLI:**
```bash
npm install -g react-native-cli
```

---

## 🚀 Korak po Korak Instalacija

### Korak 1: Instaliraj Dependencije

```bash
cd /Users/vica/Desktop/movie-app/MovieHubRN
npm install
```

Ovo instalira sve potrebne pakete (~500MB, može potrajati 5-10 minuta).

---

### Korak 2: Konfiguriši Backend Server

**NAJVAŽNIJE:** Moraš promeniti API URL!

Otvori fajl: `src/services/api.js`

```javascript
// Promeni ovu liniju:
const API_BASE_URL = 'http://192.168.1.100:8080';

// SA TVOJOM IP ADRESOM ili deployed serverom
```

#### Kako naći svoju IP adresu:

**macOS:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Rezultat:** `inet 192.168.1.123` ← ovo je tvoja IP

Onda stavi: `http://192.168.1.123:8080`

---

### Korak 3: Pokreni Backend Server

U drugom terminalu:

```bash
cd /Users/vica/Desktop/movie-app
node server.js
```

Server mora biti pokrenut dok testiraš aplikaciju!

---

### Korak 4: Pokreni React Native Aplikaciju

**Terminal 1 - Metro Bundler:**
```bash
cd /Users/vica/Desktop/movie-app/MovieHubRN
npm start
```

**Terminal 2 - Android App:**
```bash
npm run android
```

Aplikacija će se automatski instalirati na telefon/emulator!

---

## 📱 Testiranje na Pravom Telefonu

### Android Telefon:

1. **Omogući Developer Options:**
   - Settings → About phone
   - Tapni 7x na "Build number"
   - Vrati se nazad → Developer options
   - Upali "USB debugging"

2. **Poveži USB kabel**

3. **Proveri vezu:**
```bash
adb devices
```

Trebalo bi da vidiš svoj telefon!

4. **Pokreni app:**
```bash
npm run android
```

---

## 🏗️ Build za Google Play

### Korak 1: Generiši Signing Key

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**Pitaće te:**
- Password: (Zapamti ovo!)
- Your Name: Tvoje ime
- Organization: Tvoja kompanija
- City, Country, itd.

**VAŽNO:** Sačuvaj taj keystore fajl i lozinku negde sigurno! Ako ga izgubiš, ne možeš update-ovati app na Google Play!

---

### Korak 2: Konfiguriši Gradle

Otvori: `android/gradle.properties`

Zameni sa tvojim podacima:

```properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=tvoja-lozinka-ovde
MYAPP_UPLOAD_KEY_PASSWORD=tvoja-lozinka-ovde
```

---

### Korak 3: Build APK (za testiranje)

```bash
cd android
./gradlew assembleRelease
```

APK će biti u:
```
android/app/build/outputs/apk/release/app-release.apk
```

Možeš instalirati na telefon:
```bash
adb install app-release.apk
```

---

### Korak 4: Build AAB (za Google Play)

```bash
cd android
./gradlew bundleRelease
```

AAB fajl će biti u:
```
android/app/build/outputs/bundle/release/app-release.aab
```

**Ovaj AAB fajl upload-uješ na Google Play Console!**

---

## 🎨 Customizacija Pre Publishovanja

### 1. Promeni Package Name (OBAVEZNO!)

**Fajl:** `android/app/build.gradle`

Promeni:
```gradle
namespace "com.moviehubrn"
defaultConfig {
    applicationId "com.moviehubrn"  // ← Promeni ovo!
```

U nešto jedinstveno:
```gradle
namespace "com.tvoje_ime.moviehub"
defaultConfig {
    applicationId "com.tvoje_ime.moviehub"
```

Takođe promeni u:
- `android/app/src/main/java/com/moviehubrn/` → preimenuj folder
- `MainActivity.java` → promeni `package com.moviehubrn;`
- `MainApplication.java` → promeni `package com.moviehubrn;`

---

### 2. Dodaj Ikonu Aplikacije

Koristi alat kao što je: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html

Generiši ikone i stavi ih u:
```
android/app/src/main/res/mipmap-hdpi/ic_launcher.png
android/app/src/main/res/mipmap-mdpi/ic_launcher.png
android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
```

---

### 3. Promeni Ime Aplikacije

**Fajl:** `android/app/src/main/res/values/strings.xml`

```xml
<string name="app_name">Tvoje Ime Aplikacije</string>
```

---

## 🌐 Deploy Backend Servera

Aplikacija treba server! Opcije:

### 1. **Railway.app** (Preporuka - Besplatno)

```bash
# Instaliraj Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
cd /Users/vica/Desktop/movie-app
railway init
railway up
```

Dobijaš URL kao: `https://tvoj-app.up.railway.app`

Promeni u `src/services/api.js`:
```javascript
const API_BASE_URL = 'https://tvoj-app.up.railway.app';
```

### 2. **Heroku**

```bash
heroku create tvoj-moviehub-app
git push heroku main
```

### 3. **DigitalOcean / VPS**

Iznajmi server i deploy-uj Node.js aplikaciju.

---

## 📤 Upload na Google Play

### Korak 1: Kreiraj Google Play Console Account

- Idi na: https://play.google.com/console
- Plati $25 (jednokratno)
- Registruj se kao developer

### Korak 2: Kreiraj Novu Aplikaciju

- Klikni "Create app"
- Unesi naziv, jezik, kategoriju
- Popuni sve podatke:
  - App description
  - Screenshots (3-8 screenshots)
  - Feature graphic (1024x500)
  - App icon
  - Privacy policy URL

### Korak 3: Upload AAB

- Production → Create new release
- Upload `app-release.aab`
- Popuni release notes
- Submit for review

**Review traje 1-7 dana!**

---

## 🐛 Česti Problemi i Rešenja

### Problem: "Unable to connect to server"
**Rešenje:** Proveri da li je backend pokrenut i da li je IP adresa ispravna.

### Problem: "BUILD FAILED"
**Rešenje:** 
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

### Problem: "App keeps crashing"
**Rešenje:** Proveri logs:
```bash
npx react-native log-android
```

### Problem: "Module not found"
**Rešenje:**
```bash
rm -rf node_modules
npm install
```

---

## 📊 Statistika Projekta

- **Fajlova:** 30+
- **Linije koda:** 3000+
- **Komponente:** 10+
- **Ekrani:** 7
- **API servisa:** 3

---

## ✅ Checklist Pre Publishovanja

- [ ] Promeni package name
- [ ] Dodaj app ikonu
- [ ] Promeni ime aplikacije
- [ ] Deploy backend server
- [ ] Testiraj na raznim telefonima
- [ ] Generiši signing key
- [ ] Build release AAB
- [ ] Napravi screenshots
- [ ] Napravi privacy policy
- [ ] Upload na Google Play Console
- [ ] Submit za review

---

## 🎉 Gotovo!

Tvoja aplikacija je spremna za Google Play! 

**Kontaktiraj me ako imaš pitanja ili problema.**

---

**Srećno sa app-om! 🚀📱**
