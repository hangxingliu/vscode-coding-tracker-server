#!/usr/bin/env bash

PORT=8765

xdg-open "http://localhost:${PORT}/report/"
clear
npm start -s -- "--port=${PORT}" --public-report --output="$HOME/.coding-tracker"
