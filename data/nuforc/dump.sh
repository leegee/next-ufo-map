#!/usr/bin/env bash
set -e
export DUMP_DIR=./pg-dump

cd ${DUMP_DIR}

shopt -s nullglob
files=(*.sql*)
if [[ ${#files[@]} -gt 0 ]]; then
    rm *.sql*
fi

pg_dump -d noforc | split -b 50m - noforc_part.sql
