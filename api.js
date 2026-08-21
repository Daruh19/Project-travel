const UNSPLASH_KEY = "2cKS8lvGWfpUsN3P9G-O2L5v6P2ydCZ0bcuWXUthnIk";

export async function sehirFotograflariniGetir(aramaTerimi, miktar = 4) {
  try {
    const guvenliArama = encodeURIComponent(aramaTerimi);
    const url = `https://api.unsplash.com/search/photos?page=1&query=${guvenliArama}&per_page=${miktar}&client_id=${UNSPLASH_KEY}`;
    
    const yanıt = await fetch(url);
    if (!yanıt.ok) throw new Error("Fotoğraf Çekilemedi");

    const veri = await yanıt.json();
    
    if (!veri.results || veri.results.length === 0) {
      return ["https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500"];
    }

    return veri.results.map(foto => `${foto.urls.raw}&w=1800&q=90&auto=format`);
  } catch (hata) {
    console.error("Unsplash API Hatası:", hata);
    return ["https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500"];
  }
}
export async function sehirKoordinatGetir(sehirAdi) {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(sehirAdi)}&count=1&language=tr&format=json`;
    const yanit = await fetch(url);
    const veri = await yanit.json();

    if (!veri.results || veri.results.length === 0) return null;
    return { enlem: veri.results[0].latitude, boylam: veri.results[0].longitude };
  } catch (hata) {
    console.error("Koordinat alma hatası:", hata);
    return null;
  }
}

// 2. KOORDİNATI VERİLEN ŞEHRİN O ANKİ CANLI DERECESİNİ ÇEKER
export async function anlikHavaGetir(enlem, boylam) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${enlem}&longitude=${boylam}&current_weather=true`;
    const yanit = await fetch(url);
    const veri = await yanit.json();
    return veri.current_weather ? veri.current_weather.temperature : null;
  } catch (hata) {
    console.error("Anlık hava hatası:", hata);
    return null;
  }
}

// 3. GELECEK TARİHLERİN AY/GÜN BİLGİSİYLE SON 10 YILIN ORTALAMASINI HESAPLAR
export async function gecmisOrtalamaGetir(enlem, boylam, baslangicStr, bitisStr) {
  try {
    const [, ayBas, gunBas] = baslangicStr.split('-');
    const [, ayBit, gunBit] = bitisStr.split('-');

    const baslangicMMDD = `${ayBas}-${gunBas}`;
    const bitisMMDD = `${ayBit}-${gunBit}`;

    const gecmisBaslangic = `2016-${ayBas}-${gunBas}`;
    const gecmisBitis = `2025-${ayBit}-${gunBit}`;

    // daily parametresine hem max (gündüz) hem min (gece) ekledik
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${enlem}&longitude=${boylam}&start_date=${gecmisBaslangic}&end_date=${gecmisBitis}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const yanit = await fetch(url);
    const veri = await yanit.json();

    if (!veri.daily || !veri.daily.time) return null;

    const tarihDizisi = veri.daily.time;
    const maxDizisi = veri.daily.temperature_2m_max; // Gündüz en yüksek dereceler
    const minDizisi = veri.daily.temperature_2m_min; // Gece en düşük dereceler

    const gunduzListesi = [];
    const geceListesi = [];

    tarihDizisi.forEach((tarih, indeks) => {
      const MMDD = tarih.slice(5);
      const maxDerece = maxDizisi[indeks];
      const minDerece = minDizisi[indeks];

      if (maxDerece !== null && minDerece !== null) {
        const araliktaMi = baslangicMMDD <= bitisMMDD
          ? (MMDD >= baslangicMMDD && MMDD <= bitisMMDD)
          : (MMDD >= baslangicMMDD || MMDD <= bitisMMDD);

        if (araliktaMi) {
          gunduzListesi.push(maxDerece);
          geceListesi.push(minDerece);
        }
      }
    });

    if (gunduzListesi.length === 0) return null;

    // Gündüz ve Gece ortalamalarını ayrı ayrı hesaplıyoruz
    const gunduzTop = gunduzListesi.reduce((acc, d) => acc + d, 0);
    const geceTop = geceListesi.reduce((acc, d) => acc + d, 0);

    return {
      gunduz: (gunduzTop / gunduzListesi.length).toFixed(1),
      gece: (geceTop / geceListesi.length).toFixed(1)
    };

  } catch (hata) {
    console.error("Geçmiş ortalama hesaplama hatası:", hata);
    return null;
  }
}