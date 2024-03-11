#!/usr/bin/python3

import sys
import json
import gzip

from lxml import etree


HEADER = """
/* Automatically generated from JMdict                                        */
/* http://www.edrdg.org/jmdict/edict_doc.html                                 */
/*                                                                            */
/* License: CC-BY-SA-3.0                                                      */
/* http://creativecommons.org/licenses/by-sa/3.0/legalcode                    */
/*                                                                            */
/* Format:                                                                    */
/*                                                                            */
/* (function() {                                                              */
/* window.JMdict = {                                                          */
/*   "annotation_definitions": {                                              */
/*     "ann1": "explanation1",                                                */
/*     "ann2": "explanation2",                                                */
/*     ...                                                                    */
/*   },                                                                       */
/*   "annotations": ["ann1", "ann2", "ann3", ... ],                           */
/*   "readings": ["read1", "read2", "read3", ... ],                           */
/*   "entries": [                                                             */
/*    "READ_IDX1;READ_IDX2\\nANN_IDX1;ANN_IDX2|mean1; mean2\\nANN_IDX2|mean3",*/
/*    ...                                                                     */
/*   ],                                                                       */
/*   "dictionary_trie": {                                                     */
/*     "w": {                                                                 */
/*       "r": {                                                               */
/*         "i": {                                                             */
/*           "t": {                                                           */
/*             "": ENTRY_IDX1,                                                */
/*             "e": {                                                         */
/*               "": [ENTRY_IDX2, ENTRY_IDX3]                                 */
/*             },                                                             */
/*             "i": {                                                         */
/*               "n": {                                                       */
/*                 "g": {                                                     */
/*                   "": ENTRY_IDX4                                           */
/*                 }                                                          */
/*               }                                                            */
/*             }                                                              */
/*           }                                                                */
/*         }                                                                  */
/*       }                                                                    */
/*     }                                                                      */
/*   }                                                                        */
/* };                                                                         */
/* })();                                                                      */
(function () {
"""

TAIL = """
})();
"""


class JMdict:
    ENTRY_XPATH = etree.XPath("/JMdict/entry")
    READINGS_XPATH = etree.XPath("r_ele/reb")
    KANJI_XPATH = etree.XPath("k_ele/keb")
    SENSES_XPATH = etree.XPath("sense")
    GLOSS_XPATH = etree.XPath("gloss[count(@xml:lang)=0 or @xml:lang='eng']")
    MISC_XPATH = etree.XPath("misc")
    POS_XPATH = etree.XPath("pos")

    INCLUDE_KANA = "us. kana"

    ANNOTATIONS = {
        "martial arts": "martial arts term",
        "rude": "rude or X-rated term (not displayed in educational software)",
        "abbr.": "abbreviation",
        "adj.": "adjective (keiyoushi)",
        "yoi-adj.": "adjective (keiyoushi) - yoi/ii class",
        "adjn..": "adjectival nouns or quasi-adjectives (keiyodoshi)",
        "no-n.": "nouns which may take the genitive case particle `no'",
        "pren.": "pre-noun adjectival (rentaishi)",
        "taru adj.": "`taru' adjective",
        "n./prenv.": "noun or verb acting prenominally",
        "adv.": "adverb (fukushi)",
        "to-adv.": "adverb taking the `to' particle",
        "arch.": "archaism",
        "ateji": "ateji (phonetic) reading",
        "aux.": "auxiliary",
        "auxv.": "auxiliary verb",
        "auxadj.": "auxiliary adjective",
        "Buddhist": "Buddhist term",
        "chem": "chemistry term",
        "child": "children's language",
        "coll.": "colloquialism",
        "comp.": "computer terminology",
        "conj.": "conjunction",
        "cop.": "copula",
        "cnt.": "counter",
        "der.": "derogatory",
        "ex-kanji": "exclusively kanji",
        "ex-kana": "exclusively kana",
        "phrase": "expressions (phrases, clauses, etc.)",
        "fam.": "familiar language",
        "fem.": "female term or language",
        "food": "food term",
        "geom.": "geometry term",
        "gikun/jukujikun": "gikun (meaning as reading) or jukujikun (special kanji reading)",
        "sonkeigo": "honorific or respectful (sonkeigo) language",
        "kenjougo": "humble (kenjougo) language",
        "irr. kanji": "word containing irregular kanji usage",
        "idiom.": "idiomatic expression",
        "irr. kana": "word containing irregular kana usage",
        "interj.": "interjection (kandoushi)",
        "irr. okurigana": "irregular okurigana usage",
        "irr. verb": "irregular verb",
        "ling.": "linguistics terminology",
        "manga": "manga slang",
        "male": "male term or language",
        "male slang": "male slang",
        "math.": "mathematics",
        "mil.": "military",
        "n.": "noun (common) (futsuumeishi)",
        "advn.": "adverbial noun (fukushitekimeishi)",
        "sufn.": "noun, used as a suffix",
        "prefn.": "noun, used as a prefix",
        "tempn.": "noun (temporal) (jisoumeishi)",
        "num.": "numeric",
        "out-dated kanji": "word containing out-dated kanji",
        "obsolete": "obsolete term",
        "obscure": "obscure term",
        "obs. kana": "out-dated or obsolete kana usage",
        "old kana": "old or irregular kana form",
        "ono.": "onomatopoeic or mimetic word",
        "pron.": "pronoun",
        "poet": "poetical term",
        "teineigo": "polite (teineigo) language",
        "pref.": "prefix",
        "prov.": "proverb",
        "part.": "particle",
        "phys.": "physics terminology",
        "rare": "rare",
        "sensitive": "sensitive",
        "slang": "slang",
        "suffix": "suffix",
        "us. kanji": "word usually written using kanji alone",
        "us. kana": "word usually written using kana alone",
        "uncls.": "unclassified",
        "yojijukugo": "yojijukugo",
        "v1.": "Ichidan verb",
        "v1s.": "Ichidan verb - kureru special class",
        "v2.": "Nidan verb with 'u' ending (archaic)",
        "v4fu.": "Yodan verb with `hu/fu' ending (archaic)",
        "v4ru.": "Yodan verb with `ru' ending (archaic)",
        "v5aru.": "Godan verb - -aru special class",
        "v5bu.": "Godan verb with `bu' ending",
        "v5gu.": "Godan verb with `gu' ending",
        "v5ku.": "Godan verb with `ku' ending",
        "v5iku.": "Godan verb - Iku/Yuku special class",
        "v5mu.": "Godan verb with `mu' ending",
        "v5nu.": "Godan verb with `nu' ending",
        "v5ru.": "Godan verb with `ru' ending",
        "v5ruirr.": "Godan verb with `ru' ending (irregular verb)",
        "v5su.": "Godan verb with `su' ending",
        "v5tsu.": "Godan verb with `tsu' ending",
        "v5u.": "Godan verb with `u' ending",
        "v5uspec.": "Godan verb with `u' ending (special class)",
        "v5uru.": "Godan verb - Uru old class verb (old form of Eru)",
        "v1zuru.": "Ichidan verb - zuru verb (alternative form of -jiru verbs)",
        "vi.": "intransitive verb",
        "vkuru.": "Kuru verb - special class",
        "vnuirr.": "irregular nu verb",
        "vnuriirr.": "irregular ru verb, plain form ends with -ri",
        "suru": "noun or participle which takes the aux. verb suru",
        "vsu.": "su verb - precursor to the modern suru",
        "vsuruspec.": "suru verb - special class",
        "vsuruirr.": "suru verb - irregular",
        "Kyoto-ben": "Kyoto-ben",
        "Osaka-ben": "Osaka-ben",
        "Kansai-ben": "Kansai-ben",
        "Kantou-ben": "Kantou-ben",
        "Tosa-ben": "Tosa-ben",
        "Touhoku-ben": "Touhoku-ben",
        "Tsugaru-ben": "Tsugaru-ben",
        "Kyuushuu-ben": "Kyuushuu-ben",
        "Ryuukyuu-ben": "Ryuukyuu-ben",
        "Nagano-ben": "Nagano-ben",
        "Hokkaido-ben": "Hokkaido-ben",
        "vt.": "transitive verb",
        "vulg.": "vulgar expression or word",
        "kari-adj.": "`kari' adjective (archaic)",
        "ku-adj.": "`ku' adjective (archaic)",
        "shiku-adj.": "`shiku' adjective (archaic)",
        "na-adj. arch.": "archaic/formal form of na-adjective",
        "prop. noun": "proper noun",
        "v.": "verb unspecified",
        "v4ku.": "Yodan verb with `ku' ending (archaic)",
        "v4gu.": "Yodan verb with `gu' ending (archaic)",
        "v4su.": "Yodan verb with `su' ending (archaic)",
        "v4tsu.": "Yodan verb with `tsu' ending (archaic)",
        "v4nu.": "Yodan verb with `nu' ending (archaic)",
        "v4bu.": "Yodan verb with `bu' ending (archaic)",
        "v4mu.": "Yodan verb with `mu' ending (archaic)",
        "uv2ku.": "Nidan verb (upper class) with `ku' ending (archaic)",
        "uv2gu.": "Nidan verb (upper class) with `gu' ending (archaic)",
        "uv2tsu.": "Nidan verb (upper class) with `tsu' ending (archaic)",
        "uv2dzu.": "Nidan verb (upper class) with `dzu' ending (archaic)",
        "uv2fu.": "Nidan verb (upper class) with `hu/fu' ending (archaic)",
        "uv2bu.": "Nidan verb (upper class) with `bu' ending (archaic)",
        "uv2mu.": "Nidan verb (upper class) with `mu' ending (archaic)",
        "uv2yu.": "Nidan verb (upper class) with `yu' ending (archaic)",
        "uv2ru.": "Nidan verb (upper class) with `ru' ending (archaic)",
        "lv2ku.": "Nidan verb (lower class) with `ku' ending (archaic)",
        "lv2gu.": "Nidan verb (lower class) with `gu' ending (archaic)",
        "lv2su.": "Nidan verb (lower class) with `su' ending (archaic)",
        "lv2zu.": "Nidan verb (lower class) with `zu' ending (archaic)",
        "lv2tsu.": "Nidan verb (lower class) with `tsu' ending (archaic)",
        "lv2dzu.": "Nidan verb (lower class) with `dzu' ending (archaic)",
        "lv2nu.": "Nidan verb (lower class) with `nu' ending (archaic)",
        "lv2fu.": "Nidan verb (lower class) with `hu/fu' ending (archaic)",
        "lv2bu.": "Nidan verb (lower class) with `bu' ending (archaic)",
        "lv2mu.": "Nidan verb (lower class) with `mu' ending (archaic)",
        "lv2yu.": "Nidan verb (lower class) with `yu' ending (archaic)",
        "lv2ru.": "Nidan verb (lower class) with `ru' ending (archaic)",
        "lv2we.": "Nidan verb (lower class) with `u' ending and `we' conjugation (archaic)",
        "architect.": "architecture term",
        "astro.": "astronomy, etc. term",
        "baseball": "baseball term",
        "bio.": "biology term",
        "botany.": "botany term",
        "bus.": "business term",
        "econ.": "economics term",
        "engineer.": "engineering term",
        "fin.": "finance term",
        "geo.": "geology, etc. term",
        "law": "law, etc. term",
        "mahjong": "mahjong term",
        "med.": "medicine, etc. term",
        "mus.": "music term",
        "Shinto": "Shinto term",
        "shogi": "shogi term",
        "sports": "sports term",
        "sumo": "sumo term",
        "zoo.": "zoology term",
        "hum.": "jocular, humorous term",
        "anatomy": "anatomical term",
    }
    ANNOTATION_ABREV = {value: key for key, value in ANNOTATIONS.items()}

    def process_xml(self, jmdict_xml):
        annotations = {}
        readings = {}
        entries = []
        dictionary = {}
        entry_idx = 0

        for entry in self.ENTRY_XPATH(jmdict_xml):
            entry_readings = self.__texts_from_xpath(entry, self.READINGS_XPATH)
            kanji = self.__texts_from_xpath(entry, self.KANJI_XPATH)
            definitions = []
            include_kana = not kanji

            for sense in self.SENSES_XPATH(entry):
                glosses = self.__texts_from_xpath(sense, self.GLOSS_XPATH)

                if len(glosses) == 0:
                    continue

                definition = "; ".join(glosses)
                entry_annotations = self.__extract_annotations(sense)

                if self.INCLUDE_KANA in "".join(entry_annotations):
                    include_kana = True

                for annotation in entry_annotations:
                    if annotation not in annotations:
                        annotations[annotation] = len(annotations)

                definitions.append(
                    "{}|{}".format(
                        ";".join(str(annotations[a]) for a in entry_annotations),
                        definition
                    )
                )

            for key in kanji + (entry_readings if include_kana else ()):
                self.__add_to_dictionary(dictionary, key, entry_idx)

            for reading in entry_readings:
                if reading not in readings:
                    readings[reading] = len(readings)

            entries.append(
                "{}\n{}".format(
                    ";".join(str(readings[r]) for r in entry_readings),
                    "\n".join(definitions)
                )
            )
            entry_idx += 1

            if entry_idx % 5000 == 0:
                print("{} entries done".format(entry_idx), file=sys.stderr);

        annotations = [a for a, _ in sorted(annotations.items(), key=lambda a: a[1])]
        readings = [r for r, _ in sorted(readings.items(), key=lambda r: r[1])]

        return {
            "annotation_definitions": self.ANNOTATIONS,
            "annotations": annotations,
            "readings": readings,
            "entries": entries,
            "dictionary_trie": dictionary,
        }

    def __extract_annotations(self, sense):
        pos = self.__texts_from_xpath(sense, self.POS_XPATH)
        info = self.__texts_from_xpath(sense, self.MISC_XPATH)

        return tuple(self.ANNOTATION_ABREV.get(a, a) for a in (pos + info))

    def __texts_from_xpath(self, element, xpath):
        return tuple(str(e.text).strip() for e in (xpath(element) or ()))

    def __add_to_dictionary(self, dictionary, key, entry_idx):
        node = dictionary

        for char in key:
            node = node.setdefault(char, {})

        if "" in node:
            if not isinstance(node[""], list):
                node[""] = [node[""]]
            node[""].append(entry_idx)
        else:
            node[""] = entry_idx


def main(argv):
    if len(argv) < 2:
        print("Usage: {} path/to/JMdict.gz".format(argv[0]), file=sys.stderr)
        return 1

    jmdict_gz = argv[1]
    jmdict = JMdict().process_xml(etree.parse(gzip.open(jmdict_gz, mode="r")))

    print(HEADER)
    print("window.JMdict = " + json.dumps(jmdict) + ";")
    print(TAIL)

    print(
        "annotations: {}, readings: {}, entries: {}".format(
            len(jmdict["annotations"]),
            len(jmdict["readings"]),
            len(jmdict["entries"])
        ),
        file=sys.stderr
    )


if __name__ == "__main__":
    sys.exit(main(sys.argv))
