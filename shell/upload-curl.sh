 curl -X PUT \
     -n \
     -H Content-Type:application/n-triples \
     -T  scope.nt \
     -G $SINK_ENDPOINT_URL \
     --data-urlencode graph=https://ld.staatsarchiv.bs.ch/graph/ais-metadata
