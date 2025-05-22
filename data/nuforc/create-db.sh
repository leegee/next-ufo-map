#!/usr/bin/env bash

# Gets a windows path for noforc.csv - replace this if you can.
PWD=$(pwd)
DRIVE_LC=$(echo "$PWD" | cut -c 2)
DRIVE_UC=$(echo "$PWD" | cut -c 2 | tr '[:lower:]' '[:upper:]')
PWD_WIN=$(echo "$PWD" | sed "s|^/$DRIVE_LC/|$DRIVE_UC:\\\\|")
PWD_WIN=$(echo "$PWD_WIN" | tr '/' '\\')
INPUT_CSV="$PWD_WIN\\noforc.csv"

echo $INPUT_CSV

# psql -c "DROP DATABASE IF EXISTS mufon"
psql -c "CREATE DATABASE noforc"
psql -d noforc < csv-schema.sql
psql -d noforc -c "COPY sightings FROM '$INPUT_CSV' WITH (FORMAT CSV, HEADER, NULL 'NA');"
psql -d noforc -c "SELECT COUNT(*) FROM sightings";
psql -d noforc < update.sql

# echo OK