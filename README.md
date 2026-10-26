# La carretera es mía — app Android

Juego web (src/game.html) empaquetado con Capacitor (es.fakeado.carretera), con anuncios AdMob.

- `npm run build` genera `www/` con el motor 3D y las tipografías locales.
- Codemagic compila el .aab con el flujo `carretera-aab` (rama `carretera`).
- Los IDs de AdMob están en `src/app.js` (ahora de prueba) y en `android/app/src/main/AndroidManifest.xml`.
