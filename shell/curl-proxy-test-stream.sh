cat metadata/void.ttl | curl -s -n -X PUT -H "Content-Type:text/turtle" -T - -G $SINK_ENDPOINT_URL --data-urlencode graph=https://ld.staatsarchiv.bs.ch/graph/ais-metadata
