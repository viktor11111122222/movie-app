# ⚡ Brze Komande - MovieHub React Native

## 🚀 Development

### Pokretanje aplikacije:
```bash
# Terminal 1 - Metro Bundler
cd /Users/vica/Desktop/movie-app/MovieHubRN
npm start

# Terminal 2 - Android
npm run android

# Terminal 3 - Backend Server
cd /Users/vica/Desktop/movie-app
node server.js
```

### Čišćenje cache-a:
```bash
# Metro bundler cache
npm start -- --reset-cache

# Android build cache
cd android && ./gradlew clean && cd ..

# Node modules
rm -rf node_modules && npm install
```

---

## 📱 Testiranje

### Logs:
```bash
# Android logs
npx react-native log-android

# iOS logs (ako dodaš iOS)
npx react-native log-ios
```

### Povezivanje telefona:
```bash
# Proveri telefon
adb devices

# Restart ADB ako ne vidi telefon
adb kill-server
adb start-server
```

---

## 🏗️ Build

### Debug APK (za testiranje):
```bash
cd android
./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK:
```bash
cd android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

### Release AAB (za Google Play):
```bash
cd android
./gradlew bundleRelease
# AAB: android/app/build/outputs/bundle/release/app-release.aab
```

### Instalacija APK na telefon:
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## 🔑 Signing Key

### Generiši novi keystore:
```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### Proveri keystore:
```bash
keytool -list -v -keystore android/app/my-upload-key.keystore -alias my-key-alias
```

---

## 🌐 Backend Server

### Lokalno:
```bash
cd /Users/vica/Desktop/movie-app
node server.js
# Server na: http://localhost:8080
```

### Proveri svoju IP:
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Koristi tu IP u src/services/api.js
```

---

## 🎨 Customizacija

### Promeni boju:
```javascript
// src/utils/theme.js
export const COLORS = {
  primary: '#E50914', // ← Promeni ovo
  // ...
};
```

### Promeni API URL:
```javascript
// src/services/api.js
const API_BASE_URL = 'http://TVOJA-IP:8080'; // ← Ovde
```

### Promeni package name:
```gradle
// android/app/build.gradle
applicationId "com.tvoje_ime.moviehub" // ← Ovde
```

---

## 🔧 Debugging

### React Native Debugger:
```bash
# Otvori menu na telefonu:
# - Shake telefon ili
# - adb shell input keyevent 82

# Klikni "Debug"
```

### Flipper (advanced debugging):
```bash
# Instaliraj Flipper: https://fbflipper.com/
# Automatski se konektuje na app
```

---

## 📦 Dependencije

### Dodaj novu biblioteku:
```bash
npm install ime-biblioteke
cd android && ./gradlew clean && cd ..
npm run android
```

### Update dependencija:
```bash
npm update
```

---

## 🐛 Problem Solving

### App se ne pokreće:
```bash
# 1. Čisti sve
cd android && ./gradlew clean && cd ..
rm -rf node_modules
npm install

# 2. Pokreni ponovo
npm start -- --reset-cache
npm run android
```

### "Unable to load script":
```bash
# Resetuj Metro bundler
npm start -- --reset-cache
```

### Build error:
```bash
# Clean i rebuild
cd android
./gradlew clean
./gradlew assembleRelease --stacktrace
```

---

## 📊 Testiranje Performansi

### Bundle size:
```bash
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res
```

### APK size:
```bash
du -h android/app/build/outputs/apk/release/app-release.apk
```

---

## 🚀 Deploy Backend

### Railway:
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

### Heroku:
```bash
heroku create
git push heroku main
```

---

## 📱 Google Play Console

### Upload nova verzija:
1. Povećaj `versionCode` u `android/app/build.gradle`
2. Build AAB: `./gradlew bundleRelease`
3. Upload na Play Console
4. Submit za review

---

## 💾 Backup

### Backup keystore-a:
```bash
cp android/app/my-upload-key.keystore ~/Desktop/moviehub-keystore-backup.keystore
# ČUVAJ OVO NA SIGURNOM MESTU!
```

---

## 🎯 Korisni Linkovi

- React Native Docs: https://reactnative.dev
- Google Play Console: https://play.google.com/console
- TMDB API: https://developers.themoviedb.org
- Icon Generator: https://romannurik.github.io/AndroidAssetStudio/
- Railway: https://railway.app

---

**Sačuvaj ovaj fajl za brzi pristup komandama! 💪**
