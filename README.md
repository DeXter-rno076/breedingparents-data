# description
Creates the data sets needed for the specialpage breeding parents.
These have to be saved in wiki pages with the following name scheme:
* pkmn data: `MediaWiki:Zuchteltern/GenX/pkmn-dataN.json` (X := gen number; N := file index, starting from 1)
* egg group data: `MediaWiki:Zuchteltern/GenX/egg-groups.json` (X := gen number)

These data sets are explicitly **not** usable as a source for in game data because various values are changed in terms of consistency. These data sets have the goal to make life as easy as possible for the special page. Correctly resembling information from the games is irrelevant.

# how to run
Installing dependencies
```
$ npm install
```

Compiling code
```
$ npm run build
```

Running program
```
$ npm run create_datasets
```
(if you want, you can watch the progress in `data/logs/statuslogs.txt`)

Split data files are in `data/separatedoutput`. Unsplit files are in `data/output`.
If you want a custom maximum file length of the JSON files in formatted form edit the `MAX_FILE_SIZE` constant in `src/constants.ts` and compile.

# WHAT TO KEEP UP TO DATE
* some constants in `src/constants.ts`
* some data files (info about them is in `data/README.md`):
  * `data/babys.json`
  * `data/babysOptional.json`
  * `data/evosManual.json`
  * `data/renamedMovesData.json`
  * `data/specialAtkRowFormSelectors.json`
  * `data/specialforms.json`
* `data/evos.json` by running `built/src/pkmn-data/createEvoData.js` (after updating `evosManual.json`)

# todo
* (branch evolutions of evo data creator)
* moves that dont exist in one gen for oldGenLearnsets => first add banned moves category for bdsp
* splitting somehow scrambles the order of pkmn (not a problem but ugly)
* update this readme
  
extra check:
Barschuft
Gastrodon
Necrozma
Wolwerock
maybe add "Von Vorentwicklungen" to directLearnsets
ef-em
Regionalformen usw.
exists-property (esp. for PLA) is very often inaccurate: cant determine it solely by learnset tables