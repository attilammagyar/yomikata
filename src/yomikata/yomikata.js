(function () {

function $(id)
{
    return document.getElementById(id);
}

var yomikata;

yomikata = {
    DIC_PATH: "kuromojijs/dict/",

    TXT_EOL: "\r\n",

    HTML_HEAD: "",
    HTML_TAIL: "",

    TSV_HEADER: "Writing\tReadings\tMeanings",

    KANJI_RE: /[\u4e00-\u9faf\u3400-\u4dbf]/,
    NOISE_RE: /([ _.,;:()\[\]{}'"\/*+-]|　|。|、|；|：|（|）|【|】|｛|｝|「|」|『|』|・|＊|＋|ー|＝)/g,

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
        var open_html = $("open-html"),
            save_html = $("save-html");
            save_txt = $("save-txt");
            save_known_words = $("save-known-words");
            save_new_words = $("save-new-words");
            customize_vocab = $("customize-vocab");

        yomikata.timer = setInterval(yomikata.update_dictionary_status, 1000);
        setTimeout(yomikata.initialize_tokenizer, 300);

        open_html.onclick = yomikata.open_html;
        save_html.onclick = yomikata.save_html;
        save_txt.onclick = yomikata.save_txt;
        save_known_words.onclick = yomikata.save_known_words;
        save_new_words.onclick = yomikata.save_new_words;
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

    open_html: function ()
    {
        yomikata.japanese_text_to_href_data_url_html(this);

        return true;
    },

    save_html: function ()
    {
        var title = String($("title").value);

        yomikata.japanese_text_to_href_data_url_html(this);
        this.setAttribute("download", title + ".html");

        return true;
    },

    save_txt: function ()
    {
        var title = String($("title").value);

        yomikata.japanese_text_to_href_data_url_txt(this);
        this.setAttribute("download", title + ".txt");

        return true;
    },

    save_known_words: function ()
    {
        yomikata.blacklist_to_href_data_url_tsv(this);
        this.setAttribute("download", "known_words-" + String(Date.now()) + ".tsv");

        return true;
    },

    save_new_words: function ()
    {
        yomikata.new_words_to_href_data_url_tsv(this);
        this.setAttribute("download", "new_words-" + String(Date.now()) + ".tsv");

        return true;
    },

    customize_vocab: function ()
    {
        var vocab_table = $("vocab-table"),
            text = $("japanese-text").value,
            html = [],
            id = 0,
            blacklist = yomikata.build_blacklist(),
            words;

        $("customize-vocab").innerHTML = "Update vocab customizer";
        vocab_table.innerHTML = [
            '<tr>',
                '<td class="center" colspan="3" lang="en">',
                    '<img class="loading" src="loading.gif" alt="Please wait..." />',
                '</td>',
            '</tr>',
        ].join("");
        $("vocab").style.display = "block";

        words = yomikata.parse_paragraph(text, "", yomikata.BLACKLIST)["words"];

        html = words.map(function (entries) {
            var writing;

            if (entries.length == 0) {
                return "";
            }

            writing = yomikata.quote_html(entries[0]["writing"]);
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
                                            ? "[" + yomikata.format_readings_html(word["readings"]) + "] "
                                            : "",
                                        '<span lang="en">',
                                            word["meanings"].map(function (meaning) {
                                                return [
                                                    yomikata.format_annotations_html(meaning["annotations"]),
                                                    " ",
                                                    yomikata.quote_html(meaning["meaning"]),
                                                ].join("");
                                            }).join("; "),
                                        "</span>",
                                        "</label>",
                                    "</li>"
                                ].join("");
                            }).join(""),
                        "</ul>",
                    "</td>",
                "</tr>"
            ].join("");
        }).join("");

        vocab_table.innerHTML = html;
    },

    japanese_text_to_href_data_url_html: function (dom_element)
    {
        var blacklist = yomikata.build_blacklist();

        dom_element.href = yomikata.html_to_data_url(
            yomikata.generate_html(
                yomikata.parse_text($("japanese-text").value, blacklist)
            )
        );
    },

    japanese_text_to_href_data_url_txt: function (dom_element)
    {
        var blacklist = yomikata.build_blacklist();

        dom_element.href = yomikata.txt_to_data_url(
            yomikata.generate_txt(
                yomikata.parse_text($("japanese-text").value, blacklist)
            )
        );
    },

    blacklist_to_href_data_url_tsv: function (dom_element)
    {
        var blacklist = yomikata.build_blacklist();

        dom_element.href = yomikata.tsv_to_data_url(
            yomikata.generate_blacklist_tsv(blacklist)
        );
    },

    new_words_to_href_data_url_tsv: function (dom_element)
    {
        var blacklist = yomikata.build_blacklist();

        dom_element.href = yomikata.tsv_to_data_url(
            yomikata.generate_new_words_tsv(
                yomikata.parse_paragraph(
                    $("japanese-text").value, "", blacklist
                )["words"]
            )
        );
    },

    generate_blacklist_tsv: function (blacklist)
    {
        var lines = [yomikata.TSV_HEADER],
            entries, writing;

        for (writing in blacklist) {
            if (blacklist.hasOwnProperty(writing) && (!yomikata.BLACKLIST.hasOwnProperty(writing))) {
                entries = yomikata.lookup_by_writing(
                    {"word_id": null, "writing": writing},
                    {}
                );
                lines.push(yomikata.entries_to_tsv_lines(writing, entries));
            }
        }

        return lines.join(yomikata.TXT_EOL);
    },

    entries_to_tsv_lines: function (writing, entries)
    {
        var lines = [],
            entry, readings, meanings, meaning, columns, i, l, j, ll;

        if (entries.length === 0) {
            return String(writing) + "\t\t";
        }

        for (i = 0, l = entries.length; i < l; ++i) {
            entry = entries[i];
            readings = entry["readings"];
            meanings = [];

            for (j = 0, ll = entry["meanings"].length; j < ll; ++j) {
                meaning = entry["meanings"][j];
                meanings.push([
                    yomikata.format_annotations_txt(meaning["annotations"]),
                    String(meaning["meaning"]),
                ].join(" "));
            }

            readings = readings.join(",").trim();

            if (readings === "") {
                readings = writing;
            }

            columns = [writing, readings, meanings.join(" // ")];
            lines.push(columns.join("\t"));
        }

        return lines.join(yomikata.TXT_EOL);
    },

    generate_new_words_tsv: function (words)
    {
        var lines = [yomikata.TSV_HEADER],
            entries, writing, i, l;

        for (i = 0, l = words.length; i < l; ++i) {
            entries = words[i];

            if (entries.length > 0) {
                if (!entries[0]["is_blacklisted"]) {
                    writing = entries[0]["writing"];
                    lines.push(yomikata.entries_to_tsv_lines(writing, entries));
                }
            }
        }

        return lines.join(yomikata.TXT_EOL);
    },

    build_blacklist: function ()
    {
        var blacklist = {},
            known_list = $("vocab-import-known").value,
            checkboxes = $("vocab-table").getElementsByTagName("input"),
            lines, word, i, l, k, v;

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

        lines = known_list.split("\n");

        for (i = 0, l = lines.length; i < l; ++i) {
            word = lines[i].trim().match(/([^\s;,]*)/);

            if (word && word.length > 1) {
                word = word[1].replace(/['"]/g, "");

                if (word !== "") {
                    blacklist[word] = 0;
                }
            }
        }

        return blacklist;
    },

    html_to_data_url: function (html)
    {
        return yomikata.to_data_url("text/html", html);
    },

    txt_to_data_url: function (text)
    {
        return yomikata.to_data_url("text/plain", text);
    },

    tsv_to_data_url: function (text)
    {
        return yomikata.to_data_url("text/tab-separated-values", text);
    },

    to_data_url: function (mime_type, text)
    {
        return URL.createObjectURL(new Blob([text], {"type": mime_type}));
    },

    generate_html: function (paragraphs)
    {
        var title = $("title").value || "yomikata";

        return [
            yomikata.HTML_HEAD.replace("{{TITLE}}", title),
            yomikata.format_paragraphs_html(paragraphs),
            yomikata.HTML_TAIL
        ].join("");
    },

    generate_txt: function (paragraphs)
    {
        var title = $("title").value || "yomikata";

        return [
            String(title),
            "===================",
            "",
            yomikata.format_paragraphs_txt(paragraphs),
        ].join(yomikata.TXT_EOL);
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
        var tokens,
            parsed_tokens = [],
            writings = [],
            readings = {},
            word_ids = {},
            parsed_token,
            word_id,
            i, l, j, k, t, b, s, w, r;

        tokens = yomikata.tokenizer.tokenize(paragraph);
        tokens = yomikata.extend_with_expressions(tokens);

        for (i = 0, l = tokens.length; i < l; ++i) {
            t = tokens[i];
            b = t["basic_form"];
            s = t["surface_form"];
            r = t["reading"];

            parsed_token = {
                "word_ids": [],
                "token": s,
                "reading": null,
                "is_blacklisted": blacklist.hasOwnProperty(b),
                "is_expression": false
            };

            if (
                (t["word_type"] === "KNOWN" || t["word_type"] === "EXPRESSION")
                && (!word_ids.hasOwnProperty(b))
            ) {
                w = "word-" + String(paragraph_id) + "-" + String(i);
                word_ids[b] = w;
                writings.push({"word_id": w, "writing": b});
            }

            if (yomikata.KANJI_RE.test(s) && (!readings.hasOwnProperty(r))) {
                if (r !== undefined && r !== null) {
                    parsed_token["reading"] = r;
                    readings[r] = true;
                } else {
                    parsed_token["reading"] = "";
                }
            }

            word_id = word_ids[b];

            if (word_ids.hasOwnProperty(b)) {
                parsed_token["word_ids"].push(word_id);
            }

            parsed_tokens.push(parsed_token);

            if (t["word_type"] === "EXPRESSION") {
                parsed_token["is_expression"] = true;

                for (j = i, k = t["length"]; j >= 0 && k > 0; --j) {
                    if (!parsed_tokens[j]["is_expression"]) {
                        --k;
                        parsed_tokens[j]["word_ids"].push(word_id);
                    }
                }
            }
        }

        return {
            "paragraph_id": paragraph_id,
            "tokens": parsed_tokens,
            "words": writings.map(
                function (writing)
                {
                    return yomikata.lookup_by_writing(writing, blacklist);
                }
            )
        };
    },

    extend_with_expressions: function (tokens)
    {
        var extended = [],
            candidates = [],
            new_candidates,
            i, l, j, ll, t, c;

        function make_empty_token()
        {
            return {
                "basic_form": "",
                "latest_addition": "",
                "node": JMdict["dictionary_trie"],
                "length": 0,
                "word_type": "EMPTY",
                "surface_form": "",
                "reading": undefined
            };
        };

        function try_to_append(token, str)
        {
            var node = yomikata.find_trie_node(str, token["node"]),
                word_type = token["word_type"];

            if (node === null) {
                str = str.replace(yomikata.NOISE_RE, "");

                if (str === "") {
                    node = token["node"];
                } else {
                    node = yomikata.find_trie_node(str, token["node"]);

                    if (node === null) {
                        return null;
                    }
                }
            }

            if (str !== "") {
                if (word_type === "EMPTY") {
                    word_type = "KNOWN";
                } else {
                    word_type = "EXPRESSION";
                }
            } else {
                if (word_type === "EMPTY") {
                    return null;
                }
            }

            return {
                "basic_form": token["basic_form"] + str,
                "latest_addition": str,
                "node": node,
                "length": token["length"] + 1,
                "word_type": word_type,
                "surface_form": "",
                "reading": undefined
            };
        }

        function try_new_candidate(candidate, str)
        {
            var nc = try_to_append(candidate, str);

            if (nc === null) {
                return;
            }

            new_candidates.push(nc);

            if (
                nc["word_type"] === "EXPRESSION"
                && nc["latest_addition"] !== ""
                && yomikata.is_trie_leaf(nc["node"])
            ) {
                extended.push(nc);
            }
        }

        for (i = 0, l = tokens.length; i < l; ++i) {
            t = tokens[i];
            extended.push(t);
            candidates.push(make_empty_token());
            new_candidates = [];

            for (j = 0, ll = candidates.length; j < ll; ++j) {
                c = candidates[j];
                try_new_candidate(c, t["surface_form"]);

                if (t["basic_form"] !== t["surface_form"]) {
                    try_new_candidate(c, t["basic_form"]);
                }
            }

            candidates = new_candidates;
        }

        return extended;
    },

    is_trie_leaf: function (node)
    {
        return node !== null && node.hasOwnProperty("");
    },

    find_trie_node: function (word, root)
    {
        var node, i, l;

        if (root === null) {
            return null;
        }

        if (root === undefined) {
            root = JMdict["dictionary_trie"];
        }

        for (i = 0, l = word.length, node = root; i < l; ++i) {
            if (!node.hasOwnProperty(word[i])) {
                return null;
            }
            node = node[word[i]];
        }

        return node;
    },

    lookup_by_writing: function (writing, blacklist)
    {
        var entries = [],
            node,
            entry_ids,
            is_blacklisted = false,
            wi = writing["word_id"],
            wr = writing["writing"],
            i, l;

        node = yomikata.find_trie_node(wr);

        if (!yomikata.is_trie_leaf(node)) {
            return [];
        }

        is_blacklisted = blacklist.hasOwnProperty(wr);
        entry_ids = node[""];

        if (typeof(entry_ids) === "number") {
            entry_ids = [entry_ids];
        }

        for (i = 0, l = entry_ids.length; i < l; ++i) {
            entries.push(
                yomikata.build_entry(wi, wr, entry_ids[i], is_blacklisted)
            );
        }

        return entries;
    },

    build_entry: function (word_id, writing, entry_id, is_blacklisted)
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
            "meanings": meanings,
            "is_blacklisted": is_blacklisted
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

    format_paragraphs_html: function (paragraphs)
    {
        return paragraphs.map(yomikata.format_paragraph_html).join("");
    },

    format_paragraph_html: function (paragraph)
    {
        var pi = String(paragraph["paragraph_id"]);

        return [
            '<div id="paragraph_' + pi + '" class="paragraph page_break">',
                '<p>',
                    yomikata.format_tokens_html(paragraph["tokens"]),
                '</p>',
                '<div class="vocab">',
                    ].concat(
                        paragraph["words"].map(yomikata.format_entries_html)
                    ).concat([
                '</div>',
                '<div class="buttons">',
                    '<form action="#">',
                        '<label lang="en">',
                            '<input type="checkbox" class="add_break" id="add_break_' + pi + '" checked="checked" /> ',
                            'Page break',
                        '</label>',
                    '</form>',
                '</div>',
            '</div>'
        ]).join("");
    },

    format_tokens_html: function (tokens)
    {
        var html = [],
            i, l, t, f;

        for (i = 0, l = tokens.length; i < l; ++i) {
            t = tokens[i];

            if (t["token"] !== "") {
                if (t["reading"] !== null) {
                    f = [
                        "<ruby>",
                            yomikata.quote_html(t["token"]),
                            "<rt>",
                                yomikata.quote_html(t["reading"]),
                            "</rt>",
                        "</ruby>"
                    ];
                } else {
                    f = [
                        (t["token"] == "\n") ? "\n<br />" : yomikata.quote_html(t["token"])
                    ];
                }

                f = '<a class="' + t["word_ids"].reverse().join(" ") + '">' + f.join("") + '</a>';
            } else {
                f = '';
            }

            html.push(f);
        }

        return html.join("");
    },

    format_entries_html: function (entries)
    {
        return entries.map(yomikata.format_entry_html).join("");
    },

    format_entry_html: function (entry)
    {
        var html = [],
            classes = entry["is_blacklisted"] ? " blacklisted" : "",
            writing = yomikata.quote_html(entry["writing"]);

        html.push('<dl class="' + entry["word_id"] + classes + '">');

        if (entry["readings"].length > 0) {
            html = html.concat([
                '<dt>',
                    writing,
                    '<small>',
                        "【",
                        yomikata.format_readings_html(entry["readings"]),
                        "】",
                    '</small>',
                '</dt>',
            ]);
        } else {
            html = html.concat(['<dt>', writing, '</dt>']);
        }

        return html.concat([
                '<dd lang="en">',
                    '<ul>',
                        yomikata.format_meanings_html(entry["meanings"]),
                    '</ul>',
                '</dd>',
            '</dl>',
        ]).join("");
    },

    format_readings_html: function (readings)
    {
        return readings.map(yomikata.quote_html).join("、");
    },

    format_meanings_html: function (meanings)
    {
        return meanings.map(yomikata.format_meaning_html).join("");
    },

    format_meaning_html: function (meaning)
    {
        return [
            "<li>",
                yomikata.format_annotations_html(meaning["annotations"]),
                "\n",
                yomikata.quote_html(meaning["meaning"]),
            "</li>"
        ].join("");
    },

    format_annotations_html: function (annotations)
    {
        var html = [],
            last_index = annotations.length - 1,
            i, l;

        for (i = 0, l = annotations.length; i < l; ++i) {
            html.push(
                yomikata.format_annotation_html(annotations[i], i >= last_index)
            );
        }

        return html.join("");
    },

    format_annotation_html: function (annotation, is_last)
    {
        var html;

        if (annotation["explanation"] !== "") {
            html = [
                '<small title="',
                    yomikata.quote_html(annotation["explanation"]),
                '">'
            ];
        } else {
            html = ['<small>'];
        }

        return html.concat([
                yomikata.quote_html(annotation["abbreviation"]),
                is_last ? "" : "; ",
            "</small>",
        ]).join("");
    },

    quote_html: function (str)
    {
        return (String(str)
            .replace("&", "&amp;")
            .replace("'", "&#039;")
            .replace('"', "&quot;")
            .replace(">", "&gt;")
            .replace("<", "&lt;")
        );
    },

    format_paragraphs_txt: function (paragraphs)
    {
        return paragraphs.map(yomikata.format_paragraph_txt).join(yomikata.TXT_EOL);
    },

    format_paragraph_txt: function (paragraph, words)
    {
        return [
            yomikata.format_tokens_txt(paragraph["tokens"]),
            ""
        ].concat(
            paragraph["words"].map(
                yomikata.format_entries_txt
            ).filter(
                yomikata.is_not_empty
            ),
            "",
            "-------------------",
            ""
        ).join(yomikata.TXT_EOL);
    },

    is_not_empty: function (word)
    {
        return word !== "";
    },

    format_tokens_txt: function (tokens)
    {
        var txt = [],
            i, l, t, f;

        for (i = 0, l = tokens.length; i < l; ++i) {
            t = tokens[i];

            if (t["reading"] !== null && !t["is_blacklisted"]) {
                f = [String(t["token"]), " 【", String(t["reading"]), "】 "];
            } else {
                f = [String(t["token"])];
            }

            txt.push(f.join(""));
        }

        return txt.join("");
    },

    format_entries_txt: function (entries)
    {
        return entries.filter(
            yomikata.is_not_blacklisted_entry
        ).map(
            yomikata.format_entry_txt
        ).join(yomikata.TXT_EOL);
    },

    is_not_blacklisted_entry: function (word)
    {
        return !word["is_blacklisted"];
    },

    format_entry_txt: function (entry)
    {
        var txt = [],
            writing = String(entry["writing"]);

        txt.push(writing);

        if (entry["readings"].length > 0) {
            txt = txt.concat([
                " 【",
                yomikata.format_readings_txt(entry["readings"]),
                "】"
            ]);
        }

        return [
            txt.join(""),
            yomikata.format_meanings_txt(entry["meanings"])
        ].join("");
    },

    format_readings_txt: function (readings)
    {
        return readings.map(String).join("、");
    },

    format_meanings_txt: function (meanings)
    {
        return meanings.map(yomikata.format_meaning_txt).join(yomikata.TXT_EOL);
    },

    format_meaning_txt: function (meaning)
    {
        return [
            " * ",
            yomikata.format_annotations_txt(meaning["annotations"]),
            " ",
            String(meaning["meaning"]),
        ].join("");
    },

    format_annotations_txt: function (annotations)
    {
        var txt = [],
            i, l;

        if (annotations.length === 0) {
            return "";
        }

        for (i = 0, l = annotations.length; i < l; ++i) {
            txt.push(annotations[i]["abbreviation"]);
        }

        return "[" + txt.join("; ") + "]";
    },

    _: null
}

yomikata.HTML_HEAD = [
    '<!DOCTYPE html>',
    '<html lang="ja">',
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
            'text-decoration: none;',
        '}',
        '.paragraph {',
            'break-inside: avoid-page;',
            'page-break-inside: avoid;',
            '-webkit-page-break-inside: avoid;',
        '}',
        '.page_break {',
            'page-break-after: always;',
            '-webkit-page-break-after: always;',
            'break-after: always;',
        '}',
        '.paragraph p {',
            'display: block;',
            'page-break-inside: avoid;',
            '-webkit-page-break-inside: avoid;',
            'break-inside: avoid-page;',
            'margin: 2%;',
            'line-height: 150%;',
        '}',
        '.paragraph .vocab {',
            'display: none;',
        '}',
        '#text.show-vocab .paragraph .vocab {',
            'display: block;',
        '}',
        '#text.show-vocab .paragraph {',
            'margin-top: 0.7em;',
            'border-top: dotted 0.2em black;',
            'padding-top: 0.7em;',
        '}',
        '#help {',
            'margin: 0.5em auto;',
            'font-size: 0.9em;',
            'font-family: sans-serif;',
            'width: 80%;',
        '}',
        '.buttons {',
            'text-align: center;',
        '}',
        '.buttons button {',
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
            'margin-bottom: 0.5em;',
            'font-size: 0.9em;',
        '}',
        '#dictionary dd {',
            'margin-left: 2em;',
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
            'padding: 0.2em;',
            'line-height: 1.2em;',
        '}',
        '.paragraph .vocab dl:before {',
            'content: " \\2022 ";',
        '}',
        '.paragraph .vocab dl.blacklisted {',
            'display: none;',
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
        '@media only screen and (min-width : 600px) {',
            '.paragraph .vocab {',
                '-webkit-column-count: 2;',
                '-moz-column-count: 2;',
                'column-count: 2;',
            '}',
        '}',
        '@media only screen and (min-width : 1200px) {',
            '.paragraph .vocab {',
                '-webkit-column-count: 3;',
                '-moz-column-count: 3;',
                'column-count: 3;',
            '}',
        '}',
        '@media only screen and (min-width : 1500px) {',
            '.paragraph .vocab {',
                '-webkit-column-count: 4;',
                '-moz-column-count: 4;',
                'column-count: 4;',
            '}',
        '}',
        '@media only screen {',
            '.page_break {',
                'border-bottom: dashed 1px #808080;',
            '}',
        '}',
        '@media print {',
            '.buttons,',
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
            '.paragraph .vocab {',
                'display: block;',
            '}',
        '}',
        '</style>',
    '</head>',
    '<body>',
        '<div class="buttons" lang="en">',
            '<form action="#">',
                '<div>',
                    '<button id="print">',
                        'Print (with vocab) [Ctrl+P]',
                    '</button>',
                    '<button id="toggle-vocab">',
                        'Toggle vocab',
                    '</button>',
                '</div>',
                '<div>',
                    '<label>',
                        '<input type="checkbox" id="add_breaks" checked="checked" /> ',
                        'Print with page break after every paragraph (recommended for Firefox)',
                    '</label>',
                '</div>',
            '</form>',
        '</div>',
        '<div id="help" lang="en">',
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
            'add_break_checkboxes = document.getElementsByClassName("add_break");',
        'function toggle_breaks()',
        '{',
            'var checked = document.getElementById("add_breaks").checked,',
                 'cb,i,l;',
            'for (i = 0, l = add_break_checkboxes.length; i < l; ++i) {',
                'cb = add_break_checkboxes[i];',
                'cb.checked = checked;',
                'update_break.apply(cb);',
            '}',
        '}',
        'function update_break()',
        '{',
            'var pi, cls;',
            'pi = this.getAttribute("id").replace("add_break_", "paragraph_");',
            'cls = this.checked ? "paragraph page_break" : "paragraph";',
            'document.getElementById(pi).className = cls;',
        '}',
        'function show_dictionary()',
        '{',
            'var word_ids = this.className.trim().split(/  */),',
                'html = "",',
                'entries,',
                'word_id,',
                'i, l, ii, ll;',
            'for (i = 0, l = word_ids.length; i < l; ++i) {',
                'word_id = word_ids[i];',
                'entries = document.getElementsByClassName(word_id);',
                'for (ii = 0, ll = entries.length; ii < ll; ++ii) {',
                    'if (String(entries[ii].tagName).toUpperCase() === "DL") {',
                        'html += "<dl>" + entries[ii].innerHTML + "</dl>";',
                    '}',
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
        'function toggle_vocab()',
        '{',
            'var body = document.getElementById("text");',
            'body.className = body.className ? "" : "show-vocab";',
            '',
            'return false;',
        '}',
        'window.onload = function ()',
        '{',
            'var words = document.getElementsByTagName("a"),',
                'hide_help = document.getElementById("hide-help"),',
                'i, l;',
            'for (i = 0, l = words.length; i < l; ++i) {',
                'words[i].onclick = show_dictionary;',
            '}',
            'for (i = 0, l = add_break_checkboxes.length; i < l; ++i) {',
                'add_break_checkboxes[i].onclick = update_break;',
            '}',
            'dictionary.onclick = hide_dictionary;',
            'hide_help.onclick = function ()',
            '{',
                'document.getElementById("help").style.display = "none";',
                '',
                'return false;',
            '};',
            'hide_dictionary();',
            'document.getElementById("print").onclick = function () { window.print(); return false; };',
            'document.getElementById("add_breaks").onclick = toggle_breaks;',
            'document.getElementById("toggle-vocab").onclick = toggle_vocab;',
        '};',
        '})();',
        '</script>',
        '<div id="text">'
].join("");

yomikata.HTML_TAIL = [
        '</div>',
    '</body>',
    '</html>'
].join("");

window.onload = yomikata.initialize;

})();
