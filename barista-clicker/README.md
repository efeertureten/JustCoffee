# ☕ Barista Clicker

Kahve demle, sat, dükkanını büyüt. React, Tailwind CSS ve lucide-react ile yapılmış bir tıklama (clicker) oyunu.

**Canlı oyun:** `https://KULLANICI-ADIN.github.io/barista-clicker/`
(Yayınlandıktan sonra bu satırı kendi adresinle değiştir.)

## Nasıl oynanır

- Ortadaki fincana tıkla: her tık kahve demler ve satar.
- Sağdaki **Market**'ten yükseltme al:
  - **Daha İyi Çekirdek**: tık başına +1 kahve
  - **Otomatik Espresso Makinesi**: saniyede +1 kahve
  - **Deneyimli Barista**: saniyede +10 kahve
- Toplam demlediğin fincan arttıkça dükkanın büyür (6 seviye) ve fincan fiyatı yükselir.
- İlerleme tarayıcıda otomatik kaydedilir.

## GitHub Pages'te yayınlama

1. GitHub'da yeni bir repo aç (ör. `barista-clicker`, **Public**).
2. Bu klasördeki tüm dosyaları repoya yükle. `.github` klasörü de gitmeli; site onunla derlenir.
3. Repoda **Settings → Pages → Build and deployment → Source** alanını **GitHub Actions** yap.
4. **Actions** sekmesinde "GitHub Pages'e yayınla" işi bitince oyun
   `https://KULLANICI-ADIN.github.io/REPO-ADI/` adresinde açılır.

`main` dalına her yeni push'ta site kendiliğinden güncellenir.

## Bilgisayarında çalıştırma

[Node.js](https://nodejs.org) 18 veya üstü gerekir.

```bash
npm install
npm run dev      # geliştirme sunucusu: http://localhost:5173
npm run build    # yayın için dist/ klasörünü üretir
npm run preview  # derlenmiş sürümü yerelde dener
```

## Dosyalar

```
.github/workflows/deploy.yml   GitHub Pages'e otomatik yayın
src/BaristaClicker.jsx         Oyunun tamamı (tek bileşen)
src/main.jsx                   Uygulamayı başlatır
src/index.css                  Tailwind girişi
index.html                     Sayfa iskeleti
```
