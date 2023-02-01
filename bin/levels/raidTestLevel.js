module.exports = {"numPlayers":1,"gridWidth":75,"gridHeight":75,"cpuSpecies":["Leaf Cutter Ants","Desert Ants"],"upgrades":[{"type":"UPGRADE","name":"Alert Pheromone","description":"A pheromone ability that spurs all nearby workers to drop everything and fight. (Alerted ants will also attack nearby vines, which when killed occasionally produce food and seeds)","path":[1,"queenPheromones"],"value":"QUEEN_ALERT","operation":"append","sequenceID":"Aggression","sequenceIndex":1,"levelOnly":true},{"type":"UPGRADE","name":"Raid Ability","description":"Select a spot on the minimap to raid with your entire colony. Can only be used once every 4 minutes","path":[1,"queenAbilities"],"value":"CREATE_RAID","operation":"append","levelOnly":true}],"actions":[{"type":"CREATE_ENTITIES","entityType":"ANT","rect":{"position":{"x":8,"y":17},"width":1,"height":1},"args":[1,"QUEEN",false]},{"type":"CREATE_ENTITIES","entityType":"SCORPION","rect":{"position":{"x":10,"y":9},"width":1,"height":1},"args":[false]},{"type":"DELETE_ENTITIES","rect":{"position":{"x":12,"y":11},"width":1,"height":1}},{"type":"CREATE_ENTITIES","entityType":"SPIDER_WEB","rect":{"position":{"x":9,"y":8},"width":10,"height":8},"args":[10,8]},{"type":"DELETE_ENTITIES","rect":{"position":{"x":16,"y":10},"width":1,"height":1}},{"type":"CREATE_ENTITIES","entityType":"SCORPION","rect":{"position":{"x":16,"y":9},"width":1,"height":1},"args":[false]},{"type":"CREATE_ENTITIES","entityType":"ANT","rect":{"position":{"x":8,"y":8},"width":6,"height":6},"args":[1,"MINIMA",false]},{"type":"DELETE_ENTITIES","rect":{"position":{"x":18,"y":12},"width":1,"height":1}},{"type":"DELETE_ENTITIES","rect":{"position":{"x":23,"y":21},"width":1,"height":1}},{"type":"DELETE_ENTITIES","rect":{"position":{"x":19,"y":19},"width":1,"height":1}},{"type":"DELETE_ENTITIES","rect":{"position":{"x":20,"y":20},"width":1,"height":1}},{"type":"DELETE_ENTITIES","rect":{"position":{"x":20,"y":0},"width":1,"height":1}},{"type":"DELETE_ENTITIES","rect":{"position":{"x":3,"y":2},"width":1,"height":1}},{"type":"DELETE_ENTITIES","rect":{"position":{"x":2,"y":10},"width":1,"height":1}},{"type":"DELETE_ENTITIES","rect":{"position":{"x":20,"y":20},"width":1,"height":1}},{"type":"DELETE_ENTITIES","rect":{"position":{"x":23,"y":-5},"width":1,"height":1}},{"type":"DELETE_ENTITIES","rect":{"position":{"x":24,"y":-6},"width":1,"height":1}},{"type":"DELETE_ENTITIES","rect":{"position":{"x":4,"y":4},"width":1,"height":1}},{"type":"DELETE_ENTITIES","rect":{"position":{"x":2,"y":1},"width":2,"height":2}},{"type":"DELETE_ENTITIES","rect":{"position":{"x":2,"y":1},"width":1,"height":1}},{"type":"DELETE_ENTITIES","rect":{"position":{"x":1,"y":1},"width":1,"height":1}},{"type":"DELETE_ENTITIES","rect":{"position":{"x":4,"y":3},"width":1,"height":1}},{"type":"DELETE_ENTITIES","rect":{"position":{"x":39,"y":5},"width":1,"height":1}},{"type":"DELETE_ENTITIES","rect":{"position":{"x":54,"y":13},"width":1,"height":1}},{"type":"DELETE_ENTITIES","rect":{"position":{"x":50,"y":38},"width":1,"height":1}},{"type":"DELETE_ENTITIES","rect":{"position":{"x":55,"y":52},"width":1,"height":1}}]};