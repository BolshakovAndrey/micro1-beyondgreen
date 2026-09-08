.PHONY: setup baseline solution test eval replay demo artifacts-check submission

setup:
	npm ci --ignore-scripts

baseline:
	npm run task -- baseline:verify --evaluation-version eval-v1.1.0

solution:
	npm run task -- beyondgreen:verify --evaluation-version eval-v1.1.0

test:
	npm test

eval replay:
	npm run task -- replay --evaluation-version eval-v1.1.0

demo:
	npm run task -- d01:demo

artifacts-check:
	npm run compile
	npm run task -- checksums:check
	npm run task -- replay --evaluation-version eval-v1.1.0
	npm run task -- submission:artifacts:check

submission:
	npm run task -- submission:rehearse
