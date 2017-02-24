#!/bin/bash
xset -dpms     # disable DPMS (Energy Star) features.
xset s off     # disable screen saver  
xset s noblank # don't blank the video device
NODE_ENV=production npm start --prefix /home/pi/teamcontrol-reader/ &
matchbox-window-manager -use_cursor no -use_titlebar no &
while true; do
    rm -rf /home/$USER/.cache/
    rm -rf /home/$USER/.config/
    /usr/bin/midori -e Fullscreen -a "file:///home/pi/teamcontrol-reader/raspberry_startup/wait.html"
    sleep 1
done
