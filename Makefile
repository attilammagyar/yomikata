JMDICT_URL=http://ftp.monash.edu.au/pub/nihongo/JMdict.gz
KUROMOJI_JS_URL=https://github.com/takuyaa/kuromoji.js.git
KUROMOJI_JS_COMMIT=4ed2bc8b0b26fdbd790df53614322d1beec2027f

.PHONY: all
all: ./dist/yomikata/jmdict.js ./dist/yomikata/yomikata.js ./dist/yomikata/yomikata.css ./dist/yomikata/index.html ./dist/yomikata/kuromojijs ./dist/yomikata/loading.gif ./dist/yomikata/demo.html ./dist/yomikata/yomikata-demo.js ./dist/yomikata/license.txt

.PHONY: clean
clean:
	rm -rf ./build ./dist

./dist/yomikata/jmdict.js: ./dist/yomikata ./build/JMdict.gz
	test -f ./dist/yomikata/jmdict.js \
		|| PYTHONIOENCODING=utf-8 python3 \
			./src/jmdict2js.py ./build/JMdict.gz >"./dist/yomikata/jmdict.js"

./dist/yomikata: ./dist
	test -d ./dist/yomikata || mkdir ./dist/yomikata

./dist:
	test -d ./dist || mkdir ./dist

./build/JMdict.gz: ./build
	test -f ./build/JMdict.gz || wget -O ./build/JMdict.gz "$(JMDICT_URL)"

./build:
	mkdir ./build

./dist/yomikata/yomikata.js: ./dist/yomikata
	test -f ./dist/yomikata/yomikata.js \
		|| cp ./src/yomikata/yomikata.js ./dist/yomikata/yomikata.js

./dist/yomikata/yomikata-demo.js: ./dist/yomikata
	test -f ./dist/yomikata/yomikata-demo.js \
		|| cp ./src/yomikata/yomikata-demo.js ./dist/yomikata/yomikata-demo.js

./dist/yomikata/yomikata.css: ./dist/yomikata
	test -f ./dist/yomikata/yomikata.css \
		|| cp ./src/yomikata/yomikata.css ./dist/yomikata/yomikata.css

./dist/yomikata/index.html: ./dist/yomikata
	test -f ./dist/yomikata/index.html \
		|| cp ./src/yomikata/yomikata.html ./dist/yomikata/index.html

./dist/yomikata/demo.html: ./dist/yomikata
	test -f ./dist/yomikata/demo.html \
		|| sed 's@</body>@<script type="text/javascript" src="yomikata-demo.js"></script></body>@' \
			./src/yomikata/yomikata.html >./dist/yomikata/demo.html

./dist/yomikata/loading.gif: ./dist/yomikata
	test -f ./dist/yomikata/loading.gif \
		|| cp ./src/yomikata/loading.gif ./dist/yomikata/loading.gif

./dist/yomikata/license.txt: ./dist/yomikata
	test -f ./dist/yomikata/license.txt \
		|| cp ./LICENSE ./dist/yomikata/license.txt

./dist/yomikata/kuromojijs: ./build/kuromojijs ./dist/yomikata
	test -d ./dist/yomikata/kuromojijs || mkdir ./dist/yomikata/kuromojijs
	test -d ./dist/yomikata/kuromojijs/dict || mkdir ./dist/yomikata/kuromojijs/dict
	test -f ./dist/yomikata/kuromojijs/kuromoji.js \
		|| cp ./build/kuromojijs/dist/browser/kuromoji.js ./dist/yomikata/kuromojijs/kuromoji.js
	test -f ./dist/yomikata/kuromojijs/dict/base.dat.gz \
		|| cp ./build/kuromojijs/dist/dict/base.dat.gz ./dist/yomikata/kuromojijs/dict/base.dat.gz
	test -f ./dist/yomikata/kuromojijs/dict/tid_pos.dat.gz \
		|| cp ./build/kuromojijs/dist/dict/tid_pos.dat.gz ./dist/yomikata/kuromojijs/dict/tid_pos.dat.gz
	test -f ./dist/yomikata/kuromojijs/dict/unk_compat.dat.gz \
		|| cp ./build/kuromojijs/dist/dict/unk_compat.dat.gz ./dist/yomikata/kuromojijs/dict/unk_compat.dat.gz
	test -f ./dist/yomikata/kuromojijs/dict/check.dat.gz \
		|| cp ./build/kuromojijs/dist/dict/check.dat.gz ./dist/yomikata/kuromojijs/dict/check.dat.gz
	test -f ./dist/yomikata/kuromojijs/dict/tid_map.dat.gz \
		|| cp ./build/kuromojijs/dist/dict/tid_map.dat.gz ./dist/yomikata/kuromojijs/dict/tid_map.dat.gz
	test -f ./dist/yomikata/kuromojijs/dict/unk_char.dat.gz \
		|| cp ./build/kuromojijs/dist/dict/unk_char.dat.gz ./dist/yomikata/kuromojijs/dict/unk_char.dat.gz
	test -f ./dist/yomikata/kuromojijs/dict/unk.dat.gz \
		|| cp ./build/kuromojijs/dist/dict/unk.dat.gz ./dist/yomikata/kuromojijs/dict/unk.dat.gz
	test -f ./dist/yomikata/kuromojijs/dict/unk_pos.dat.gz \
		|| cp ./build/kuromojijs/dist/dict/unk_pos.dat.gz ./dist/yomikata/kuromojijs/dict/unk_pos.dat.gz
	test -f ./dist/yomikata/kuromojijs/dict/cc.dat.gz \
		|| cp ./build/kuromojijs/dist/dict/cc.dat.gz ./dist/yomikata/kuromojijs/dict/cc.dat.gz
	test -f ./dist/yomikata/kuromojijs/dict/unk_invoke.dat.gz \
		|| cp ./build/kuromojijs/dist/dict/unk_invoke.dat.gz ./dist/yomikata/kuromojijs/dict/unk_invoke.dat.gz
	test -f ./dist/yomikata/kuromojijs/dict/unk_map.dat.gz \
		|| cp ./build/kuromojijs/dist/dict/unk_map.dat.gz ./dist/yomikata/kuromojijs/dict/unk_map.dat.gz
	test -f ./dist/yomikata/kuromojijs/dict/tid.dat.gz \
		|| cp ./build/kuromojijs/dist/dict/tid.dat.gz ./dist/yomikata/kuromojijs/dict/tid.dat.gz

./build/kuromojijs: ./build
	test -d ./build/kuromojijs || git clone "$(KUROMOJI_JS_URL)" ./build/kuromojijs
	( cd ./build/kuromojijs ; git reset --hard $(KUROMOJI_JS_COMMIT) )
