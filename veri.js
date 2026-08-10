export const mekanlar = JSON.parse(localStorage.getItem('benimMekanlarim')) || [
  { isim: "Anıtkabir", sehir: "Ankara", kategori: "Tarihi", puan: 4.9, favori: false },
  { isim: "Kapadokya", sehir: "Nevşehir", kategori: "Doğa", puan: 4.8, favori: true },
  { isim: "Ölüdeniz", sehir: "Muğla", kategori: "Deniz", puan: 4.7, favori: false },
  { isim: "Sümela Manastırı", sehir: "Trabzon", kategori: "Tarihi", puan: 4.6, favori: false }
];

export function hafizayaKaydet() {
  localStorage.setItem('benimMekanlarim', JSON.stringify(mekanlar));
}