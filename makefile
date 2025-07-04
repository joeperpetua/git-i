build:
	npm run build

publish:
	npm version patch
	npm publish --access=public