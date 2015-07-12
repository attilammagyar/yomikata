Yomikata
========

Proof-of-concept utility for generating nicely printable Japanese reading
practice sheets from any text using nothing but a browser.

Tested with [Firefox 38][firefox].

  [firefox]: https://www.mozilla.org/en-US/firefox/new/

[Try it online][demo] ([generated sample][sample]), [download it
(ZIP)][download] to your desktop or smartphone, or build it on your GNU/Linux
system.

  [demo]: http://attilammagyar.github.io/yomikata/index.html
  [sample]: http://attilammagyar.github.io/yomikata/sample.html
  [download]: http://attilammagyar.github.io/yomikata/yomikata.zip

Using the ZIP
-------------

 1. [Download the ZIP file][download]
 2. Extract it into a folder.
 3. Open the `index.html` in Firefox (and create a bookmark so next time it's
    easier to find).

Build
-----

The following software are used for building:

 * Python 3.4
 * `python3-lxml`
 * `git`
 * `wget`
 * `make`

The command `make` will build everything in the `dist/yomikata` directory.

Acknowledgements
----------------

This software uses the [EDICT][edict] and [KANJIDIC][kanjidic] dictionary
files. These files are the property of the [Electronic Dictionary Research and
Development Group][edrdg] and are used in conformance with the Group's
[license][edrdglic].

This software uses [Takuya Asano][takuyaa]'s [JavaScript
implementation][kuromojijs] of the [Kuromoji][kuromoji] Japanese morphological
analyzer.

  [edict]: http://www.csse.monash.edu.au/~jwb/edict.html
  [kanjidic]: http://www.csse.monash.edu.au/~jwb/kanjidic.html
  [edrdg]: http://www.edrdg.org/
  [edrdglic]: http://www.edrdg.org/edrdg/licence.html

  [takuyaa]: https://github.com/takuyaa
  [kuromojijs]: https://github.com/takuyaa/kuromoji.js
  [kuromoji]: http://www.atilika.com/ja/products/kuromoji.html
