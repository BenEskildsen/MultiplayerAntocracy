const React = require('react');
const Button = require('./components/Button.react');
const Checkbox = require('./Components/Checkbox.react');
const RadioPicker = require('./Components/RadioPicker.react');
const {
  makeAction,
  isActionTypeQueued
} = require('../simulation/actionQueue');
const {
  getQueen,
  getQueenBiteAction
} = require('../selectors/misc');
const {
  layEgg,
  markDirt,
  bite,
  dash
} = require('../thunks/queenThunks');
const {
  dispatchToServer
} = require('../clientToServer');
const {
  useMemo,
  useEffect,
  useState
} = React;
function AbilityControls(props) {
  const {
    dispatch,
    game,
    queen
  } = props;
  if (queen == null) return null;

  // blink handling
  const [blinkCountdown, setBlinkCountdown] = useState(15);
  const blinkOn = blinkCountdown % 2 == 0;
  let blinkInterval = null;
  const blinkFn = () => {
    if (blinkCountdown <= 0) {
      clearInterval(blinkInterval);
      setBlinkCountdown(15);
      return;
    }
    setBlinkCountdown(blinkCountdown => blinkCountdown - 1);
  };

  // Abilities
  const abilityIndex = game.config[queen.playerID].queenAbilities.indexOf(queen.selectedAbility);
  const abilityLength = game.config[queen.playerID].queenAbilities.length;
  let abilityDisplay = 'None';
  const [highlightedAbility, setHighlightedAbility] = useState(null);
  const [prevAbilities, setPrevAbilities] = useState([...game.config[queen.playerID].queenAbilities]);
  useEffect(() => {
    if (highlightedAbility != null) return;
    for (const a of game.config[queen.playerID].queenAbilities) {
      if (!prevAbilities.includes(a)) {
        setHighlightedAbility(a);
        setPrevAbilities([...game.config[queen.playerID].queenAbilities]);
        setTimeout(() => setHighlightedAbility(null), 3000);
        blinkInterval = setInterval(blinkFn, 200);
        break;
      }
    }
  }, [abilityLength, game.config[queen.playerID].queenAbilities]);
  switch (queen.selectedAbility) {
    case 'MARK_DIRT':
      abilityDisplay = 'Dig';
      break;
    case 'MARK_CHAMBER':
      abilityDisplay = 'Dig Chamber';
      break;
    case 'MARK_DIRT_PUTDOWN':
      abilityDisplay = 'Mark Dirt Putdown';
      break;
    case 'JUMP':
      abilityDisplay = 'Dash';
      break;
    case 'AUTOPILOT':
      abilityDisplay = 'AutoEggs';
      break;
    case 'BURROW':
      abilityDisplay = 'Sprint Home';
      break;
    case 'WHIRLWIND':
      abilityDisplay = 'Whirlwind';
      break;
    case 'CREATE_RAID':
      abilityDisplay = 'Start Raid';
      break;
  }

  // Pheromones
  const pherIndex = game.config[queen.playerID].queenPheromones.indexOf(queen.selectedPheromone);
  const pherLength = game.config[queen.playerID].queenPheromones.length;
  let pherDisplay = 'None';
  const [highlightedPheromone, setHighlightedPheromone] = useState(null);
  const [prevPheromones, setPrevPheromones] = useState([...game.config[queen.playerID].queenPheromones]);
  useEffect(() => {
    if (highlightedPheromone != null) return;
    for (const a of game.config[queen.playerID].queenPheromones) {
      if (!prevPheromones.includes(a)) {
        setHighlightedPheromone(a);
        setPrevPheromones([...game.config[queen.playerID].queenPheromones]);
        setTimeout(() => setHighlightedPheromone(null), 3000);
        blinkInterval = setInterval(blinkFn, 200);
        break;
      }
    }
  }, [pherLength, game.config[queen.playerID].queenPheromones]);
  switch (queen.selectedPheromone) {
    case 'QUEEN_ALERT':
      pherDisplay = 'Alert';
      break;
    case 'QUEEN_PHER':
      pherDisplay = 'Follow';
      break;
    case 'SUPPRESS':
      pherDisplay = 'Suppress';
      break;
    case 'EXPAND':
      pherDisplay = 'Expand';
      break;
    case 'CONTRACT':
      pherDisplay = 'Contract';
      break;
    case 'PATROL_DEFEND_PHER':
      pherDisplay = 'Rally';
      break;
    case 'DOMESTICATE':
      pherDisplay = 'Domesticate';
      break;
    case 'QUEEN_DISPERSE':
      pherDisplay = 'Force Retreat';
      break;
  }

  // Egg Laying
  const casteIndex = game.config[queen.playerID].queenLayingCastes.indexOf(queen.selectedCaste);
  const casteLength = game.config[queen.playerID].queenLayingCastes.length;
  let casteDisplay = 'None';
  const [highlightedCaste, setHighlightedCaste] = useState(null);
  const [prevCastes, setPrevCastes] = useState([...game.config[queen.playerID].queenLayingCastes]);
  useEffect(() => {
    if (highlightedCaste != null) return;
    for (const a of game.config[queen.playerID].queenLayingCastes) {
      if (!prevCastes.includes(a)) {
        setHighlightedCaste(a);
        setPrevCastes([...game.config[queen.playerID].queenLayingCastes]);
        setTimeout(() => setHighlightedCaste(null), 3000);
        blinkInterval = setInterval(blinkFn, 200);
        break;
      }
    }
  }, [casteLength, game.config[queen.playerID].queenLayingCastes]);
  switch (queen.selectedCaste) {
    case 'MINIMA':
      casteDisplay = /*#__PURE__*/React.createElement("span", null, "Lay ", /*#__PURE__*/React.createElement("b", null, "Worker"), " Egg (V)");
      break;
    case 'YOUNG_QUEEN':
      casteDisplay = /*#__PURE__*/React.createElement("span", null, "Lay ", /*#__PURE__*/React.createElement("b", null, "Young Queen"), " Egg (V)");
      break;
    case 'MEDIA':
      casteDisplay = /*#__PURE__*/React.createElement("span", null, "Lay ", /*#__PURE__*/React.createElement("b", null, "Major"), " Egg (V)");
      break;
    case 'MAJOR':
      casteDisplay = /*#__PURE__*/React.createElement("span", null, "Lay ", /*#__PURE__*/React.createElement("b", null, "Super Major"), " Egg (V)");
      break;
    case 'HONEY_POT':
      casteDisplay = /*#__PURE__*/React.createElement("span", null, "Lay ", /*#__PURE__*/React.createElement("b", null, "Honey Pot"), " Egg (V)");
      break;
    case 'SOLDIER':
      casteDisplay = /*#__PURE__*/React.createElement("span", null, "Lay ", /*#__PURE__*/React.createElement("b", null, "Soldier"), " Egg (V)");
      break;
    case 'SUB_MINIMA':
      casteDisplay = /*#__PURE__*/React.createElement("span", null, "Lay ", /*#__PURE__*/React.createElement("b", null, "Minima"), " Egg (V)");
      break;
    case 'QUEEN':
      casteDisplay = /*#__PURE__*/React.createElement("span", null, "Lay ", /*#__PURE__*/React.createElement("b", null, "Queen"), " Egg (V)");
      break;
    case 'EGG TOKEN':
      casteDisplay = 'Egg Token';
      break;
    case 'LARVA TOKEN':
      casteDisplay = 'Larva Token';
      break;
    case 'PUPA TOKEN':
      casteDisplay = 'Pupa Token';
      break;
    case 'DIRT TOKEN':
      casteDisplay = 'Dirt Token';
      break;
    case 'COLONY TOKEN':
      casteDisplay = 'Food Token';
      break;
  }

  // Bite label
  let biteLabel = getQueenBiteAction(game, queen).type;
  biteLabel = biteLabel[0] + biteLabel.slice(1).toLowerCase();
  const antSegmentStyle = {
    display: 'inline-block',
    backgroundColor: 'steelblue',
    border: '1px solid black',
    borderRadius: '50%',
    boxShadow: '1px 1px',
    marginRight: 8
  };
  return /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 30,
      pointerEvents: 'all'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    style: {
      position: 'absolute'
    },
    label: biteLabel + " (E)",
    disabled: game.hotKeys.keysDown.E,
    onClick: () => {
      bite(dispatch, game);
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      ...antSegmentStyle,
      marginLeft: 2,
      marginRight: 8 + 3,
      width: 30,
      height: 25,
      textAlign: 'center',
      paddingTop: 5,
      pointerEvents: 'all'
    }
  }), abilityLength == 0 ? null : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-block',
      position: 'absolute',
      pointerEvents: 'all'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    label: abilityDisplay + " (R)",
    disabled: queen.selectedAbility == 'CREATE_RAID' && game.raidCooldown > 0,
    highlighted: highlightedAbility == queen.selectedAbility && blinkOn,
    depressed: queen.abilityActive,
    onMouseDown: () => {
      const active = queen.selectedAbility == 'AUTOPILOT' ? !!!queen.autopilot : true;
      dispatch({
        type: 'SET_ABILITY_ACTIVE',
        active,
        playerID: queen.playerID
      });
      dispatchToServer({
        type: 'SET_ABILITY_ACTIVE',
        active,
        playerID: queen.playerID,
        time: game.time
      });
      if (queen.selectedAbility === 'MARK_DIRT') {
        markDirt(dispatch, game, game.playerID);
      }
      if (queen.selectedAbility == 'JUMP') {
        dash(dispatch, game);
      }
      if (queen.selectedAbility == 'WHIRLWIND') {
        if (!isActionTypeQueued(queen, 'WHIRLWIND')) {
          const entityAction = makeAction(game, queen, 'WHIRLWIND');
          dispatch({
            type: 'ENQUEUE_ENTITY_ACTION',
            entity: queen,
            entityAction
          });
          dispatchToServer({
            type: 'ENQUEUE_ENTITY_ACTION',
            entity: queen,
            entityAction,
            time: game.time
          });
        }
      }
    },
    onMouseUp: () => {
      if (queen.selectedAbility != 'AUTOPILOT' && queen.selectedAbility != 'CREATE_RAID') {
        dispatch({
          type: 'SET_ABILITY_ACTIVE',
          active: false,
          playerID: queen.playerID
        });
        dispatchToServer({
          type: 'SET_ABILITY_ACTIVE',
          active: false,
          playerID: queen.playerID,
          time: game.time
        });
      }
    }
  }), abilityLength <= 1 ? null : /*#__PURE__*/React.createElement(Button, {
    label: "> (T)",
    highlighted: highlightedAbility != null && highlightedAbility != queen.selectedAbility && blinkOn,
    onClick: () => {
      dispatch({
        type: 'SET_SELECTED_ABILITY',
        playerID: queen.playerID,
        ability: game.config[queen.playerID].queenAbilities[(abilityIndex + 1) % abilityLength]
      });
      dispatchToServer({
        type: 'SET_SELECTED_ABILITY',
        playerID: queen.playerID,
        ability: game.config[queen.playerID].queenAbilities[(abilityIndex + 1) % abilityLength],
        time: game.time
      });
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 450
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...antSegmentStyle,
      marginLeft: 7,
      marginRight: 8 + 8,
      width: 20,
      height: 22,
      textAlign: 'center',
      paddingTop: 5,
      pointerEvents: 'all'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: -4.5
    }
  })), pherLength == 0 ? null : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-block',
      position: 'absolute',
      pointerEvents: 'all'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    label: pherDisplay + " (F)",
    depressed: queen.pheromoneActive,
    highlighted: highlightedPheromone == queen.selectedPheromone && blinkOn,
    onClick: () => {
      const active = !queen.pheromoneActive;
      dispatch({
        type: 'SET_PHEROMONE_ACTIVE',
        active,
        playerID: queen.playerID
      });
      dispatchToServer({
        type: 'SET_PHEROMONE_ACTIVE',
        active,
        playerID: queen.playerID,
        time: game.time
      });
    }
  }), pherLength <= 1 ? null : /*#__PURE__*/React.createElement(Button, {
    label: "> (G)",
    highlighted: highlightedPheromone != null && highlightedPheromone != queen.selectedPheromone && blinkOn,
    onClick: () => {
      dispatch({
        type: 'SET_SELECTED_PHEROMONE',
        playerID: queen.playerID,
        pheromone: game.config[queen.playerID].queenPheromones[(pherIndex + 1) % pherLength]
      });
      dispatchToServer({
        type: 'SET_SELECTED_PHEROMONE',
        playerID: queen.playerID,
        pheromone: game.config[queen.playerID].queenPheromones[(pherIndex + 1) % pherLength],
        time: game.time
      });
    }
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      ...antSegmentStyle,
      width: 35,
      height: 30,
      textAlign: 'center',
      paddingTop: 10
    }
  }, queen.eggCharges), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-block',
      position: 'absolute',
      pointerEvents: 'all'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    disabled: queen.eggCharges == 0,
    id: 'eggLayingButton',
    label: casteDisplay,
    highlighted: highlightedCaste == queen.selectedCaste && blinkOn,
    onClick: () => layEgg(dispatch, game, game.playerID)
  }), game.config[queen.playerID].queenLayingCastes.length <= 1 ? null : /*#__PURE__*/React.createElement(Button, {
    label: "> (B)",
    highlighted: highlightedCaste != null && highlightedCaste != queen.selectedCaste && blinkOn,
    onClick: () => {
      dispatch({
        type: 'SET_LAYING_CASTE',
        playerID: queen.playerID,
        caste: game.config[queen.playerID].queenLayingCastes[(casteIndex + 1) % casteLength]
      });
      dispatchToServer({
        type: 'SET_LAYING_CASTE',
        playerID: queen.playerID,
        caste: game.config[queen.playerID].queenLayingCastes[(casteIndex + 1) % casteLength],
        time: game.time
      });
    }
  }))));
}
module.exports = AbilityControls;