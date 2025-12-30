# 🤖 Autonomous Claude Code - Referee Stats Builder

Denis'in Clopus-02 mimarisinden ilham alan, 24 saat kesintisiz çalışabilen otonom Claude Code sistemi.

## 🚀 VS Code + Opus 4.5 ile Hızlı Başlangıç

### Windows (PowerShell) - ÖNERİLEN
```powershell
# 1. Klasörü VS Code'da aç
# 2. Terminal aç (Ctrl+`)
# 3. Çalıştır:
.\vscode-runner.ps1

# Özel ayarlarla:
.\vscode-runner.ps1 -Interval 60 -MaxIterations 100
```

### Windows (Git Bash / WSL)
```bash
chmod +x vscode-runner.sh
./vscode-runner.sh
```

### macOS / Linux
```bash
chmod +x vscode-runner.sh
./vscode-runner.sh
```

### En Basit Yöntem (Tüm Platformlar)
```bash
# Sonsuz döngü - dakikada 1
while true; do 
  claude --dangerously-skip-permissions "TASKS.md'den bir görevi tamamla ve [x] işaretle"
  sleep 60
done
```

---

## 🏗️ Mimari

```
┌─────────────────────────────────────────────────────────────────┐
│                         WATCHER                                  │
│  (Her 5 dakikada bir Claude'u tetikler ve durumu kontrol eder)  │
│  Çalıştırır: watcher.sh (cron job)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         WORKER                                   │
│  (Asıl işi yapan Claude Code instance'ı)                        │
│  Çalışır: tmux session "refstats"                               │
│  İzlenir: ttyd üzerinden web'de canlı                           │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  SHORT-TERM      │ │  LONG-TERM       │ │  TASKS           │
│  MEMORY          │ │  MEMORY          │ │  TRACKER         │
│  (SQLite)        │ │  (Qdrant/SQLite) │ │  (TASKS.md)      │
│  Son 50 işlem    │ │  Öğrenilenler    │ │  Yapılacaklar    │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

## 📁 Dosya Yapısı

```
autonomous-referee-stats/
├── README.md                 # Bu dosya
├── MASTER_PROMPT.md          # Claude'a verilecek ana prompt
├── TASKS.md                  # Görev listesi
├── setup.sh                  # Kurulum scripti
├── watcher.sh                # Watcher (5 dk'da bir tetikler)
├── worker.sh                 # Worker başlatıcı
├── start.sh                  # Tüm sistemi başlat
├── stop.sh                   # Tüm sistemi durdur
├── dashboard/                # Web dashboard
│   └── index.html
├── data/
│   ├── memory/
│   │   ├── short_term.db     # SQLite - kısa süreli hafıza
│   │   └── long_term.db      # SQLite - uzun süreli hafıza
│   ├── logs/
│   │   └── worker.log
│   └── screenshots/          # Browser screenshot'ları
├── project/                  # Referee Stats projesi
│   └── (Next.js projesi)
└── skills/                   # Claude skills
    ├── nextjs/SKILL.md
    ├── api-football/SKILL.md
    └── database/SKILL.md
```

## 🚀 Hızlı Başlangıç

```bash
# 1. Kurulum
chmod +x setup.sh && ./setup.sh

# 2. Sistemi başlat
./start.sh

# 3. Dashboard'u aç
# http://localhost:8080

# 4. Canlı izle (tmux)
tmux attach -t refstats

# 5. Durdur
./stop.sh
```

## 💰 Maliyet Tahmini

- 24 saat çalışma: ~800k token
- Claude Opus: ~$12-15/gün
- Claude Sonnet: ~$3-5/gün (önerilen)
