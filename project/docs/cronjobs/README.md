# Cron Jobs - RefTrends Data Sync

Bu dokuman RefTrends projesinin otomatik veri senkronizasyon sistemini aciklar.

## Genel Bakis

| Script | Zamanlama | API Kullanimi | Aciklama |
|--------|-----------|---------------|----------|
| `daily-sync.ts` | Her gun 06:00 | ~50-100 istek | Gunluk ana sync (kart + penalti) |
| `daily-update.ts` | Her gun 23:00 | ~30-50 istek | Gece sonu sonuc guncelleme |
| `sync-leagues.ts` | Haftalik Pazartesi | ~20 istek | Lig metadata guncelleme |
| `weekly-penalty-sync.ts` | Haftalik Pazar 04:00 | ~100-500 istek | Penalti verisi guncelleme |

---

## 1. Daily Sync (Ana Gunluk Senkronizasyon)

**Dosya:** `src/scripts/daily-sync.ts`
**NPM Script:** `npm run sync:daily`
**Zamanlama:** Her gun saat 06:00

### Ne Yapar?
- Son 7 gunun mac sonuclarini ceker
- Yeni hakemleri otomatik ekler
- Kart istatistiklerini gunceller (sari/kirmizi)
- Penalti istatistiklerini gunceller (atilan/kacirilan)
- Hakem sezon istatistiklerini hesaplar
- Wikipedia'dan hakem fotografi arar (10 hakem/gun)

### Desteklenen Ligler
| Lig | API ID |
|-----|--------|
| Premier League | 39 |
| La Liga | 140 |
| Serie A | 135 |
| Bundesliga | 78 |
| Ligue 1 | 61 |

### Ornek Cikti
```
[06:00:01] Starting daily sync...
[06:00:02] Syncing Premier League recent fixtures...
[06:00:15] Found 8 fixtures in last 7 days
[06:00:45] Processing 6 completed fixtures...
[06:01:30] Premier League sync complete!
...
[06:05:00] Calculating referee statistics...
[06:05:30] Statistics calculated!
[06:05:45] Daily sync completed!
```

---

## 2. Daily Update (Gece Sonuc Guncelleme)

**Dosya:** `src/scripts/daily-update.ts`
**Zamanlama:** Her gun saat 23:00 (veya 06:00 alternatif)

### Ne Yapar?
- Son 3 gunun maclarini kontrol eder
- Bitmis maclarin skorlarini gunceller
- Hakem istatistiklerini yeniden hesaplar

### Ne Zaman Kullanilir?
- `daily-sync.ts` yerine daha hafif bir alternatif olarak
- Gunun sonunda son sonuclari yakalamak icin

---

## 3. Sync Leagues (Lig Metadata)

**Dosya:** `src/scripts/sync-leagues.ts`
**NPM Script:** `npm run sync:leagues`
**Zamanlama:** Haftalik (Pazartesi 03:00)

### Ne Yapar?
- Lig bilgilerini gunceller
- Yeni sezon gecislerini kontrol eder
- Takim kadrolarini senkronize eder

---

## 4. Weekly Penalty Sync (Haftalik Penalti Guncelleme)

**Dosya:** `src/scripts/weekly-penalty-sync.ts`
**NPM Script:** `npm run sync:penalties`
**Zamanlama:** Haftalik (Pazar 04:00)

### Ne Yapar?
- Son 30 gunun maclarini kontrol eder
- Eksik penalti verilerini API'den ceker
- Hakem penalti istatistiklerini gunceller
- Strictness index'i penalti verisiyle yeniden hesaplar

### Neden Haftalik?
- Penalti verisi nadir (maclarin ~%23'unda penalti var)
- Gunluk sync kacirilmis penaltilari yakalayamayabilir
- Haftalik toplu kontrol daha kapsamli

### Ornek Cikti
```
=== Weekly Penalty Sync ===
Found 150 matches to check for penalties (last 30 days)

  [12/150] Arsenal vs Chelsea: 1 penalties
  [45/150] Real Madrid vs Barcelona: 2 penalties
  ...

=== Summary ===
Matches processed: 150
Matches with penalties found: 28
API Requests: 150
Duration: 35s
```

---

## Kurulum

### Windows Task Scheduler (Lokal Gelistirme)

1. PowerShell'i Administrator olarak ac
2. Setup scriptini calistir:

```powershell
cd C:\Users\onurm\.claude\projects\autonomous-referee-stats\project
.\scripts\setup-cron.ps1
```

3. Manuel kontrol:
```powershell
# Tum scheduled task'lari gor
Get-ScheduledTask | Where-Object {$_.TaskName -like "RefTrends*"}

# Task'i manuel calistir
Start-ScheduledTask -TaskName "RefTrends-DailySync"

# Task'i sil
Unregister-ScheduledTask -TaskName "RefTrends-DailySync" -Confirm:$false
```

### Vercel Cron Jobs (Production)

`vercel.json` dosyasina ekle:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-sync",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/update-stats",
      "schedule": "0 23 * * *"
    },
    {
      "path": "/api/cron/weekly-penalty-sync",
      "schedule": "0 4 * * 0"
    }
  ]
}
```

> **Not:** Vercel Hobby plan'da cron job'lar gunluk 1 kez calisir. Pro plan'da dakika bazli zamanlama yapilabilir.

### GitHub Actions (Alternatif)

`.github/workflows/daily-sync.yml`:

```yaml
name: Daily Data Sync

on:
  schedule:
    - cron: '0 6 * * *'  # Her gun 06:00 UTC
  workflow_dispatch:      # Manuel tetikleme

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: cd project && npm ci

      - name: Run daily sync
        run: cd project && npm run sync:daily
        env:
          API_FOOTBALL_KEY: ${{ secrets.API_FOOTBALL_KEY }}
```

---

## API Limitleri

**API-Football Limitleri:**
- Free Plan: 100 istek/gun
- Pro Plan: 7,500 istek/gun
- Ultra Plan: 75,000 istek/gun

**Rate Limiting:**
- Scriptler 30 istek/dakika limiti uyguluyor
- Her lig arasi 2 saniye bekleme var

### Tahmini Gunluk Kullanim

| Islem | API Istegi |
|-------|------------|
| 5 lig fixture cekme | 5 |
| Tamamlanan mac event'leri | ~30-40 |
| Toplam | ~35-50 |

---

## Hata Yonetimi

### Log Dosyalari
```
project/logs/
  sync.log        # Ana sync loglari
  errors.log      # Hata detaylari
```

### Yaygin Hatalar

| Hata | Cozum |
|------|-------|
| `Rate limit reached` | Bekleme suresi otomatik, mudahale gerekmiyor |
| `API returned errors` | API key kontrolu, kota kontrolu |
| `team not found` | `sync:leagues` calistir |
| `Database locked` | Baska islem calisiyor, bekle |

### Basarisiz Sync Sonrasi

```bash
# Tam senkronizasyon (dikkat: cok API kullanir)
npm run sync:full

# Sadece ligleri guncelle
npm run sync:leagues

# Sadece hakem fotolarini guncelle
npm run sync:photos
```

---

## Izleme ve Monitoring

### Manuel Kontrol Komutlari

```bash
# Veritabani durumu
npx prisma studio

# Son eklenen maclar
sqlite3 dev.db "SELECT * FROM Match ORDER BY createdAt DESC LIMIT 10"

# Hakem sayisi
sqlite3 dev.db "SELECT COUNT(*) FROM Referee"
```

### Basari Kriterleri

Her sync sonrasi kontrol:
- [ ] Yeni maclar eklendi mi?
- [ ] Tamamlanan maclarda istatistik var mi?
- [ ] Hakem istatistikleri guncellendi mi?
- [ ] API istek sayisi limit altinda mi?

---

## Environment Variables

```env
# .env dosyasinda
API_FOOTBALL_KEY=your_api_key_here

# Production icin
DATABASE_URL=file:./prod.db
```

---

## Sezon Gecisi

Her yeni sezon basinda (genelde Agustos):

1. `LEAGUES` array'indeki `season` degerini guncelle
2. Full sync calistir: `npm run sync:full`
3. Eski sezon verilerini arsivle (opsiyonel)

```typescript
// src/scripts/daily-sync.ts
const currentSeason = 2025; // <- Yeni sezon
```
