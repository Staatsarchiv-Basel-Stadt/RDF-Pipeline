#!/bin/sh
cd /usr/src/app
PATH=$PATH:/usr/local/bin
# run updated source graph to file
/usr/local/bin/npm run stabs:file
# upload n-triples to endpoint
./shell/upload-curl.sh
