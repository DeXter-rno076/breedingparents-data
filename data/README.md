file name (optional info): description | purpose
* babys.json (written by hand): array of baby pokémon | removing irrelevant attributes from PkmnObjs

* babysOptional.json (written by hand): array of baby pokémon that need something like Lax Incense to be born | keeping breedinglearnsets of evolutions of optional babys

* evos.json: pre evo, name and post evo for every pokémon | evolution data of all pkmns for removing breedingLearnsets of evos

* evosManual.json: manually written evos data of some pkmn (some is needed permanently some is temporary (createEvoData.ts itself should manage branch evos itself at some point)) | createEvoData.ts can't handle branch evos yet, so they're handled via this

* renamedMovesData.json: pairs of old move names with their current one | at the end all old move names get replaced with the current one to avoid complications with old gen learnsets

* specialAtkRowFormSelector: AtkRow Game parameter form identifying texts with their usable form identifier | used to identify some edge cases, esp. form identifiers in AtkRows that target multiple forms (like Lucanroc)

* specialforms.json (written by hand): json structure that contains all data to identify multiple pokémon forms in learnset subpages | needed for handling learnset pages of pkmn with specialforms; has to be updated frequently

* logs/errorlog.txt
* logs/statuslog.txt
* logs/warninglog.txt