JMDICT_URL = ftp://ftp.edrdg.org/pub/Nihongo/JMdict.gz
KUROMOJI_JS_URL = https://github.com/takuyaa/kuromoji.js.git
KUROMOJI_JS_COMMIT = 4ed2bc8b0b26fdbd790df53614322d1beec2027f

DIST_DIR = dist/yomikata

K_SRC_DIR = build/kuromojijs/dist
K_DST_DIR = $(DIST_DIR)/kuromojijs
K_BASE = dict/base.dat.gz
K_CC = dict/cc.dat.gz
K_CHECK = dict/check.dat.gz
K_TID = dict/tid.dat.gz
K_TID_MAP = dict/tid_map.dat.gz
K_TID_POS = dict/tid_pos.dat.gz
K_UNK = dict/unk.dat.gz
K_UNK_CHAR = dict/unk_char.dat.gz
K_UNK_COMPAT = dict/unk_compat.dat.gz
K_UNK_INVOKE = dict/unk_invoke.dat.gz
K_UNK_MAP = dict/unk_map.dat.gz
K_UNK_POS = dict/unk_pos.dat.gz

DIST_FILES = \
	$(K_DST_DIR)/$(K_BASE) \
	$(K_DST_DIR)/$(K_CC) \
	$(K_DST_DIR)/$(K_CHECK) \
	$(K_DST_DIR)/$(K_TID) \
	$(K_DST_DIR)/$(K_TID_MAP) \
	$(K_DST_DIR)/$(K_TID_POS) \
	$(K_DST_DIR)/$(K_UNK) \
	$(K_DST_DIR)/$(K_UNK_CHAR) \
	$(K_DST_DIR)/$(K_UNK_COMPAT) \
	$(K_DST_DIR)/$(K_UNK_INVOKE) \
	$(K_DST_DIR)/$(K_UNK_MAP) \
	$(K_DST_DIR)/$(K_UNK_POS) \
	$(K_DST_DIR)/kuromoji.js \
	$(DIST_DIR)/demo.html \
	$(DIST_DIR)/index.html \
	$(DIST_DIR)/jmdict.js \
	$(DIST_DIR)/license.txt \
	$(DIST_DIR)/loading.gif \
	$(DIST_DIR)/readme.txt \
	$(DIST_DIR)/yomikata.css \
	$(DIST_DIR)/yomikata-demo.js \
	$(DIST_DIR)/yomikata.js

.PHONY: all clean gh-pages
all: $(DIST_FILES)

clean:
	rm -rvf $(DIST_FILES)

gh-pages: all
	bash gh-pages.sh

$(DIST_DIR)/jmdict.js: build/JMdict.gz | $(DIST_DIR)
	PYTHONIOENCODING=utf-8 python3 src/jmdict2js.py $< >$@

build/JMdict.gz: build
	wget -O "$@" "$(JMDICT_URL)"

$(DIST_DIR): | dist
	mkdir -v $(DIST_DIR)

dist:
	mkdir -v dist

build:
	mkdir -v build

$(DIST_DIR)/yomikata.js: src/yomikata/yomikata.js | $(DIST_DIR)
	cp -v $< $@

$(DIST_DIR)/yomikata-demo.js: src/yomikata/yomikata-demo.js | $(DIST_DIR)
	cp -v $< $@

$(DIST_DIR)/yomikata.css: src/yomikata/yomikata.css | $(DIST_DIR)
	cp -v $< $@

$(DIST_DIR)/index.html: src/yomikata/yomikata.html | $(DIST_DIR)
	cp -v $< $@

$(DIST_DIR)/demo.html: src/yomikata/yomikata.html | $(DIST_DIR)
	sed \
		's@</body>@<script type="text/javascript" src="yomikata-demo.js"></script></body>@' \
		$< >$@

$(DIST_DIR)/loading.gif: src/yomikata/loading.gif | $(DIST_DIR)
	cp -v $< $@

$(DIST_DIR)/license.txt: LICENSE | $(DIST_DIR)
	cp -v $< $@

$(DIST_DIR)/readme.txt: README.md | $(DIST_DIR)
	cp -v $< $@

$(K_DST_DIR)/kuromoji.js: $(K_SRC_DIR)/browser/kuromoji.js | $(K_DST_DIR)
	cp -v $< $@

$(K_DST_DIR)/$(K_BASE): $(K_SRC_DIR)/$(K_BASE) | $(K_DST_DIR)/dict
	cp -v $< $@

$(K_DST_DIR)/$(K_CC): $(K_SRC_DIR)/$(K_CC) | $(K_DST_DIR)/dict
	cp -v $< $@

$(K_DST_DIR)/$(K_CHECK): $(K_SRC_DIR)/$(K_CHECK) | $(K_DST_DIR)/dict
	cp -v $< $@

$(K_DST_DIR)/$(K_TID): $(K_SRC_DIR)/$(K_TID) | $(K_DST_DIR)/dict
	cp -v $< $@

$(K_DST_DIR)/$(K_TID_MAP): $(K_SRC_DIR)/$(K_TID_MAP) | $(K_DST_DIR)/dict
	cp -v $< $@

$(K_DST_DIR)/$(K_TID_POS): $(K_SRC_DIR)/$(K_BASE) | $(K_DST_DIR)/dict
	cp -v $< $@

$(K_DST_DIR)/$(K_UNK): $(K_SRC_DIR)/$(K_UNK) | $(K_DST_DIR)/dict
	cp -v $< $@

$(K_DST_DIR)/$(K_UNK_CHAR): $(K_SRC_DIR)/$(K_UNK_CHAR) | $(K_DST_DIR)/dict
	cp -v $< $@

$(K_DST_DIR)/$(K_UNK_COMPAT): $(K_SRC_DIR)/$(K_UNK_COMPAT) | $(K_DST_DIR)/dict
	cp -v $< $@

$(K_DST_DIR)/$(K_UNK_INVOKE): $(K_SRC_DIR)/$(K_UNK_INVOKE) | $(K_DST_DIR)/dict
	cp -v $< $@

$(K_DST_DIR)/$(K_UNK_MAP): $(K_SRC_DIR)/$(K_UNK_MAP) | $(K_DST_DIR)/dict
	cp -v $< $@

$(K_DST_DIR)/$(K_UNK_POS): $(K_SRC_DIR)/$(K_UNK_POS) | $(K_DST_DIR)/dict
	cp -v $< $@

$(K_DST_DIR)/dict: | $(K_DST_DIR)
	mkdir -v $@

$(K_DST_DIR): | $(DIST_DIR)
	mkdir -v $@

$(K_SRC_DIR)/$(K_BASE): build/kuromojijs
$(K_SRC_DIR)/$(K_CC): build/kuromojijs
$(K_SRC_DIR)/$(K_CHECK): build/kuromojijs
$(K_SRC_DIR)/$(K_TID): build/kuromojijs
$(K_SRC_DIR)/$(K_TID_MAP): build/kuromojijs
$(K_SRC_DIR)/$(K_TID_POS): build/kuromojijs
$(K_SRC_DIR)/$(K_UNK): build/kuromojijs
$(K_SRC_DIR)/$(K_UNK_CHAR): build/kuromojijs
$(K_SRC_DIR)/$(K_UNK_COMPAT): build/kuromojijs
$(K_SRC_DIR)/$(K_UNK_INVOKE): build/kuromojijs
$(K_SRC_DIR)/$(K_UNK_MAP): build/kuromojijs
$(K_SRC_DIR)/$(K_UNK_POS): build/kuromojijs
$(K_SRC_DIR)/browser/kuromoji.js: build/kuromojijs

build/kuromojijs: | build
	git clone "$(KUROMOJI_JS_URL)" build/kuromojijs
	( cd build/kuromojijs ; git reset --hard "$(KUROMOJI_JS_COMMIT)" )
