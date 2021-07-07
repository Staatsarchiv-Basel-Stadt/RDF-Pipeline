#!/bin/bash

FIRST=true

mkdir input
cd input
split -l 100000 --additional-suffix=.nt ../scope.nt
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
      -n \
      -H Content-Type:application/n-triples \
      -T $file \
      -G $SINK_ENDPOINT_URL \
      --data-urlencode graph=https://ld.staatsarchiv.bs.ch/graph/ais-metadata
  else
    echo "POSTing to "$SINK_ENDPOINT_URL
    curl -X POST \
      -n \
      -H Content-Type:application/n-triples \
      -T $file \
      -G $SINK_ENDPOINT_URL \
      --data-urlencode graph=https://ld.staatsarchiv.bs.ch/graph/ais-metadata
  fi 

done;

rm -rf input

