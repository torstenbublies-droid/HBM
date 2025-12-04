# Bürger-App - Quick Reference

## Häufigste Befehle

### Service-Verwaltung
```bash
# Status prüfen
sudo systemctl status buergerapp.service

# Neu starten
sudo systemctl restart buergerapp.service

# Logs anzeigen
sudo journalctl -u buergerapp.service -f
```

### Monitoring
```bash
# Status-Übersicht
./monitor.sh

# Live-Logs
tail -f /var/log/buergerapp/output.log
```

### Backup
```bash
# Backup erstellen
./backup.sh

# Backups anzeigen
ls -lh /home/ubuntu/backups/
```

### Updates
```bash
cd /home/ubuntu/buergerapp-schieder
pnpm install
pnpm build
sudo systemctl restart buergerapp.service
```

## URLs

- **Anwendung**: https://3000-inl8tacp6y8oylbthspft-4692b5cf.manusvm.computer/
- **Lokal**: http://localhost:3000/

## Wichtige Dateien

- Service: `/etc/systemd/system/buergerapp.service`
- Config: `/home/ubuntu/buergerapp-schieder/.env`
- Logs: `/var/log/buergerapp/`
- Backups: `/home/ubuntu/backups/`

## Bei Problemen

1. `sudo systemctl status buergerapp.service` - Status prüfen
2. `sudo journalctl -u buergerapp.service -n 50` - Logs prüfen
3. `./monitor.sh` - Monitoring ausführen
4. `sudo systemctl restart buergerapp.service` - Neu starten

