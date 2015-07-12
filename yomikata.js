(function () {

function $(id)
{
    return document.getElementById(id);
}

var yomikata;

yomikata = {
    DIC_PATH: "kuromojijs/dict/",

    HTML_HEAD: "",
    HTML_TAIL: "",

    KANJI_RE: /[\u4e00-\u9faf\u3400-\u4dbf]/,

    BLACKLIST: { // basic words and common particles that make vocab lists noisy
        "て": 0,
        "た": 0,
        "ない": 0,
        "かった": 0,

        "は": 0,
        "が": 0,
        "と": 0,
        "に": 0,
        "へ": 0,
        "で": 0,
        "を": 0,
        "の": 0,
        "ん": 0,
        "な": 0,
        "か": 0,
        "も": 0,
        "や": 0,
        "ね": 0,
        "よ": 0,
        "し": 0,
        "から": 0,
        "まで": 0,

        "まだ": 0,
        "これ": 0,
        "それ": 0,
        "あれ": 0,
        "どれ": 0,
        "どう": 0,
        "そう": 0,
        "こちら": 0,
        "そちら": 0,
        "あちら": 0,
        "どちら": 0,
        "この": 0,
        "その": 0,
        "あの": 0,
        "じゃあ": 0,
        "さあ": 0,
        "だ": 0,
        "です": 0,

        "いい": 0,
        "こと": 0,
        "もの": 0,
        "でも": 0,
        "けど": 0,
        "けれど": 0,
        "じゃ": 0,
        "ます": 0,
        "じゃあ": 0,
        "いる": 0,
        "ある": 0
    },

    timer: null,
    tokenizer: null,

    initialize: function ()
    {
        var open = $("open"),
            save = $("save");

        yomikata.timer = setInterval(yomikata.update_dictionary_status, 1000);
        setTimeout(yomikata.initialize_tokenizer, 300);

        open.onclick = yomikata.open;
        save.onclick = yomikata.save;
    },

    bind: function (func, obj)
    {
        return function () {
            return func.apply(obj, arguments);
        };
    },

    is_tokenizer_loaded: function ()
    {
        return yomikata.tokenizer !== null;
    },

    is_dictionary_loaded: function ()
    {
        return window.hasOwnProperty("JMdict");
    },

    initialize_tokenizer: function ()
    {
        kuromoji.builder({"dicPath": yomikata.DIC_PATH}).build(
            yomikata.update_tokenizer_status
        );
    },

    update_dictionary_status: function ()
    {
        if (!yomikata.is_dictionary_loaded()) {
            return;
        }

        clearInterval(yomikata.timer);
        yomikata.timer = null;
        $("loading-dictionary-status").innerHTML = "done";

        yomikata.update_loading_progress();
    },

    update_loading_progress: function ()
    {
        if (yomikata.is_dictionary_loaded() && yomikata.is_tokenizer_loaded()) {
            yomikata.enable_ui();
        }
    },

    enable_ui: function ()
    {
        $("splashscreen").className = "hidden";
        $("ui").className = "";
    },

    update_tokenizer_status: function (error, _tokenizer)
    {
        if (error) {
            alert(error);
            return;
        }

        yomikata.tokenizer = _tokenizer;
        $("loading-tokenizer-status").innerHTML = "done";

        yomikata.update_loading_progress();
    },

    open: function ()
    {
        this.setAttribute(
            "href",
            yomikata.process_text($("japanese-text").value)
        );

        return true;
    },

    save: function ()
    {
        var title = String($("title").value);

        this.setAttribute(
            "href",
            yomikata.process_text($("japanese-text").value)
        );
        this.setAttribute("download", title + ".html");

        return true;
    },

    process_text: function (text)
    {
        return yomikata.html_to_data_url(
            yomikata.generate_html(
                yomikata.parse_text(text)
            )
        );
    },

    html_to_data_url: function (html)
    {
        var binary = unescape(encodeURIComponent(html));
        return "data:text/html;charset=utf-8;base64," + btoa(binary);
    },

    generate_html: function (paragraphs)
    {
        var title = $("title").value || "yomikata";

        return [
            yomikata.HTML_HEAD.replace("{{TITLE}}", title),
            yomikata.format_paragraphs(paragraphs),
            yomikata.HTML_TAIL
        ].join("");
    },

    parse_text: function (text)
    {
        var paragraphs = text.split(/\n\n+/).filter(yomikata.is_not_empty),
            i, l;

        return paragraphs.map(yomikata.parse_paragraph);
    },

    is_not_empty: function (str)
    {
        return str != "";
    },

    parse_paragraph: function (paragraph)
    {
        var tokens = yomikata.tokenizer.tokenize(paragraph),
            parsed_tokens = [],
            writings = [],
            seen = {},
            parsed_token,
            i, l, t, b, s;

        for (i = 0, l = tokens.length; i < l; ++i) {
            t = tokens[i];
            b = t["basic_form"];
            s = t["surface_form"];

            parsed_token = {
                "token": s,
                "reading": null
            };

            if (t["word_type"] === "KNOWN" && (!seen.hasOwnProperty(b))) {
                seen[b] = true;
                writings.push(b);

                if (yomikata.KANJI_RE.test(s)) {
                    parsed_token["reading"] = t["reading"];
                }
            }

            parsed_tokens.push(parsed_token);
        }

        return {
            "tokens": parsed_tokens,
            "words": writings.map(yomikata.lookup_by_writing)
        };
    },

    lookup_by_writing: function (writing)
    {
        var entries = [],
            entry_ids,
            i, l;

        if (
            yomikata.BLACKLIST.hasOwnProperty(writing)
            || (!JMdict["dictionary"].hasOwnProperty(writing))
        ) {
            return entries;
        }

        entry_ids = JMdict["dictionary"][writing];

        if (typeof(entry_ids) === "number") {
            entry_ids = [entry_ids];
        }

        for (i = 0, l = entry_ids.length; i < l; ++i) {
            entries.push(yomikata.build_entry(writing, entry_ids[i]));
        }

        return entries;
    },

    build_entry: function (writing, entry_id)
    {
        var entry = JMdict["entries"][entry_id],
            lines, readings, meanings;

        lines = entry.split("\n");
        readings = yomikata.collect_readings(writing, lines.shift());
        meanings = yomikata.collect_meanings(lines);

        return {
            "writing": writing,
            "readings": readings,
            "meanings": meanings
        };
    },

    collect_readings: function (writing, reading_ids_str)
    {
        var readings;

        readings = yomikata.collect_from_jmdict("readings", reading_ids_str);

        if (readings.length === 1 && readings[0] === writing) {
            readings = [];
        }

        return readings;
    },

    collect_meanings: function (meaning_lines)
    {
        var meanings = [],
            i, l;

        for (i = 0, l = meaning_lines.length; i < l; ++i) {
            line_parts = meaning_lines[i].split("|");
            meanings.push(yomikata.build_meaning(line_parts[0], line_parts[1]));
        }

        return meanings;
    },

    build_meaning: function (annotation_ids_str, meaning)
    {
        return {
            "annotations": yomikata.collect_annotations(annotation_ids_str),
            "meaning": meaning
        };
    },

    collect_annotations: function (ids_str)
    {
        var annotations = [],
            abbrs = yomikata.collect_from_jmdict("annotations", ids_str),
            i, l;

        for (i = 0, l = abbrs.length; i < l; ++i) {
            annotations.push(yomikata.build_annotation(abbrs[i]));
        }

        return annotations;
    },

    build_annotation: function (abbr)
    {
        var definitions = JMdict["annotation_definitions"],
            expl;

        expl = definitions.hasOwnProperty(abbr) ? definitions[abbr] : "";

        return {
            "abbreviation": abbr,
            "explanation": expl
        };
    },

    collect_from_jmdict: function (list_id, ids_str)
    {
        var list = JMdict[list_id],
            ids = ids_str.split(";"),
            items = [],
            i, l;

        for (i = 0, l = ids.length; i < l; ++i) {
            items.push(list[Number(ids[i])]);
        }

        return items;
    },

    format_paragraphs: function (paragraphs)
    {
        return paragraphs.map(yomikata.format_paragraph).join("");
    },

    format_paragraph: function (paragraph, words)
    {
        return [
            '<div class="paragraph">',
                '<p>',
                    yomikata.format_tokens(paragraph["tokens"]),
                '</p>',
                '<div class="vocab">',
                    ].concat(
                        paragraph["words"].map(yomikata.format_entries)
                    ).concat([
                '</div>',
            '</div>'
        ]).join("");
    },

    format_tokens: function (tokens)
    {
        var html = [],
            i, l, t, f;

        for (i = 0, l = tokens.length; i < l; ++i) {
            t = tokens[i];

            if (t["reading"] !== null) {
                f = [
                    "<ruby>",
                        yomikata.quote(t["token"]),
                        "<rt>",
                            yomikata.quote(t["reading"]),
                        "</rt>",
                    "</ruby>"
                ];
            } else {
                f = [
                    (t["token"] == "\n") ? "<br />" : yomikata.quote(t["token"])
                ];
            }

            html.push(f.join(""));
        }

        return html.join("");
    },

    format_entries: function (entries)
    {
        return entries.map(yomikata.format_entry).join("");
    },

    format_entry: function (entry)
    {
        var html = [],
            writing = yomikata.quote(entry["writing"]);

        html.push('<dl>');

        if (entry["readings"].length > 0) {
            html = html.concat([
                '<dt>',
                    writing,
                    '<small>',
                        "【",
                        yomikata.format_readings(entry["readings"]),
                        "】",
                    '</small>',
                '</dt>',
            ]);
        } else {
            html = html.concat(['<dt>', writing, '</dt>']);
        }

        return html.concat([
                '<dd>',
                    '<ul>',
                        yomikata.format_meanings(entry["meanings"]),
                    '</ul>',
                '</dd>',
            '</dl>',
        ]).join("");
    },

    format_readings: function (readings)
    {
        return readings.map(yomikata.quote).join("; ");
    },

    format_meanings: function (meanings)
    {
        return meanings.map(yomikata.format_meaning).join("");
    },

    format_meaning: function (meaning)
    {
        return [
            "<li>",
                yomikata.format_annotations(meaning["annotations"]),
                "\n",
                yomikata.quote(meaning["meaning"]),
            "</li>"
        ].join("");
    },

    format_annotations: function (annotations)
    {
        var html = [],
            last_index = annotations.length - 1,
            i, l;

        for (i = 0, l = annotations.length; i < l; ++i) {
            html.push(
                yomikata.format_annotation(annotations[i], i >= last_index)
            );
        }

        return html.join("");
    },

    format_annotation: function (annotation, is_last)
    {
        var html;

        if (annotation["explanation"] !== "") {
            html = [
                '<small title="',
                    yomikata.quote(annotation["explanation"]),
                '">'
            ];
        } else {
            html = ['<small>'];
        }

        return html.concat([
                yomikata.quote(annotation["abbreviation"]),
                is_last ? "" : "; ",
            "</small>",
        ]).join("");
    },

    quote: function (str)
    {
        return (String(str)
            .replace("&", "&amp;")
            .replace("'", "&#039;")
            .replace('"', "&quot;")
            .replace(">", "&gt;")
            .replace("<", "&lt;")
        );
    },

    _: null
}

yomikata.HTML_HEAD = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
        '<title>{{TITLE}}</title>',
        '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />',
        '<meta charset="utf-8" />',
        '<style>',
        '* {',
            'margin: 0;',
            'padding: 0;',
        '}',
    '',
        'html, body {',
            'background-color: #ffffff;',
            'color: #000000;',
        '}',
    '',
        'body {',
            'padding: 10px;',
        '}',
    '',
        '.paragraph {',
            'display: block;',
            'break-inside: avoid;',
            'page-break-inside: avoid;',
            '-webkit-column-break-inside: avoid;',
        '}',
    '',
        '.paragraph p {',
            'display: block;',
            'margin-right: 2%;',
            'margin: 2%;',
            'line-height: 150%;',
        '}',
    '',
        '.paragraph .vocab {',
            'font-size: 80%;',
            '-webkit-column-count: 2;',
            '-moz-column-count: 2;',
            'column-count: 2;',
        '}',
    '',
        '.paragraph .vocab dl,',
        '.paragraph .vocab dl dt,',
        '.paragraph .vocab dl dd,',
        '.paragraph .vocab dl dd ul,',
        '.paragraph .vocab dl dd ul li {',
            'display: inline;',
        '}',
    '',
        '.paragraph .vocab dl {',
            'padding: 0.2em;',
            'line-height: 1.2em;',
        '}',
    '',
        '.paragraph .vocab dl:before {',
            'content: " \\2022 ";',
        '}',
    '',
        '.paragraph .vocab dl dt {',
            'white-space: nowrap;',
        '}',
    '',
        '.paragraph .vocab dl dd {',
            'font-size: 80%;',
        '}',
    '',
        '.paragraph .vocab dl dd small {',
            'font-size: 75%;',
        '}',
    '',
        '.paragraph .vocab dl dd ul li:before {',
            'content: " \\25e6 ";',
        '}',
    '',
        '#print {',
            'text-align: center;',
        '}',
    '',
        '@media print {',
            '#print {',
                'display: none;',
            '}',
        '}',
        '</style>',
    '</head>',
    '<body>',
        '<div id="print">',
            '<form action="#">',
                '<button onclick="window.print()">Print (Ctrl+P)</button>',
            '</form>',
        '</div>'
].join("");

yomikata.HTML_TAIL = [
    '</body>',
    '</html>'
].join("");

window.onload = yomikata.initialize;

})();
