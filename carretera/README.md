# La carretera es mía · iPhone

Envoltorio de Capacitor del juego `src/index.html` para publicarlo en la App Store.

- `npm run build` crea `www/` con three.js y las fuentes dentro, para que funcione sin conexión.
- `npx cap sync ios` copia el juego al proyecto de Xcode (`ios/App`).
- Codemagic compila y sube a TestFlight con el flujo `ios-release` de `codemagic.yaml`.
- Textos de la ficha, cuestionarios y capturas: `store/`.

Para cambiar el juego, sustituye `src/index.html` por la versión nueva y sube el cambio.
La versión de iPhone no lleva anuncios.
