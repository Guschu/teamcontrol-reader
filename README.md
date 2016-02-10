# TeamControl Reader

Die **Lesestation** für das Projekt [TeamControl](https://gitlab.software-consultant.net/swc/teamcontrol).

Aufgabe der Lesestation ist es NFC-Tags zu lesen und an den Server zu schicken.

## Installation
Es ist vorgesehen, dass die Lesestation auf einem __Raspberry-PI__ __2__ __Model__ __B__ läuft.
Der __PI__ benötigt Internet, das NFC-Lesegerät [ACR1251U USB NFC Reader II](http://www.acs.com.hk/en/products/218/acr1251u-usb-nfc-reader-ii/) sowie einen Monitor zur Anzeige.

## Nutzung
Zurzeit ist die Adresse der API auf die IP-Adresse von Davids Mac gesetzt.
Um dies zu ändern müssen in der Datei `start` die export-Zeilen auskommentiert werden um den Default zu erreichen.

Um Änderungen auf dem PI zu machen wird das git-Repo gepullt. Dazu muss man sich per ssh mit dem PI verbinden und im Ordner `home/pi/teamcontrol-reader` ein `git pull` durchführen. Im Anschluss muss die Datei `start` wieder ausführbar gemacht werden `sudo chmod +x /home/pi/teamcontrol-reader/start`. 
