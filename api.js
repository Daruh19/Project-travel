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