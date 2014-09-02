test:
	mocha -R dot
buildweb:
	./node_modules/browserify/bin/cmd.js . --standalone validator -o validator-web.js

.PHONY: test buildweb
