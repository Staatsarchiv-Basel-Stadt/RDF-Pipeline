 curl -X PUT \
     -n \
     -H Content-Type:text/turtle \
     -T  metadata/meta.ttl \
     -G $SINK_ENDPOINT_URL \
     --data-urlencode graph=https://ld.staatsarchiv.bs.ch/graph/ais-metadata
