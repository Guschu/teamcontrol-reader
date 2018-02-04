# TeamControl Reader

Die **Lesestation** für das Projekt [TeamControl](https://github.com/Race4Hospiz/teamcontrol).

Aufgabe der Lesestation ist es RFID-Tags zu lesen und an den Server zu schicken.

## Installation
Es ist vorgesehen, dass die Lesestation auf einem __Raspberry-PI__ __3__ __Model__ __B__ läuft. Der __PI__ benötigt Internet, ein Lesegerät und einen Monitor zur Anzeige.

### Development

Es wird benötigt:

- npm
- node

Vor dem Start:

- `npm install`

In `bin/www` muss `devStartURL` richtig gesetzt werden.

Danach kann mit `npm start` das Terminal gestartet werden

### Production

Der folgende Befehl initialisiert alle Raspbery PI die in der Datei `provisioning/inventory` namentlich genannt sind.

    cd provisioning && ansible-playbook -i inventory playbook.yml

## Momentan unterstützte Reader:

- [PROMAG PCR300M](http://www.promageurope.com/products/rfid-readers-and-writers/rfid-reader-pcr300.htm)
  - Mögliche Befehle an den Reader sind in den [docs](docs) zu finden
