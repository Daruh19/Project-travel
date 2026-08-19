import { mekanlar, hafizayaKaydet } from './veri.js';
import { istatistikGuncelle } from './istatistik.js';
import { sehirFotograflariniGetir } from './api.js';

// DOM ELEMANLARI
const sehirAdi = document.querySelector('#sehirAdi');
const mekanAdi = document.querySelector('#mekanAdi');
const kategoriSecim = document.querySelector('#kategoriSecim');
const ekleBtn = document.querySelector('#ekleBtn');
const temizleBtn = document.querySelector('#temizleBtn');
const seyehatListesi = document.querySelector('#seyehatListesi');
const aramaInput = document.querySelector('#aramaInput');
const btnYuksekPuan = document.querySelector('#btnYuksekPuan');
const btnDusukPuan = document.querySelector('#btnDusukPuan');
const apiYukleBtn = document.querySelector('#btnApiYukle');
const kategoriButonlari = document.querySelector('#kategoriButonlari');

let duzenlenenIndeks = null;
//Modal Elamanları
const detayModal = document.querySelector('#detayModal');
const modalKapatBtn = document.querySelector('#modalKapatBtn');
const modalResim = document.querySelector('#modalResim');
const modalBaslik = document.querySelector('#modalBaslik');
const modalKategori = document.querySelector('#modalKategori');
const modalSehir = document.querySelector('#modalSehir');
const modalAciklama = document.querySelector('#modalAciklama');
const modalPuan = document.querySelector('#modalPuan');


const havaDurumuHafizasi = {};
let aktifResimler = [];
let mevcutResimIndeksi = 0;



// EKRANI ÇİZME FONKSİYONU
function listeyiCiz(gosterilecekListe = mekanlar) {
  seyehatListesi.innerHTML = '';

  if (gosterilecekListe.length === 0) {
    seyehatListesi.innerHTML = `
      <li style="color: red; display: flex; justify-content: space-between; align-items: center;">
        <span>Aradığınız kriterlere uygun mekan bulunamadı 🔍</span>
        <button id="btnFiltreSifirla" style="background-color: #e67e22;">Filtreleri Sıfırla</button>
      </li>
    `;
    istatistikGuncelle();
document.querySelector('#btnFiltreSifirla')?.addEventListener('click', () => {
      aramaInput.value = '';
      listeyiCiz();
    });
    return;
  }

  const htmlDizisi = gosterilecekListe.map((mekan, indeks) => {
    const { isim, sehir, kategori, puan, favori,resim,aciklama} = mekan;

    const miniResim = resim || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=300&q=80';
    const miniAciklama = aciklama || 'Bu rota için detaylar ve tavsiyeler hazırlanıyor.';

    const favoriSinifi = favori ? 'favori-aktif' : '';

    return `
      <li class="travel-card-wrapper">
    <article class="travel-card-mini ${favoriSinifi}" data-islem="detay-ac" data-indeks="${indeks}">
      <!-- 1. Küçük Kapak Görseli -->
      <img src="${miniResim}" alt="${isim}" class="mini-card-img" />

      <div class="mini-card-body">
        <!-- 2. Başlık ve Favori Kalbi -->
        <div class="mini-header">
          <h3 class="mini-title">${isim}</h3>
          <button style="border:none; background:none; cursor:pointer;" data-islem="favori" data-indeks="${indeks}">
            ${favori ? '❤️' : '🤍'}
          </button>
        </div>

        <!-- 3. Konum, Kategori ve Puan -->
        <div class="mini-info">
          <span>📍 ${sehir}</span>
          <span class="mini-tag">${kategori}</span>
          <span>⭐ ${puan.toFixed(1)}</span>
        </div>

        <!-- 4. Kısa Açıklama Özet -->
        <p class="mini-desc">${miniAciklama}</p>

        <!-- 5. Hava Durumu Yer Tutucu -->
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
  
  istatistikGuncelle(gosterilecekListe);
  kartHavaDurumlariniGuncelle(gosterilecekListe);
}

// DİNAMİK LİSTE BUTONLARINI DİNLEME (Event Delegation)
seyehatListesi.addEventListener('click', function(e) {
  // 1. Tıklanan en yakın data-islem elemanını buluyoruz
  const hedef = e.target.closest('[data-islem]');
  if (!hedef) return;

  const islem = hedef.dataset.islem;
  const indeks = Number(hedef.dataset.indeks);

  // 2. Eğer tıklanan yer FAVORİ butonu ise:
  if (islem === 'favori') {
    e.stopPropagation(); // 🛑 Tıklamanın dış kart katmanına sıçrayıp Modalı açmasını engeller!
    mekanlar[indeks].favori = !mekanlar[indeks].favori;
    hafizayaKaydet();
    listeyiCiz();
  } 
  // 3. Eğer tıklanan yer KARTIN KENDİSİ ise:
  else if (islem === 'detay-ac') {
    detayGoster(indeks);
  }
});

// EKLE / GÜNCELLE BUTONU
ekleBtn.addEventListener('click', function() {
  const mekan = mekanAdi.value.trim();
  const sehir = sehirAdi.value.trim();
  const kategori = kategoriSecim.value;

  if (mekan !== '' && sehir !== '' && kategori !== '') {
    if (duzenlenenIndeks !== null) {
      mekanlar[duzenlenenIndeks].isim = mekan;
      mekanlar[duzenlenenIndeks].sehir = sehir;
      mekanlar[duzenlenenIndeks].kategori = kategori;
      duzenlenenIndeks = null;
      ekleBtn.textContent = "Seyehate ekle";
    } else {
      mekanlar.push({ isim: mekan, sehir: sehir, kategori: kategori, puan: 5.0 });
    }

    mekanAdi.value = '';
    sehirAdi.value = '';
    kategoriSecim.value = '';
    hafizayaKaydet();
    listeyiCiz();
  } else {
    alert('Lütfen tüm alanları doldurunuz!');
  }
});

// TÜMÜNÜ TEMİZLE BUTONU
temizleBtn.addEventListener('click', function() {
  if (mekanlar.length > 0 && confirm('Tüm listeyi boşaltmak istediğinize emin misiniz?')) {
    mekanlar.length = 0;
    hafizayaKaydet();
    listeyiCiz();
  }
});

// CANLI ARAMA
aramaInput.addEventListener('input', function() {
  const arananMetin = aramaInput.value.toLowerCase().trim();
  const aramaSonuclari = mekanlar.filter(mekan => {
    return mekan.isim.toLowerCase().includes(arananMetin) || mekan.sehir.toLowerCase().includes(arananMetin);
  });
  listeyiCiz(aramaSonuclari);
});

// KATEGORİ FİLTRELEME
kategoriButonlari.addEventListener('click', function(e) {
  const secilenKategori = e.target.dataset.kategori;
  if (!secilenKategori) return;

  if (secilenKategori === 'hepsi') {
    listeyiCiz();
  }else if (secilenKategori === 'favori') {
    const favoriler = mekanlar.filter(mekan => mekan.favori === true);
    listeyiCiz(favoriler);
  }
   else {
    const filtrelenmis = mekanlar.filter(mekan => mekan.kategori === secilenKategori);
    listeyiCiz(filtrelenmis);
  }
});

// SIRALAMA BUTONLARI
btnYuksekPuan.addEventListener('click', function() {
  mekanlar.sort((a, b) => b.puan - a.puan);
  listeyiCiz();
});

btnDusukPuan.addEventListener('click', function() {
  mekanlar.sort((a, b) => a.puan - b.puan);
  listeyiCiz();
});

// API'DEN ROTA ÇEKME
async function sunucudanRotalariCek() {
  apiYukleBtn.textContent = "⏳ Veriler Yükleniyor...";
  apiYukleBtn.disabled = true;
  try {
    const yanit = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=3');
    const veriler = await yanit.json();
    veriler.forEach((eleman, indeks) => {
      let duzenlenmisIsim = eleman.title[0].toUpperCase() + eleman.title.slice(1,15) +" (Sanal Rota)";
      let kategori = indeks % 2 === 0 ? "Tarihi" : "Doğa";
      
      mekanlar.push({
        isim: duzenlenmisIsim,
        sehir: "Canlı Sunucu",
        kategori: kategori,
        puan: 5.0
      });
    });
    hafizayaKaydet();
    listeyiCiz();
    alert('🌐 Sunucudan rotalar başarıyla çekildi!');
  } catch (hata) {
    alert('❌ Hata oluştu: ' + hata);
  } finally {
    apiYukleBtn.textContent = "🌐 Sunucudan Rotaları Çek";
    apiYukleBtn.disabled = false;
  }
}
apiYukleBtn.addEventListener('click', sunucudanRotalariCek);

// İLK AÇILIŞTA EKRANI ÇİZ
listeyiCiz();
async function detayGoster(indeks){

  const mekan = mekanlar[indeks];

  
  modalBaslik.textContent = mekan.isim;
  modalKategori.textContent = mekan.kategori;
  modalSehir.textContent = `📍${mekan.sehir}`;
  modalAciklama.textContent = mekan.aciklama || 'Bu mekan hakkında henüz detaylı açıklama eklenmemiş.';
  modalPuan.textContent = `⭐ Puan: ${mekan.puan.toFixed(1)}`;

  modalResim.src = 'https://via.placeholder.com/400x200?text=Yukleniyor...';
  detayModal.classList.add('aktif');

  const sorgu = mekan.aramaTerimi || `${mekan.isim} ${mekan.sehir}`
  aktifResimler = await sehirFotograflariniGetir(sorgu, 4);
  mevcutResimIndeksi = 0;

  if (aktifResimler.length > 0) {
    modalResim.src = aktifResimler[0];  
      
  }else{
    modalResim.src = mekan.resim || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500';
  }
  aktifResimler.forEach(resimUrl => {
    const img = new Image();
    img.src = resimUrl;
  });

}
function modaliKapat(){
  detayModal.classList.remove('aktif');
}
modalKapatBtn.addEventListener('click',modaliKapat);

detayModal.addEventListener('click', (e) =>{
  if(e.target === detayModal){
    modaliKapat();
  }
});
async function havaDurumuGetir(sehir) {
  await new Promise(resolve => setTimeout(resolve,1000));

  const durumlar = ['☀️ 25°C Güneşli', '🌤️ 20°C Parçalı Bulutlu', '🌧️ 15°C Yağmurlu', '🌤️ 22°C Açık'];
  const rastgeleDurum = durumlar[Math.floor(Math.random() * durumlar.length)];

  return rastgeleDurum;

}


async function kartHavaDurumlariniGuncelle(liste) {
  liste.forEach(async(mekan,indeks) =>{
    const havaKutusu = document.querySelector(`#hava-${indeks}`);
    if(!havaKutusu) return;
    
    if(havaDurumuHafizasi[mekan.sehir]){
      havaKutusu.textContent = havaDurumuHafizasi[mekan.sehir];
      return;
      }
      const durum = await havaDurumuGetir(mekan.sehir);
      havaDurumuHafizasi[mekan.sehir] = durum;
      havaKutusu.textContent = durum;
  });
  
}
sehirFotograflariniGetir("Istanbul").then(resimler => {
  console.log("İstanbul fotoğrafları:", resimler);
});
document.querySelector('#sliderNext')?.addEventListener('click', () =>{
  if (aktifResimler.length === 0) return;
  mevcutResimIndeksi = (mevcutResimIndeksi + 1) % aktifResimler.length;
  modalResim.src = aktifResimler[mevcutResimIndeksi];
});
document.querySelector('#sliderPrev')?.addEventListener('click', () => {
  if(aktifResimler.length === 0) return;
  mevcutResimIndeksi = (mevcutResimIndeksi - 1 + aktifResimler.length) % aktifResimler.length;
  modalResim.src = aktifResimler[mevcutResimIndeksi];
});