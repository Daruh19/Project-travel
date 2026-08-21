import { mekanlar, hafizayaKaydet } from './veri.js';
import { istatistikGuncelle } from './istatistik.js';

import { sehirFotograflariniGetir, sehirKoordinatGetir, anlikHavaGetir, gecmisOrtalamaGetir } from './api.js';

// --- DOM ELEMANLARI (Sadece HTML'de Aktif Olanlar) ---
const seyehatListesi = document.querySelector('#seyehatListesi'); // Kartların ekleneceği UL[cite: 2]
const aramaInput = document.querySelector('#aramaInput'); // Arama girdi kutusu[cite: 2]
const kategoriButonlari = document.querySelector('#kategoriButonlari'); // Kategori butonlarının kutusu[cite: 2]

// --- MODAL ELEMANLARI ---
const detayModal = document.querySelector('#detayModal');
const modalKapatBtn = document.querySelector('#modalKapatBtn');
const modalResim = document.querySelector('#modalResim');
const modalBaslik = document.querySelector('#modalBaslik');
const modalKategori = document.querySelector('#modalKategori');
const modalSehir = document.querySelector('#modalSehir');
const modalAciklama = document.querySelector('#modalAciklama');
const modalPuan = document.querySelector('#modalPuan');

const tarihBaslangic = document.querySelector('#tarihBaslangic');
const tarihBitis = document.querySelector('#tarihBitis');
const aramaBtn = document.querySelector('#aramaBtn');

// --- HAFIZA VE SLIDER DEĞİŞKENLERİ ---
const havaDurumuHafizasi = {}; // Şehir hava durumlarını tekrar sorgulamamak için önbellek
let aktifResimler = []; // Modal içindeki slider fotoğrafları dizisi
let mevcutResimIndeksi = 0; // O an gösterilen resmin indeksi

// --- EKRANA KARTLARI ÇİZEN ANA FONKSİYON ---
function listeyiCiz(gosterilecekListe = mekanlar) {
  seyehatListesi.innerHTML = ''; // Önceki kartları temizle

  // Eğer aranılan veya filtrelenen kriterde mekan yoksa uyarı göster
  if (gosterilecekListe.length === 0) {
    seyehatListesi.innerHTML = `
      <li style="color: #e74c3c; grid-column: 1 / -1; text-align: center; padding: 20px;">
        <span>Aradığınız kriterlere uygun mekan bulunamadı 🔍</span>
      </li>
    `;
    istatistikGuncelle([]);
    return;
  }

  // Mekanlar dizisini dönüp HTML kart yapılarını oluşturuyoruz
  const htmlDizisi = gosterilecekListe.map((mekan, indeks) => {
    const { isim, sehir, kategori, puan, favori, resim, aciklama } = mekan;

    const miniResim = resim || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=300&q=80';
    const miniAciklama = aciklama || 'Bu rota için detaylar hazırlanıyor.';
    const favoriSinifi = favori ? 'favori-aktif' : '';

    return `
      <li class="travel-card-wrapper">
        <article class="travel-card-mini ${favoriSinifi}" data-islem="detay-ac" data-indeks="${indeks}">
          <!-- Kapak Resmi -->
          <img src="${miniResim}" alt="${isim}" class="mini-card-img" />

          <div class="mini-card-body">
            <!-- Başlık ve Favori Kalbi -->
            <div class="mini-header">
              <h3 class="mini-title">${isim}</h3>
              <button style="border:none; background:none; cursor:pointer;" data-islem="favori" data-indeks="${indeks}">
                ${favori ? '❤️' : '🤍'}
              </button>
            </div>

            <!-- Konum, Kategori ve Puan -->
            <div class="mini-info">
              <span>📍 ${sehir}</span>
              <span class="mini-tag">${kategori}</span>
              <span>⭐ ${puan.toFixed(1)}</span>
            </div>

            <!-- Kısa Açıklama -->
            <p class="mini-desc">${miniAciklama}</p>

            <!-- Hava Durumu Kutusu -->
            <div class="weather-box-mini" id="hava-${indeks}">
              🌤️ Yükleniyor...
            </div>

            <div class="click-hint">Detaylar için tıkla ➔</div>
          </div>
        </article>
      </li>
    `;
  });

  seyehatListesi.innerHTML = htmlDizisi.join('');
  
  // İstatistik paneli ve hava durumunu güncelle
  istatistikGuncelle(gosterilecekListe);
  kartHavaDurumlariniGuncelle(gosterilecekListe);
}

// --- KARTLARA TIKLAMA OLAYI (Event Delegation) ---
seyehatListesi.addEventListener('click', function(e) {
  const hedef = e.target.closest('[data-islem]');
  if (!hedef) return;

  const islem = hedef.dataset.islem;
  const indeks = Number(hedef.dataset.indeks);

  if (islem === 'favori') {
    e.stopPropagation(); // Kalbe tıklanınca modalın açılmasını engeller
    mekanlar[indeks].favori = !mekanlar[indeks].favori;
    hafizayaKaydet();
    listeyiCiz();
  } else if (islem === 'detay-ac') {
    detayGoster(indeks);
  }
});

// --- CANLI ARAMA ---
aramaInput.addEventListener('input', function() {
  const arananMetin = aramaInput.value.toLowerCase().trim();
  const aramaSonuclari = mekanlar.filter(mekan => {
    return mekan.isim.toLowerCase().includes(arananMetin) || mekan.sehir.toLowerCase().includes(arananMetin);
  });
  listeyiCiz(aramaSonuclari);
});

// --- KATEGORİ FİLTRELEME (İkonlu Butonlar) ---
kategoriButonlari.addEventListener('click', function(e) {
  const buton = e.target.closest('.kat-btn');
  if (!buton) return;

  // Aktif sınıfını tıklanan butona kaydırıyoruz
  document.querySelectorAll('.kat-btn').forEach(b => b.classList.remove('aktif'));
  buton.classList.add('aktif');

  const secilenKategori = buton.dataset.kategori;

  if (secilenKategori === 'hepsi') {
    listeyiCiz(mekanlar);
  } else if (secilenKategori === 'favori') {
    const favoriler = mekanlar.filter(mekan => mekan.favori === true);
    listeyiCiz(favoriler);
  } else {
    const filtrelenmis = mekanlar.filter(mekan => mekan.kategori === secilenKategori);
    listeyiCiz(filtrelenmis);
  }
});

// --- MODAL DETAY VE SLIDER İŞLEMLERİ ---
async function detayGoster(indeks) {
  const mekan = mekanlar[indeks];

  modalBaslik.textContent = mekan.isim;
  modalKategori.textContent = mekan.kategori;
  modalSehir.textContent = `📍 ${mekan.sehir}`;
  modalAciklama.textContent = mekan.aciklama || 'Bu mekan hakkında henüz detaylı açıklama eklenmemiş.';
  modalPuan.textContent = `⭐ Puan: ${mekan.puan.toFixed(1)}`;

  modalResim.src = 'https://via.placeholder.com/400x200?text=Yukleniyor...';
  detayModal.classList.add('aktif');

  const sorgu = mekan.aramaTerimi || `${mekan.isim} ${mekan.sehir}`;
  aktifResimler = await sehirFotograflariniGetir(sorgu, 4);
  mevcutResimIndeksi = 0;

  if (aktifResimler.length > 0) {
    modalResim.src = aktifResimler[0];
  } else {
    modalResim.src = mekan.resim || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500';
  }

  // Preload (Resimleri önceden hafızaya alma)
  aktifResimler.forEach(resimUrl => {
    const img = new Image();
    img.src = resimUrl;
  });
}

function modaliKapat() {
  detayModal.classList.remove('aktif');
}

modalKapatBtn.addEventListener('click', modaliKapat);
detayModal.addEventListener('click', (e) => {
  if (e.target === detayModal) modaliKapat();
});

// Slider İleri / Geri Butonları
document.querySelector('#sliderNext')?.addEventListener('click', () => {
  if (aktifResimler.length === 0) return;
  mevcutResimIndeksi = (mevcutResimIndeksi + 1) % aktifResimler.length;
  modalResim.src = aktifResimler[mevcutResimIndeksi];
});

document.querySelector('#sliderPrev')?.addEventListener('click', () => {
  if (aktifResimler.length === 0) return;
  mevcutResimIndeksi = (mevcutResimIndeksi - 1 + aktifResimler.length) % aktifResimler.length;
  modalResim.src = aktifResimler[mevcutResimIndeksi];
});

// --- HAVA DURUMU SİMÜLASYONU ---


async function kartHavaDurumlariniGuncelle(liste) {
  const baslangic = tarihBaslangic.value;
  const bitis = tarihBitis.value;

  liste.forEach(async (mekan, indeks) => {
    const havaKutusu = document.querySelector(`#hava-${indeks}`);
    if (!havaKutusu) return;

    havaKutusu.textContent = "⏳ Hava hesaplanıyor...";

    // 1. Şehrin koordinatlarını alıyoruz
    const koordinat = await sehirKoordinatGetir(mekan.sehir);
    if (!koordinat) {
      havaKutusu.textContent = "🌤️ Veri bulunamadı";
      return;
    }
if (baslangic && bitis) {
  const ortalama = await gecmisOrtalamaGetir(koordinat.enlem, koordinat.boylam, baslangic, bitis);
  if (ortalama) {
    // Artık hem gündüz hem gece değerini ayrıştırıp yazdırıyoruz
    havaKutusu.innerHTML = `☀️ <strong>Gündüz:</strong> ${ortalama.gunduz}°C | 🌙 <strong>Gece:</strong> ${ortalama.gece}°C`;
  } else {
    havaKutusu.textContent = "🌤️ Hava tahmini alınamadı";
  }
}
    // 3. Tarih seçilmediyse o anki CANLI dereceyi göster
    else {
      const anlikDerece = await anlikHavaGetir(koordinat.enlem, koordinat.boylam);
      if (anlikDerece !== null) {
        havaKutusu.innerHTML = `☀️ <strong>Anlık:</strong> ${anlikDerece}°C`;
      } else {
        havaKutusu.textContent = "🌤️ Canlı derece alınamadı";
      }
    }
  });
}

// "Keşfet" Butonuna Basıldığında Hava Durumlarını Yeniden Hesapla
aramaBtn.addEventListener('click', () => {
  listeyiCiz();
});

// --- İLK AÇILIŞTA ÇALIŞTIR ---
listeyiCiz();