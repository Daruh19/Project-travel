import { mekanlar } from './veri.js';

export function istatistikGuncelle() {
  const toplamMekanSayisi = document.querySelector('#toplamMekanSayisi');
  const ortalamaPuanSayisi = document.querySelector('#ortalamaPuanSayisi');

  if (!toplamMekanSayisi || !ortalamaPuanSayisi) return;

  toplamMekanSayisi.textContent = mekanlar.length;

  if (mekanlar.length === 0) {
    ortalamaPuanSayisi.textContent = "0.0";
    return;
  }

  const toplamPuan = mekanlar.reduce((akumilator, mekan) => akumilator + mekan.puan, 0);
  const ortalamaPuan = toplamPuan / mekanlar.length;
  ortalamaPuanSayisi.textContent = ortalamaPuan.toFixed(1);
}