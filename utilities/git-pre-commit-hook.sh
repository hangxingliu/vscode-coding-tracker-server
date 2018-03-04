#!/usr/bin/env bash

npm run test -s -- --reporter=list
CODE=$?
if [[ "$CODE" == "0" ]]; then
	echo -e "\e[1;32m  npm test success! \e[0m"
else
	echo -e "\e[1;31m  npm test failed with exit code: ${CODE} \e[0m"
fi
exit $CODE
