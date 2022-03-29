#!/bin/sh
cd /usr/src/app
PATH=$PATH:/usr/local/bin
/usr/local/bin/npm run updateSource
/usr/local/bin/npm run stabs:file
./shell/upload-curl.sh
