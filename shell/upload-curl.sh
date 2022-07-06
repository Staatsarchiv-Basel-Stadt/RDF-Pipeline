#!/bin/bash

set -ueo pipefail

FIRST=true

mkdir -p input
cd input
rm -f *
split -l 40000 --additional-suffix=.nt ../scope.nt
cd ..

for file in ./input/*
do
  filename=$(basename "$file")
  echo "Processing "$filename
  if [ $FIRST == true ]
  then
    echo "PUTing to "$SINK_ENDPOINT_URL
    FIRST=false
    curl -X PUT \
      --noproxy $SOURCE_HOSTNAME \
      --fail \
      -n \
      -H Content-Type:application/n-triples \
      -T $file \
      -G $SINK_ENDPOINT_URL \
      --data-urlencode graph=https://ld.staatsarchiv.bs.ch/graph/ais-metadata
  else
    echo "POSTing to "$SINK_ENDPOINT_URL
    curl -X POST \
      --noproxy $SOURCE_HOSTNAME \
      --fail \
      -n \
      -H Content-Type:application/n-triples \
      -T $file \
      -G $SINK_ENDPOINT_URL \
      --data-urlencode graph=https://ld.staatsarchiv.bs.ch/graph/ais-metadata
  fi

done;
