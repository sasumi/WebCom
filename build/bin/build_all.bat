@echo off
setlocal EnableDelayedExpansion
(set \n=^
%=Do not remove this line=%
)

echo Building dist/ywj.min.js
java -jar closure-compiler.jar ^
	--js ../src/component/*.js ^
	--create_source_map ../dist/webcom.min.map ^
	--source_map_format V3 ^
	--compilation_level WHITESPACE_ONLY ^
	--js_output_file ../dist/ywj.min.js ^
	--output_wrapper "%%output%%!\n!//@ sourceMappingURL=../dist/ywj.min.map"

echo Building dist/ywj.debug.js
java -jar closure-compiler.jar ^
	--js ../src/component/*.js ^
	--js_output_file ../dist/ywj.debug.js ^
	--compilation_level BUNDLE

echo Done