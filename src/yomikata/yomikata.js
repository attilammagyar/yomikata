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
    vocab_selector_loader: null,

    initialize: function ()
    {
        var open = $("open"),
            save = $("save");
            customize_vocab = $("customize-vocab");

        yomikata.timer = setInterval(yomikata.update_dictionary_status, 1000);
        setTimeout(yomikata.initialize_tokenizer, 300);

        open.onclick = yomikata.open;
        save.onclick = yomikata.save;
        customize_vocab.onclick = yomikata.customize_vocab;
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
        yomikata.japanese_text_to_href_data_url(this);

        return true;
    },

    save: function ()
    {
        var title = String($("title").value);

        yomikata.japanese_text_to_href_data_url(this);
        this.setAttribute("download", title + ".html");

        return true;
    },

    customize_vocab: function ()
    {
        var vocab_table = $("vocab"),
            text = $("japanese-text").value,
            html = [],
            id = 0,
            blacklist = yomikata.build_blacklist(),
            words;

        $("customize-vocab").innerHTML = "Update vocab customizer";
        vocab_table.innerHTML = [
            '<tr>',
                '<td class="center" colspan="3">',
                    '<img class="loading" src="loading.gif" alt="Please wait..." />',
                '</td>',
            '</tr>',
        ].join("");
        vocab_table.style.display = "table";

        words = yomikata.parse_paragraph(text, "", yomikata.BLACKLIST)["words"];

        html = words.map(function (entries) {
            var writing;

            if (entries.length == 0) {
                return "";
            }

            writing = yomikata.quote(entries[0]["writing"]);
            ++id;

            return [
                "<tr>",
                    "<td>",
                        "<input id=\"vocab-checkbox-", String(id), "\" ",
                                "type=\"checkbox\" value=\"", writing, "\" ",
                                blacklist.hasOwnProperty(entries[0]["writing"])
                                    ? ""
                                    : "checked=\"checked\" ",
                                "/>",
                    "</td>",
                    "<td>",
                        "<label for=\"vocab-checkbox-", String(id), "\">",
                            writing,
                        "</label>",
                    "</td>",
                    "<td>",
                        "<ul>",
                            entries.map(function (word) {
                                return [
                                    "<li>",
                                        "<label for=\"vocab-checkbox-", String(id), "\">",
                                        (word["readings"].length > 0)
                                            ? "[" + yomikata.format_readings(word["readings"]) + "] "
                                            : "",
                                        word["meanings"].map(function (meaning) {
                                            return [
                                                yomikata.format_annotations(meaning["annotations"]),
                                                " ",
                                                yomikata.quote(meaning["meaning"]),
                                            ].join("");
                                        }).join("; "),
                                        "</label>",
                                    "</li>"
                                ].join("");
                            }).join(""),
                        "</ul>",
                    "</td>",
                "</tr>"
            ].join("");
        }).join("");

        vocab.innerHTML = html;
    },

    japanese_text_to_href_data_url: function (dom_element)
    {
        var blacklist = yomikata.build_blacklist();

        dom_element.setAttribute(
            "href",
            yomikata.process_text($("japanese-text").value, blacklist)
        );
    },

    build_blacklist: function ()
    {
        var blacklist = {},
            checkboxes = $("vocab").getElementsByTagName("input"),
            i, l, k, v;

        for (k in yomikata.BLACKLIST) {
            if (yomikata.BLACKLIST.hasOwnProperty(k)) {
                blacklist[k] = yomikata.BLACKLIST[v];
            }
        }

        for (i = 0, l = checkboxes.length; i < l; ++i) {
            if (!checkboxes[i].checked) {
                blacklist[checkboxes[i].value] = 0;
            }
        }

        return blacklist;
    },

    process_text: function (text, blacklist)
    {
        return yomikata.html_to_data_url(
            yomikata.generate_html(
                yomikata.parse_text(text, blacklist)
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

    parse_text: function (text, blacklist)
    {
        var paragraphs = text.split(/\n\n+/).filter(yomikata.is_not_empty),
            i, l;

        return paragraphs.map(
            function (paragraph, paragraph_id)
            {
                return yomikata.parse_paragraph(paragraph, paragraph_id, blacklist);
            }
        );
    },

    is_not_empty: function (str)
    {
        return str != "";
    },

    parse_paragraph: function (paragraph, paragraph_id, blacklist)
    {
        var tokens = yomikata.tokenizer.tokenize(paragraph),
            parsed_tokens = [],
            writings = [],
            readings = {},
            word_ids = {},
            parsed_token,
            i, l, t, b, s, w, r;

        for (i = 0, l = tokens.length; i < l; ++i) {
            t = tokens[i];
            b = t["basic_form"];
            s = t["surface_form"];
            r = t["reading"];

            parsed_token = {
                "word_id": "",
                "token": s,
                "reading": null
            };

            if (t["word_type"] === "KNOWN" && (!word_ids.hasOwnProperty(b))) {
                w = "word-" + String(paragraph_id) + "-" + String(i);
                word_ids[b] = w;
                writings.push({"word_id": w, "writing": b});
            }

            if (yomikata.KANJI_RE.test(s) && (!readings.hasOwnProperty(r))) {
                if (r !== undefined) {
                    parsed_token["reading"] = r;
                    readings[r] = true;
                } else {
                    parsed_token["reading"] = "";
                }
            }

            if (word_ids.hasOwnProperty(b)) {
                parsed_token["word_id"] = word_ids[b];
            }

            parsed_tokens.push(parsed_token);
        }

        return {
            "tokens": parsed_tokens,
            "words": writings.map(
                function (writing)
                {
                    return yomikata.lookup_by_writing(writing, blacklist);
                }
            )
        };
    },

    lookup_by_writing: function (writing, blacklist)
    {
        var entries = [],
            entry_ids,
            wi = writing["word_id"],
            wr = writing["writing"],
            i, l;

        if (
            blacklist.hasOwnProperty(wr)
            || (!JMdict["dictionary"].hasOwnProperty(wr))
        ) {
            return entries;
        }

        entry_ids = JMdict["dictionary"][wr];

        if (typeof(entry_ids) === "number") {
            entry_ids = [entry_ids];
        }

        for (i = 0, l = entry_ids.length; i < l; ++i) {
            entries.push(yomikata.build_entry(wi, wr, entry_ids[i]));
        }

        return entries;
    },

    build_entry: function (word_id, writing, entry_id)
    {
        var entry = JMdict["entries"][entry_id],
            lines, readings, meanings;

        lines = entry.split("\n");
        readings = yomikata.collect_readings(writing, lines.shift());
        meanings = yomikata.collect_meanings(lines);

        return {
            "word_id": word_id,
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

            f = '<a class="' + t["word_id"] + '">' + f.join("") + '</a>';

            html.push(f);
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

        html.push('<dl class="' + entry["word_id"] + '">');

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
        '<meta name="viewport" content="width=device-width, initial-scale=1.0,',
            ' maximum-scale=1.0, user-scalable=no" />',
        '<style>',
        '* {',
            'margin: 0;',
            'padding: 0;',
        '}',

        'body {',
            'padding: 10px;',
        '}',

        'html,',
        'body,',
        '.paragraph * {',
            'background-color: #ffffff;',
            'color: #000000;',
            'text-decoration: none',
        '}',

        '.paragraph p {',
            'display: block;',
            'margin: 2%;',
            'line-height: 150%;',
        '}',

        '.paragraph .vocab {',
            'display: none;',
        '}',

        '#help {',
            'margin: 0.5em auto;',
            'font-size: 0.9em;',
            'font-family: sans-serif;',
            'width: 80%;',
        '}',

        '#print {',
            'text-align: center;',
        '}',

        '#print button {',
            'background-color: #001050;',
            'color: #ffffff;',
            'border: outset 2px #2050a0;',
            'border-radius: 3px;',
            'text-decoration: none;',
            'font-weight: bold;',
            'margin: 1vmin 5vmin;',
            'padding: 1vmin 5vmin;',
        '}',

        '#dictionary {',
            'position: fixed;',
            'top: 1em;',
            'left: 1em;',
            'right: 1em;',
            'background-color: #f0f8ff;',
            'color: #000000;',
            'padding: 0.2em;',
            'padding-left: 1.2em;',
            'border: solid 1px #000080;',
            'box-shadow: 0.5vmin 0.5vmin 0.5vmin 0.5vmin #c8cce4;',
            'font-family: sans-serif;',
        '}',

        '#dictionary dl {',
            'font-size: 0.9em;',
        '}',

        '@media print {',
            '#print,',
            '#dictionary,',
            '#help {',
                'display: none;',
            '}',

            '.paragraph {',
                'display: block;',
                'margin-top: 0.7em;',
                'border-top: dotted 0.2em black;',
                'padding-top: 0.7em;',
                'font-size: 80%;',
                '-webkit-column-count: 2;',
                '-moz-column-count: 2;',
                'column-count: 2;',
            '}',

            '.paragraph p {',
                'page-break-inside: avoid;',
                '-webkit-page-break-inside: avoid;',
                'break-inside: avoid-page;',
            '}',

            '.paragraph .vocab {',
                'display: block;',
            '}',

            '.paragraph .vocab dl,',
            '.paragraph .vocab dl dt,',
            '.paragraph .vocab dl dd,',
            '.paragraph .vocab dl dd ul,',
            '.paragraph .vocab dl dd ul li {',
                'display: inline;',
            '}',

            '.paragraph .vocab dl {',
                'display: block;',
                'page-break-inside: avoid;',
                '-webkit-page-break-inside: avoid;',
                'break-inside: avoid-page;',
            '}',

            '.paragraph .vocab dl {',
                'padding: 0.2em;',
                'line-height: 1.2em;',
            '}',

            '.paragraph .vocab dl:before {',
                'content: " \\2022 ";',
            '}',

            '.paragraph .vocab dl dt {',
                'white-space: nowrap;',
            '}',

            '.paragraph .vocab dl dd {',
                'font-size: 80%;',
            '}',

            '.paragraph .vocab dl dd small {',
                'font-size: 75%;',
            '}',

            '.paragraph .vocab dl dd ul li:before {',
                'content: " \\25e6 ";',
            '}',
        '}',
        '</style>',
    '</head>',
    '<body>',
        '<div id="print">',
            '<form action="#">',
                '<button onclick="window.print()">',
                    'Print (with vocab) [Ctrl+P]',
                '</button>',
            '</form>',
        '</div>',
        '<div id="help">',
            '<p>',
                'Click on a word to display its meaning, click on the meaning',
                ' to hide it. If you print this page, then after each',
                ' paragraph, a complete vocabulary list for that paragraph',
                ' will be included. <a id="hide-help" href="#">(Hide)</a>',
            '</p>',
        '</div>',
        '<div id="dictionary">',
        '</div>',
        '<script type="text/javascript">',
        '(function () {',
        'var dictionary = document.getElementById("dictionary"),',
        '    hide_help = document.getElementById("hide-help");',
        'function show_dictionary()',
        '{',
            'var word_id = this.className,',
                'html = "",',
                'entries,',
                'i, l;',
            'entries = document.getElementsByClassName(word_id);',
            'for (i = 0, l = entries.length; i < l; ++i) {',
                'if (String(entries[i].tagName).toUpperCase() === "DL") {',
                    'html += "<dl>" + entries[i].innerHTML + "</dl>";',
                '}',
            '}',
            'if (html !== "") {',
                'dictionary.innerHTML = html;',
                'dictionary.style.display = "";',
            '}',
        '};',
        'function hide_dictionary()',
        '{',
            'dictionary.style.display = "none";',
        '};',
        'window.onload = function ()',
        '{',
            'var words = document.getElementsByTagName("a"),',
                'i, l;',
            'for (i = 0, l = words.length; i < l; ++i) {',
                'words[i].onclick = show_dictionary;',
            '}',
            'dictionary.onclick = hide_dictionary;',
            'hide_help.onclick = function ()',
            '{',
                'document.getElementById("help").style.display = "none";',
            '};',
            'hide_dictionary();',
        '};',
        '})();',
        '</script>'
].join("");

yomikata.HTML_TAIL = [
    '</body>',
    '</html>'
].join("");

window.onload = yomikata.initialize;

})();
