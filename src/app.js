// Puente con Android: anuncios (AdMob), consentimiento (UMP), botón Atrás y barra de estado.
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { AdMob, BannerAdPosition, BannerAdSize, AdmobConsentStatus } from '@capacitor-community/admob';

// IDs de AdMob. Mientras no haya cuenta de AdMob propia se usan los de PRUEBA de Google.
const ADS = {
  testing: true,
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
};
let ready = false, overs = 0, interReady = false, bannerOn = false;

async function prepInterstitial() {
  try { await AdMob.prepareInterstitial({ adId: ADS.interstitial, isTesting: ADS.testing }); interReady = true; } catch (e) { interReady = false; }
}
function addPrivacyButton() {
  const host = document.querySelector('.actions .left'); if (!host || document.getElementById('privBtn')) return;
  const b = document.createElement('button'); b.className = 'btn ghost'; b.id = 'privBtn'; b.textContent = 'Privacidad';
  b.onclick = () => AdMob.showPrivacyOptionsForm().catch(() => {}); host.appendChild(b);
}
async function init() {
  if (!Capacitor.isNativePlatform()) return;
  try { await StatusBar.hide(); } catch (e) {}
  setTimeout(() => SplashScreen.hide().catch(() => {}), 300);
  App.addListener('backButton', () => dispatchEvent(new Event('lcem:back')));
  addEventListener('lcem:exit', () => App.exitApp());
  App.addListener('pause', () => dispatchEvent(new Event('lcem:back-pause')));
  try {
    await AdMob.initialize({ initializeForTesting: ADS.testing });
    let ci = await AdMob.requestConsentInfo();
    if (ci.isConsentFormAvailable && ci.status === AdmobConsentStatus.REQUIRED) ci = await AdMob.showConsentForm();
    if (ci.privacyOptionsRequirementStatus === 'REQUIRED') addPrivacyButton();
    ready = ci.canRequestAds !== false;
    if (ready) prepInterstitial();
  } catch (e) { console.warn('AdMob', e); }
}
addEventListener('lcem:over', async () => {
  if (!ready) return; overs++;
  try { await AdMob.showBanner({ adId: ADS.banner, adSize: BannerAdSize.ADAPTIVE_BANNER, position: BannerAdPosition.BOTTOM_CENTER, margin: 0, isTesting: ADS.testing }); bannerOn = true; } catch (e) {}
  if (overs % 3 === 0 && interReady) setTimeout(async () => { interReady = false; try { await AdMob.showInterstitial(); } catch (e) {} prepInterstitial(); }, 1200);
});
for (const ev of ['lcem:start', 'lcem:menu']) addEventListener(ev, () => { if (bannerOn) { bannerOn = false; AdMob.removeBanner().catch(() => {}); } });
init();
