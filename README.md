Yomikata
========

Proof-of-concept utility for generating nicely printable Japanese reading
practice sheets from any text using nothing but a browser.

Tested with [Firefox 38][firefox].

  [firefox]: https://www.mozilla.org/en-US/firefox/new/

[Try it online][demo] ([generated sample][sample]), [download it
(ZIP)][download] to your desktop or smartphone, or build it on your GNU/Linux
system.

  [demo]: http://attilammagyar.github.io/yomikata/demo.html
  [sample]: http://attilammagyar.github.io/yomikata/sample.html
  [download]: http://attilammagyar.github.io/yomikata/yomikata.zip

Using the ZIP
-------------

 1. [Download the ZIP file][download]
 2. Extract it into a folder.
 3. Open the `index.html` in [Firefox][firefox] (and create a bookmark so next
    time it's easier to find).

How does it differ from [Google Translate][gt]?
----------------------------------------------

Using [Google Translate][gt] as a reading practice? [Surely you can't be
serious][surely].

  [gt]: https://translate.google.com
  [surely]: https://www.youtube.com/watch?v=B_XuPXGMpLA

 * Furigana is displayed for the first occurrence of each kanji in each
   paragraph. No roomaji. This is as close to a reading practice textbook as
   you can get, except for having complete freedom in choosing the text you
   want to practice with.

 * You have to translate the overall text for yourself, since Yomikata does not
   try to convert the Japanese text into broken English for you, it just makes
   it quicker to find dictionary translations for each word (except for some
   very basic ones). Some brainwork surely won't hurt during reading practice.

 * Print out the generated practice sheets or use them offline. Studying
   offline is a great way to eliminate all the distractions that modern gadgets
   provide. (Did you open the link to that YouTube video above? That's what
   I'm talking about.)

 * You can generate customized word lists from the text that can be later fed
   into popular flashcard/SRS apps or that you can use to customize the next
   practice sheet.

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
