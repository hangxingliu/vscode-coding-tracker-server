#!/usr/bin/env bash

PORT=8765

echo -e "[INFO] Start debug server using data in \"\$HOME/.coding-tracker\"";
echo -e "[INFO]     parameter \"open\" could open browser automatically"

if [[ "$*" == *open* ]]; then
	xdg-open "http://localhost:${PORT}/report/";
fi

npm start -s -- "--port=${PORT}" --public-report --output="$HOME/.coding-tracker"
