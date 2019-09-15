# Staatsarchiv-BS Linked Data

This repository builds a docker-container for Staatsarchiv Basel Stadt.
It contains a bunch of scripts that are executed to:
* pull the latest configuration for mapping the Scope Oracle database to Linked Data
* materialize this mapping into the internal Stardog server (using R2RML)
* write the materialized, public data to LINDAS

