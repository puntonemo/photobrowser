#!/bin/sh
# Uso: ./run-docker-exiftool.sh <relativePath> <absoluteRootPath>

docker run --rm \
  -v "$2":/data \
  exiftool-local \
  -json "/data/$1"