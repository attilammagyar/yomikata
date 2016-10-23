#!/bin/bash

set -e

function main()
{
    rm -vrf ./dist/gh-pages
    mkdir -v ./dist/gh-pages
    cp -vr ./dist/yomikata/* ./dist/gh-pages/
    cd dist && zip -r -9 gh-pages/yomikata.zip yomikata/ && cd -
    add_ads ./dist/gh-pages/index.html
    add_ads ./dist/gh-pages/demo.html
}

function add_ads()
{
    local filename="$1"

    echo "Adding ads to $filename"
    mv -v "$filename" "$filename.orig"
    cat "$filename.orig" \
        | while read
          do
              if [[ "$REPLY" =~ div.id=.ad.../div ]]
              then
                  cat <<ADS
    <div id="ad">
<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<!-- yomikata -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-4080687422709971"
     data-ad-slot="8577474856"
     data-ad-format="auto"></ins>
<script>
(adsbygoogle = window.adsbygoogle || []).push({});
</script>
    </div>
ADS
              else
                  echo "$REPLY"
              fi
          done > "$filename"
    rm -v "$filename.orig"
}

main "$@"
