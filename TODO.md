# TODO

- [x] add startup modal dialog
- [x] add report of one project
- [x] add share modal dialog
- [x] update FILES.md
- [ ] add analyze cache to improve performance
- [ ] add compare with yesterday and last week
- [ ] more unit tests
- [ ] custom chart color scheme
- [ ] replace glyphicons to ionicons
- [ ] more share charts
- [ ] add eslint to unit test to keeping code health
- [ ] add CONTRIBUTING.md file
- From issues:
	- [ ] add 24 hours report for custom date
  - [ ] translation to Brazilian Portuguese
	- [ ] better time display format
		- from "1.5 hrs" => "1h 30m"
		- way
			1. removing all `convertUnit2Hour` in `charts/*.js`
			2. implementing `getReadableTimeString: (ms: number) => string` 
			2. replacing all `xxTime.toFixed(2)` to `getReadableTimeString`

