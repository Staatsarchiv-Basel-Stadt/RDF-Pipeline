#!/bin/sh
cd /usr/src/app
PATH=$PATH:/usr/local/bin
# run updates on source graph
/usr/local/bin/npm run updateSource
