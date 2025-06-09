FROM alpine:latest

RUN apk add --no-cache perl perl-utils make wget tar && \
    wget https://exiftool.org/Image-ExifTool-13.30.tar.gz && \
    tar -xzf Image-ExifTool-13.30.tar.gz && \
    cd Image-ExifTool-13.30 && \
    perl Makefile.PL && make install && \
    cd .. && rm -rf Image-ExifTool-13.30*

ENTRYPOINT ["exiftool"]