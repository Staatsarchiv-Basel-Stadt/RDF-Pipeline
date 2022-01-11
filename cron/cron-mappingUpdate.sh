#!/bin/sh

set -eu

echo "\n\nRuning mapping update…"
date

# pull the repo with the mappings
OLD_DIR=$(pwd)
cd /opt/StABS-scope2RDF
GIT_PREVIOUS_SHA=$(git log --format="%H" -n 1)
git pull origin "${git_branch}"
GIT_CURRENT_SHA=$(git log --format="%H" -n 1)
cd "${OLD_DIR}"

# check for changes
echo "Git SHA:"
echo "- before pull: ${GIT_PREVIOUS_SHA}"
echo "- after pull:  ${GIT_CURRENT_SHA}"
if [ "${GIT_PREVIOUS_SHA}" = "${GIT_CURRENT_SHA}" ]; then
  echo "-> SHA are the same, no changes detected, ignore."
  exit 0
fi
echo "-> SHA are not the same, changes detected."

# replace the virtual mapping if some changes were detected
echo "Replacing virtual mapping…"
/opt/stardog/bin/stardog-admin \
  --server "${SOURCE_CONNECTIONSTRING}" \
  virtual add \
  --name scope-virtual \
  --format r2rml \
  --overwrite \
  --passwd "${SOURCE_ENDPOINT_PASSWORD}" \
  --username "${SOURCE_ENDPOINT_USER}" \
  /usr/src/app/credentials/scope-virtual.properties \
  /opt/StABS-scope2RDF/src-gen/mapping-stabs.r2rml.ttl

echo "End of job."
exit 0
