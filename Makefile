JMDICT_URL = ftp://ftp.edrdg.org/pub/Nihongo/JMdict.gz
KUROMOJI_JS_URL = https://github.com/takuyaa/kuromoji.js.git
KUROMOJI_JS_COMMIT = 4ed2bc8b0b26fdbd790df53614322d1beec2027f

DIST_DIR = dist/yomikata

DIST_FILES = \
	$(DIST_DIR)/demo.html \
	$(DIST_DIR)/index.html \
	$(DIST_DIR)/jmdict.js \
	$(DIST_DIR)/kuromojijs/kuromoji.js \
	$(DIST_DIR)/kuromojijs/dict/base.dat.gz \
	$(DIST_DIR)/kuromojijs/dict/cc.dat.gz \
	$(DIST_DIR)/kuromojijs/dict/check.dat.gz \
	$(DIST_DIR)/kuromojijs/dict/tid.dat.gz \
	$(DIST_DIR)/kuromojijs/dict/tid_map.dat.gz \
	$(DIST_DIR)/kuromojijs/dict/tid_pos.dat.gz \
	$(DIST_DIR)/kuromojijs/dict/unk_char.dat.gz \
	$(DIST_DIR)/kuromojijs/dict/unk_compat.dat.gz \
	$(DIST_DIR)/kuromojijs/dict/unk.dat.gz \
	$(DIST_DIR)/kuromojijs/dict/unk_invoke.dat.gz \
	$(DIST_DIR)/kuromojijs/dict/unk_map.dat.gz \
	$(DIST_DIR)/kuromojijs/dict/unk_pos.dat.gz \
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

build/JMdict.gz: | build
	wget -O "$@" "$(JMDICT_URL)"

$(DIST_DIR): | dist
	mkdir -v $(DIST_DIR)

dist:
	mkdir -v dist

build:
	mkdir -v build

$(DIST_DIR)/index.html: src/yomikata/yomikata.html | $(DIST_DIR)
	cp -v $< $@

$(DIST_DIR)/demo.html: src/yomikata/yomikata.html | $(DIST_DIR)
	sed \
		's@</body>@<script type="text/javascript" src="yomikata-demo.js"></script></body>@' \
		$< >$@

$(DIST_DIR)/license.txt: LICENSE | $(DIST_DIR)
	cp -v $< $@

$(DIST_DIR)/loading.gif: src/yomikata/loading.gif | $(DIST_DIR)
	cp -v $< $@

$(DIST_DIR)/readme.txt: README.md | $(DIST_DIR)
	cp -v $< $@

$(DIST_DIR)/yomikata%: src/yomikata/yomikata% | $(DIST_DIR)
	cp -v $< $@

$(DIST_DIR)/kuromojijs/kuromoji.js: build/kuromojijs | $(DIST_DIR)/kuromojijs
	cp -v build/kuromojijs/dist/browser/kuromoji.js $@

$(DIST_DIR)/kuromojijs/dict/%.gz: build/kuromojijs | $(DIST_DIR)/kuromojijs/dict
	cp -v build/kuromojijs/dist/dict/$(@F) $@

$(DIST_DIR)/kuromojijs/dict: | $(DIST_DIR)/kuromojijs
	mkdir -v $@

$(DIST_DIR)/kuromojijs: | $(DIST_DIR)
	mkdir -v $@

build/kuromojijs: | build
	git clone "$(KUROMOJI_JS_URL)" build/kuromojijs
	( cd build/kuromojijs ; git reset --hard "$(KUROMOJI_JS_COMMIT)" )
