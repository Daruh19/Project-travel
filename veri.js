export const mekanlar = JSON.parse(localStorage.getItem('benimMekanlarim')) || [
  { 
    isim: "Anıtkabir", 
    sehir: "Ankara", 
    aramaTerimi: "Anitkabir",
    kategori: "Tarihi", 
    puan: 5.0, 
    favori: true,
    resim: "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?auto=format&fit=crop&w=400&q=80",
    aciklama: "Mustafa Kemal Atatürk'ün anıt mezarı ve Anıtkabir Müzesi.",
    hava: null
  },
  { 
    isim: "Ölüdeniz", 
    sehir: "Muğla", 
    aramaTerimi: "Oludeniz",
    kategori: "Deniz", 
    puan: 4.9, 
    favori: false,
    resim: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80",
    aciklama: "Eşsiz turkuaz denizi ve Babadağ'dan yapılan yamaç paraşütü keyfi.",
    hava: null
  },
  { 
    isim: "Kapadokya", 
    sehir: "Nevşehir", 
    aramaTerimi: "Cappadocia ",
    kategori: "Doğa", 
    puan: 4.6, 
    favori: false,
    resim: "https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?auto=format&fit=crop&w=400&q=80",
    aciklama: "Peribacaları, sıcak hava balonları ve tarihi taş oteller.",
    hava: null
  },
  { 
    isim: "Sümela Manastırı", 
    sehir: "Trabzon", 
    aramaTerimi: "Sumela Monastery",
    kategori: "Tarihi", 
    puan: 4.2, 
    favori: true,
    resim: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=400&q=80",
    aciklama: "Altındere Vadisi'ne bakan dik kayalıklar üzerine kurulmuş tarihi Rum manastırı.",
    hava: null
  }
];

export function hafizayaKaydet() {
  localStorage.setItem('benimMekanlarim', JSON.stringify(mekanlar));
}