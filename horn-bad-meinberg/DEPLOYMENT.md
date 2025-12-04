# Bürger-App Schieder-Schwalenberg - Dauerhafte Bereitstellung

## ✅ Status: Produktiv

Die Anwendung ist jetzt dauerhaft bereitgestellt und läuft als systemd-Service.

## Zugriff

**URL:** https://3000-inl8tacp6y8oylbthspft-4692b5cf.manusvm.computer/

## Automatischer Start

Die Anwendung startet automatisch:
- ✅ Beim Systemstart
- ✅ Nach einem Neustart
- ✅ Nach einem Absturz (automatischer Neustart nach 10 Sekunden)

## Service-Verwaltung

### Status prüfen
```bash
sudo systemctl status buergerapp.service
```

### Service starten
```bash
sudo systemctl start buergerapp.service
```

### Service stoppen
```bash
sudo systemctl stop buergerapp.service
```

### Service neu starten
```bash
sudo systemctl restart buergerapp.service
```

### Service deaktivieren (kein automatischer Start)
```bash
sudo systemctl disable buergerapp.service
```

### Service aktivieren (automatischer Start)
```bash
sudo systemctl enable buergerapp.service
```

## Logs

### Live-Logs anzeigen
```bash
sudo journalctl -u buergerapp.service -f
```

### Letzte 100 Zeilen
```bash
sudo journalctl -u buergerapp.service -n 100
```

### Anwendungs-Logs
```bash
# Standard-Output
cat /var/log/buergerapp/output.log

# Fehler-Logs
cat /var/log/buergerapp/error.log

# Live-Monitoring
tail -f /var/log/buergerapp/output.log
```

## Monitoring

### Monitoring-Script ausführen
```bash
/home/ubuntu/buergerapp-schieder/monitor.sh
```

Das Script zeigt:
- Service-Status
- Port-Status
- Aktuelle Logs
- Fehler
- MySQL-Status
- Ressourcenverbrauch (CPU/Memory)

## Backup

### Manuelles Backup erstellen
```bash
/home/ubuntu/buergerapp-schieder/backup.sh
```

Das Backup-Script sichert:
- Datenbank (MySQL dump)
- Konfigurationsdatei (.env)
- Hochgeladene Dateien (falls vorhanden)

Backups werden gespeichert in: `/home/ubuntu/backups/`

### Automatisches Backup einrichten

Für tägliche Backups um 2:00 Uhr nachts:

```bash
# Crontab bearbeiten
crontab -e

# Folgende Zeile hinzufügen:
0 2 * * * /home/ubuntu/buergerapp-schieder/backup.sh >> /var/log/buergerapp/backup.log 2>&1
```

## Updates und Wartung

### Anwendung aktualisieren

1. **Code aktualisieren** (z.B. von Git):
   ```bash
   cd /home/ubuntu/buergerapp-schieder
   git pull
   ```

2. **Dependencies installieren**:
   ```bash
   pnpm install
   ```

3. **Datenbank migrieren**:
   ```bash
   pnpm db:push
   ```

4. **Neu bauen**:
   ```bash
   pnpm build
   ```

5. **Service neu starten**:
   ```bash
   sudo systemctl restart buergerapp.service
   ```

### Datenbank-Wartung

```bash
# Datenbank-Backup
mysqldump -uroot -ppassword buergerapp > backup.sql

# Datenbank wiederherstellen
mysql -uroot -ppassword buergerapp < backup.sql

# Datenbank-Größe prüfen
mysql -uroot -ppassword -e "SELECT table_schema AS 'Database', ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.TABLES WHERE table_schema = 'buergerapp';"
```

## Troubleshooting

### Service startet nicht

1. **Logs prüfen**:
   ```bash
   sudo journalctl -u buergerapp.service -n 50
   ```

2. **Konfiguration prüfen**:
   ```bash
   cat /home/ubuntu/buergerapp-schieder/.env
   ```

3. **MySQL läuft**:
   ```bash
   sudo systemctl status mysql
   ```

4. **Port belegt**:
   ```bash
   sudo netstat -tlnp | grep 3000
   ```

### Anwendung reagiert nicht

1. **Service neu starten**:
   ```bash
   sudo systemctl restart buergerapp.service
   ```

2. **Prozess prüfen**:
   ```bash
   ps aux | grep node
   ```

3. **Speicher prüfen**:
   ```bash
   free -h
   ```

### Datenbank-Verbindungsfehler

1. **MySQL-Status prüfen**:
   ```bash
   sudo systemctl status mysql
   ```

2. **Verbindung testen**:
   ```bash
   mysql -uroot -ppassword -e "SELECT 1;"
   ```

3. **Datenbank existiert**:
   ```bash
   mysql -uroot -ppassword -e "SHOW DATABASES LIKE 'buergerapp';"
   ```

## Sicherheit

### Empfohlene Maßnahmen

1. **Firewall konfigurieren**:
   ```bash
   sudo ufw allow 3000/tcp
   sudo ufw enable
   ```

2. **MySQL-Root-Passwort ändern**:
   ```bash
   mysql -uroot -ppassword -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'neues_sicheres_passwort';"
   ```
   
   Dann `.env` aktualisieren mit neuem Passwort.

3. **JWT_SECRET ändern**:
   Bearbeiten Sie `/home/ubuntu/buergerapp-schieder/.env` und setzen Sie einen sicheren Wert für `JWT_SECRET`.

4. **Regelmäßige Updates**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

## Performance-Optimierung

### Node.js Memory Limit erhöhen

Falls die Anwendung mehr Speicher benötigt, bearbeiten Sie `/etc/systemd/system/buergerapp.service`:

```ini
[Service]
Environment="NODE_OPTIONS=--max-old-space-size=2048"
```

Dann:
```bash
sudo systemctl daemon-reload
sudo systemctl restart buergerapp.service
```

### MySQL-Optimierung

Für bessere Performance bei vielen Daten, bearbeiten Sie `/etc/mysql/mysql.conf.d/mysqld.cnf`:

```ini
[mysqld]
innodb_buffer_pool_size = 256M
max_connections = 100
```

Dann MySQL neu starten:
```bash
sudo systemctl restart mysql
```

## System-Anforderungen

- **OS**: Ubuntu 22.04 oder höher
- **Node.js**: v22.13.0
- **MySQL**: 8.0+
- **RAM**: Mindestens 512 MB, empfohlen 1 GB
- **Disk**: Mindestens 2 GB freier Speicher

## Service-Konfiguration

Die Service-Datei befindet sich unter:
```
/etc/systemd/system/buergerapp.service
```

Wichtige Einstellungen:
- **Restart**: always (automatischer Neustart bei Absturz)
- **RestartSec**: 10 (Wartezeit vor Neustart)
- **User**: ubuntu (läuft als ubuntu-Benutzer)
- **WorkingDirectory**: /home/ubuntu/buergerapp-schieder

## Support und Kontakt

Bei Problemen oder Fragen:

1. Logs prüfen: `/var/log/buergerapp/`
2. Monitoring-Script ausführen: `./monitor.sh`
3. Service-Status prüfen: `sudo systemctl status buergerapp.service`

## Wichtige Dateien und Verzeichnisse

```
/home/ubuntu/buergerapp-schieder/          # Anwendungsverzeichnis
├── dist/                                   # Produktions-Build
├── .env                                    # Umgebungsvariablen
├── monitor.sh                              # Monitoring-Script
├── backup.sh                               # Backup-Script
└── DEPLOYMENT.md                           # Diese Datei

/etc/systemd/system/buergerapp.service     # systemd Service-Definition
/var/log/buergerapp/                       # Log-Verzeichnis
├── output.log                             # Standard-Output
└── error.log                              # Fehler-Logs

/home/ubuntu/backups/                      # Backup-Verzeichnis
```

## Nächste Schritte

1. ✅ Service läuft dauerhaft
2. ✅ Automatischer Start konfiguriert
3. ✅ Monitoring eingerichtet
4. ✅ Backup-System verfügbar
5. 🔄 Inhalte hinzufügen (News, Events, etc.)
6. 🔄 Admin-Benutzer anlegen
7. 🔄 Regelmäßige Backups einrichten (Cron)

---

**Erstellt am:** 22. Oktober 2025, 02:52 Uhr  
**Version:** 1.0  
**Status:** Produktiv

