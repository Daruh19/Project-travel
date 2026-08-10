import { mekanlar } from './veri.js';

export function istatistikGuncelle(liste) {
  const istatistikAlani = document.querySelector('.istatistik-paneli');
  if (!istatistikAlani) return;

  if (liste.length === 0) {
    istatistikAlani.innerHTML = "<p>Gösterilebilecek istatistik yok.</p>";
    return;
  }

  // Farklı şehir sayılarını bulalım (Set kullanarak benzersiz şehirleri süzüyoruz)
  const benzersizSehirler = new Set(liste.map(m => m.sehir));
  
  // Ortalama puan hesabı (reduce ile)
  const toplamPuan = liste.reduce((toplam, m) => toplam + m.puan, 0);
  const ortalamaPuan = (toplamPuan / liste.length).toFixed(1);

  istatistikAlani.innerHTML = `
    <div style="background: #f4f4f4; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
      📊 <strong>Özet:</strong> Toplam <strong>${liste.length}</strong> mekan | 
      📍 <strong>${benzersizSehirler.size}</strong> farklı şehir | 
      ⭐ Ortalama Puan: <strong>${ortalamaPuan}</strong>
    </div>
  `;
}