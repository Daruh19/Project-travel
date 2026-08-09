import { mekanlar, hafizayaKaydet } from './veri.js';
import { istatistikGuncelle } from './istatistik.js';

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

// EKRANI ÇİZME FONKSİYONU
function listeyiCiz(gosterilecekListe = mekanlar) {
  seyehatListesi.innerHTML = '';

  if (gosterilecekListe.length === 0) {
    seyehatListesi.innerHTML = '<li style="color: red;">Aradığınız kriterlere uygun mekan bulunamadı 🔍</li>';
    istatistikGuncelle();
    return;
  }

  const htmlDizisi = gosterilecekListe.map((mekan, indeks) => {
    const { isim, sehir, kategori, puan } = mekan;
    return `
      <li>
        <strong>${isim}</strong> (${sehir}) - [${kategori}] 
        | Puan: <strong>${puan.toFixed(1)}</strong>
        <button data-islem="azalt" data-indeks="${indeks}">➖</button>
        <button data-islem="arttir" data-indeks="${indeks}">➕</button>
        <button data-islem="duzenle" data-indeks="${indeks}">✏️ Düzenle</button>
        <button data-islem="sil" data-indeks="${indeks}">❌ Sil</button>
      </li>
    `;
  });

  seyehatListesi.innerHTML = htmlDizisi.join('');
  istatistikGuncelle();
}

// DİNAMİK LİSTE BUTONLARINI DİNLEME (Event Delegation)
seyehatListesi.addEventListener('click', function(e) {
  const buton = e.target;
  const islem = buton.dataset.islem;
  const indeks = Number(buton.dataset.indeks);

  if (!islem) return;

  if (islem === 'sil') {
    if (confirm('Bu mekanı silmek istediğinize emin misiniz?')) {
      mekanlar.splice(indeks, 1);
      hafizayaKaydet();
      listeyiCiz();
    }
  } else if (islem === 'arttir') {
    mekanlar[indeks].puan = Math.min(5.0, mekanlar[indeks].puan + 0.1);
    hafizayaKaydet();
    listeyiCiz();
  } else if (islem === 'azalt') {
    mekanlar[indeks].puan = Math.max(0, mekanlar[indeks].puan - 0.1);
    hafizayaKaydet();
    listeyiCiz();
  } else if (islem === 'duzenle') {
    mekanAdi.value = mekanlar[indeks].isim;
    sehirAdi.value = mekanlar[indeks].sehir;
    kategoriSecim.value = mekanlar[indeks].kategori;
    ekleBtn.textContent = "Mekanı Güncelle";
    duzenlenenIndeks = indeks;
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
  } else {
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