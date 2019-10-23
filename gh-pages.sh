#!/bin/bash

set -e

function main()
{
    rm -vrf ./dist/gh-pages
    mkdir -v ./dist/gh-pages
    cp -vr ./dist/yomikata/* ./dist/gh-pages/
    cd dist && zip -r -9 gh-pages/yomikata.zip yomikata/ && cd -
}

main "$@"
