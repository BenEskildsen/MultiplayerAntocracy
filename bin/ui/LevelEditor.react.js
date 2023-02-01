const React = require('react');
const globalConfig = require('../config');
const Button = require('./components/Button.react');
const Checkbox = require('./components/Checkbox.react');
const Divider = require('./components/Divider.react');
const Dropdown = require('./components/Dropdown.react');
const Slider = require('./components/Slider.react');
const NumberField = require('./components/NumberField.react');
const {
  render
} = require('../render/render');
const {
  initMouseControlsSystem
} = require('../systems/mouseControlsSystem');
const {
  lookupInGrid
} = require('../utils/gridHelpers');
const {
  add,
  subtract,
  equals,
  makeVector,
  floor,
  round,
  ceil,
  toRect
} = require('../utils/vectors');
const {
  getQueen
} = require('../selectors/misc');
const {
  allUpgrades,
  applyUpgrade,
  argentineanAntUpgrades,
  marauderAntUpgrades,
  desertAntUpgrades,
  leafCutterAntUpgrades
} = require('../state/upgrades');
const {
  useEffect,
  useState,
  useMemo
} = React;
function LevelEditor(props) {
  const {
    dispatch,
    state
  } = props;
  const {
    game
  } = state;

  // position level editor to the right of the canvas
  const canvasDiv = document.getElementById('canvasWrapper');
  let left = 0;
  if (canvasDiv != null) {
    const rect = canvasDiv.getBoundingClientRect();
    left = rect.left + rect.width + 4;
  }

  // editor state:
  const [editor, setEditor] = useState({
    version: 0,
    // just a way to force the effect to redo
    started: false,
    importedLevel: {},
    numPlayers: 1,
    gridWidth: game.gridHeight,
    gridHeight: game.gridWidth,
    playerID: 1,
    paletteMode: 'CREATE ENTITIES',
    // species/upgrades
    cpuSpecies: ['Leaf Cutter Ants', 'Desert Ants'],
    selectedSpecies: 'Marauder Ants',
    upgrade: 'Longer Queen',
    upgradeFilter: 'All',
    saveUpgrades: false,
    // entity creation mode
    deleteMode: false,
    entityType: 'ANT',
    subdividing: false,
    caste: 'QUEEN',
    pheromoneType: 'COLONY',
    background: 'FLOOR_TILE',
    termiteCaste: 'TERMITE_WORKER',
    numSegments: 8,
    doodad: 'QUESTION',
    stoneSubType: 'STONE',
    vineSubType: 'BUD',
    seedType: 'VINE',
    dir: 'up',
    critterEggType: 'BEETLE',
    isGoalCritter: false,
    // copy-paste mode
    clipboardMode: 'COPY',
    // pheromone mode
    selectedPheromone: 'WATER',
    pheromoneQuantity: globalConfig.config.WATER.quantity
  });
  const upgradeOptions = useMemo(() => {
    switch (editor.upgradeFilter) {
      case 'ALL':
        return allUpgrades;
      case 'Argentinean':
        {
          const {
            initial,
            additional,
            triviaBased
          } = argentineanAntUpgrades();
          const options = {};
          for (const up of initial) options[up.name] = up;
          for (const up of additional) options[up.name] = up;
          for (const up of triviaBased) options[up.name] = up;
          return options;
        }
      case 'Leaf Cutter':
        {
          const {
            initial,
            additional,
            triviaBased
          } = leafCutterAntUpgrades();
          const options = {};
          for (const up of initial) options[up.name] = up;
          for (const up of additional) options[up.name] = up;
          for (const up of triviaBased) options[up.name] = up;
          return options;
        }
      case 'Marauder':
        {
          const {
            initial,
            additional,
            triviaBased
          } = marauderAntUpgrades();
          const options = {};
          for (const up of initial) options[up.name] = up;
          for (const up of additional) options[up.name] = up;
          for (const up of triviaBased) options[up.name] = up;
          return options;
        }
      case 'Desert':
        {
          const {
            initial,
            additional,
            triviaBased
          } = desertAntUpgrades();
          const options = {};
          for (const up of initial) options[up.name] = up;
          for (const up of additional) options[up.name] = up;
          for (const up of triviaBased) options[up.name] = up;
          return options;
        }
    }
    return allUpgrades;
  }, [editor.upgradeFilter]);
  useEffect(() => {
    setEditor({
      ...editor,
      upgrade: Object.keys(upgradeOptions)[0]
    });
  }, [upgradeOptions]);
  useEffect(() => {
    const handlers = {
      scroll: (state, dispatch, zoom) => {
        dispatch({
          type: 'INCREMENT_ZOOM',
          zoom
        });
      }
    };
    if (editor.paletteMode == 'CREATE ENTITIES') {
      handlers.mouseMove = () => {}; // placeholder
      handlers.leftUp = (state, dispatch, gridPos) => {
        const rect = toRect(state.game.mouse.downPos, gridPos);
        if (editor.deleteMode == false) {
          createEntities(state.game, dispatch, editor, rect);
        } else {
          dispatch({
            type: 'DELETE_ENTITIES',
            rect
          });
        }
        setEditor({
          ...editor,
          version: editor.version + 1
        });
      };
    } else if (editor.paletteMode == 'PHEROMONES') {
      handlers.mouseMove = null;
      handlers.leftDown = (state, dispatch, gridPos) => {
        dispatch({
          type: 'FILL_PHEROMONE',
          gridPos,
          pheromoneType: editor.selectedPheromone,
          playerID: state.game.playerID,
          quantity: editor.pheromoneQuantity
        });
      };
    } else if (editor.paletteMode == 'COPY-PASTE') {
      handlers.mouseMove = () => {}; // placeholder
      handlers.leftUp = (state, dispatch, gridPos) => {
        const rect = toRect(state.game.mouse.downPos, gridPos);
        if (editor.clipboardMode == 'COPY') {
          dispatch({
            type: 'COPY_ENTITIES',
            rect
          });
        } else if (editor.clipboardMode == 'PASTE') {
          dispatch({
            type: 'PASTE_ENTITIES',
            pastePos: gridPos
          });
        }
        setEditor({
          ...editor,
          version: editor.version + 1
        });
      };
    }
    initMouseControlsSystem(store, handlers);
    registerHotkeys(dispatch, editor, setEditor);
    render(game);
  }, [editor, editor.paletteMode]);

  // re-render when mouse is down and moving to draw marquee
  useEffect(() => {
    if (game.mouse.isLeftDown) {
      render(game);
    }
  }, [game.mouse.curPos]);

  // do this one time to re-render on load
  useEffect(() => {
    setTimeout(() => {
      console.log("re-rendering");
      const nextState = {};
      let anyChanged = false;
      if (state.game.numPlayers != editor.numPlayers) {
        nextState.numPlayers = state.game.numPlayers;
      }
      if (state.game.gridWidth != editor.gridWidth) {
        nextState.gridWidth = state.game.gridWidth;
      }
      if (state.game.gridHeight != editor.gridHeight) {
        nextState.gridHeight = state.game.gridHeight;
      }
      setEditor({
        ...editor,
        version: editor.version + 1,
        ...nextState
      });
    }, 500);
  }, []);
  let palette = null;
  switch (editor.paletteMode) {
    case 'CREATE ENTITIES':
      palette = createEntitiesPalette(dispatch, state, editor, setEditor);
      break;
    case 'PHEROMONES':
      palette = pheromonePalette(dispatch, state, editor, setEditor);
      break;
    case 'COPY-PASTE':
      palette = copyPastePalette(dispatch, state, editor, setEditor);
      break;
  }
  return /*#__PURE__*/React.createElement("div", {
    id: "levelEditor",
    style: {
      position: 'absolute',
      height: '100%',
      width: 500,
      left,
      top: 0
    }
  }, /*#__PURE__*/React.createElement("b", null, "Global Parameters:"), /*#__PURE__*/React.createElement("div", null, "Number of Players:", /*#__PURE__*/React.createElement(NumberField, {
    value: editor.numPlayers,
    onChange: numPlayers => setEditor({
      ...editor,
      numPlayers
    })
  })), /*#__PURE__*/React.createElement("div", null, "Grid Width:", /*#__PURE__*/React.createElement(NumberField, {
    value: editor.gridWidth,
    onChange: gridWidth => setEditor({
      ...editor,
      gridWidth
    })
  })), /*#__PURE__*/React.createElement("div", null, "Grid Height:", /*#__PURE__*/React.createElement(NumberField, {
    value: editor.gridHeight,
    onChange: gridHeight => setEditor({
      ...editor,
      gridHeight
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    label: "Submit Changes",
    onClick: () => {
      dispatch({
        type: 'SET_PLAYERS_AND_SIZE',
        numPlayers: editor.numPlayers,
        gridWidth: editor.gridWidth,
        gridHeight: editor.gridHeight
      });
      setEditor({
        ...editor,
        playerID: editor.playerID > editor.numPlayers ? editor.numPlayers : editor.playerID,
        version: editor.version + 1
      });
    }
  })), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Dropdown, {
    options: ['CREATE ENTITIES', 'PHEROMONES', 'COPY-PASTE'],
    selected: editor.paletteMode,
    onChange: paletteMode => {
      setEditor({
        ...editor,
        paletteMode
      });
      if (paletteMode == 'COPY-PASTE') {
        dispatch({
          type: 'SET_MARQUEE_MODE',
          keepMarquee: true
        });
      } else {
        dispatch({
          type: 'SET_MARQUEE_MODE',
          keepMarquee: false
        });
      }
    }
  })), palette, /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("b", null, "Configuration:"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Dropdown, {
    options: Object.keys(upgradeOptions),
    selected: editor.upgrade,
    onChange: upgrade => setEditor({
      ...editor,
      upgrade
    })
  }), /*#__PURE__*/React.createElement(Button, {
    label: "Apply Upgrade",
    onClick: () => {
      applyUpgrade(dispatch, game, editor.playerID, allUpgrades[editor.upgrade], !editor.saveUpgrades);
      if (allUpgrades[editor.upgrade].needsReset) {
        dispatch({
          type: 'STOP_TICK'
        });
        setEditor({
          ...editor,
          started: false
        });
        dispatch({
          type: 'SET_PLAYERS_AND_SIZE',
          reset: true
        });
      } else {
        setEditor({
          ...editor,
          version: editor.version + 1
        });
      }
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Save Upgrades",
    checked: editor.saveUpgrades,
    onChange: saveUpgrades => setEditor({
      ...editor,
      saveUpgrades
    })
  })), /*#__PURE__*/React.createElement("div", null, "Filter upgrades:", /*#__PURE__*/React.createElement(Dropdown, {
    options: ['All', 'Leaf Cutter', 'Argentinean', 'Marauder', 'Desert'],
    selected: editor.upgradeFilter,
    onChange: upgradeFilter => setEditor({
      ...editor,
      upgradeFilter
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, "Upgrades Applied:"), state.campaign.upgrades.filter(u => u.name != null).map(u => /*#__PURE__*/React.createElement("div", null, "- Player ", u.path[0], ": ", u.name))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    label: "Clear Upgrades",
    onClick: () => {
      dispatch({
        type: 'CLEAR_UPGRADES'
      });
      dispatch({
        type: 'SET_PLAYERS_AND_SIZE'
      });
      setEditor({
        ...editor,
        version: editor.version + 1
      });
    }
  })), /*#__PURE__*/React.createElement("div", null, "Set player species", /*#__PURE__*/React.createElement(Dropdown, {
    options: ['Leaf Cutter Ants', 'Marauder Ants', 'Desert Ants'],
    selected: editor.selectedSpecies,
    onChange: selectedSpecies => setEditor({
      ...editor,
      selectedSpecies
    })
  }), /*#__PURE__*/React.createElement(Button, {
    label: "Set Species",
    onClick: () => {
      let nextCPUSpecies = editor.cpuSpecies;
      console.log("next", nextCPUSpecies);
      nextCPUSpecies[editor.playerID - 2] = editor.selectedSpecies;
      dispatch({
        type: 'SET_SPECIES',
        playerID: editor.playerID,
        species: editor.selectedSpecies
      });
      setEditor({
        ...editor,
        cpuSpecies: nextCPUSpecies
      });
    }
  })), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("b", null, "Simulation Controls:"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    label: editor.started || game.time > 0 ? "Reset" : "Start",
    disabled: !editor.started && getQueen(state.game, state.game.playerID) == null,
    onClick: () => {
      if (editor.started || game.time > 0) {
        setEditor({
          ...editor,
          started: false
        });
        dispatch({
          type: 'STOP_TICK'
        });
        dispatch({
          type: 'SET_PLAYERS_AND_SIZE',
          reset: true
        });
      } else {
        setEditor({
          ...editor,
          started: true
        });
        dispatch({
          type: 'START_TICK'
        });
      }
    }
  }), /*#__PURE__*/React.createElement(Button, {
    label: state.game.tickInterval == null && state.game.time > 1 ? 'Play' : 'Pause',
    disabled: state.game.time <= 1,
    onClick: () => {
      if (state.game.tickInterval == null) {
        dispatch({
          type: 'START_TICK'
        });
      } else {
        dispatch({
          type: 'STOP_TICK'
        });
        setEditor({
          ...editor,
          version: editor.version + 1
        });
      }
    }
  }), /*#__PURE__*/React.createElement(Button, {
    label: "Step (M)",
    disabled: state.game.time <= 1,
    onClick: () => {
      dispatch({
        type: 'TICK'
      });
    }
  }), /*#__PURE__*/React.createElement(Button, {
    label: "Step x10 (J)",
    disabled: state.game.time <= 1,
    onClick: () => {
      for (let i = 0; i < 10; i++) {
        dispatch({
          type: 'TICK'
        });
      }
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Show True Positions",
    checked: !!state.game.showTruePositions,
    onChange: shouldShow => dispatch({
      type: 'SET',
      value: shouldShow,
      property: 'showTruePositions'
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Show Ant Decision Weights",
    checked: !!state.game.showAntDecision,
    onChange: shouldShow => dispatch({
      type: 'SET',
      value: shouldShow,
      property: 'showAntDecision'
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Show Hitboxes",
    checked: !!state.game.showHitboxes,
    onChange: shouldShow => dispatch({
      type: 'SET',
      value: shouldShow,
      property: 'showHitboxes'
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Show True Hitboxes (slow)",
    checked: !!state.game.showTrueHitboxes,
    onChange: shouldShow => dispatch({
      type: 'SET',
      value: shouldShow,
      property: 'showTrueHitboxes'
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Show Positions In Front",
    checked: !!state.game.showPositionsInFront,
    onChange: shouldShow => dispatch({
      type: 'SET',
      value: shouldShow,
      property: 'showPositionsInFront'
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Show Entity IDs",
    checked: !!state.game.showEntityIDs,
    onChange: shouldShow => dispatch({
      type: 'SET',
      value: shouldShow,
      property: 'showEntityIDs'
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Show Food Marked for Pickup",
    checked: !!state.game.showMarkedFood,
    onChange: shouldShow => dispatch({
      type: 'SET',
      value: shouldShow,
      property: 'showMarkedFood'
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Set View to Queen",
    checked: !!state.game.focusedEntity,
    onChange: shouldShow => {
      if (state.game.focusedEntity) {
        dispatch({
          type: 'SET',
          value: null,
          property: 'focusedEntity'
        });
      } else {
        dispatch({
          type: 'SET',
          value: getQueen(game, game.playerID),
          property: 'focusedEntity'
        });
      }
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    label: "Reset View",
    onClick: () => {
      const queen = game.focusedEntity;
      if (queen != null) {
        const viewWidth = globalConfig.config.viewWidth;
        const viewHeight = globalConfig.config.viewHeight;
        const viewPos = {
          x: queen.position.x - viewWidth / 2,
          y: queen.position.y - viewHeight / 2
        };
        dispatch({
          type: 'SET_VIEW_POS',
          viewPos,
          viewWidth,
          viewHeight
        });
        setEditor({
          ...editor,
          version: editor.version + 1
        });
      }
    }
  }), /*#__PURE__*/React.createElement(Button, {
    label: "Re-render",
    onClick: () => {
      game.viewImage.allStale = true;
      render(game);
    }
  }))), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("b", null, "Export:"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    label: "Export as JSON",
    onClick: () => {
      const json = {
        numPlayers: state.game.numPlayers,
        gridWidth: state.game.gridWidth,
        gridHeight: state.game.gridHeight,
        cpuSpecies: editor.cpuSpecies,
        // only export named upgrades
        upgrades: state.campaign.upgrades.filter(u => u.name != null),
        actions: state.editor.actions.slice(0, state.editor.index)
      };
      console.log(JSON.stringify(json));
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    label: "Import from JSON",
    onClick: () => {
      dispatch({
        type: 'SET_LEVEL',
        level: editor.importedLevel
      });
      dispatch({
        type: 'SET_PLAYERS_AND_SIZE'
      });
      setEditor({
        ...editor,
        numPlayers: editor.importedLevel.numPlayers,
        gridWidth: editor.importedLevel.gridWidth,
        gridHeight: editor.importedLevel.gridHeight
      });
      setTimeout(() => setEditor({
        ...editor,
        numPlayers: editor.importedLevel.numPlayers,
        gridWidth: editor.importedLevel.gridWidth,
        gridHeight: editor.importedLevel.gridHeight,
        version: editor.version + 1
      }), 1000);
    }
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: JSON.stringify(editor.importedLevel),
    onChange: ev => {
      const json = JSON.parse(ev.target.value);
      setEditor({
        ...editor,
        importedLevel: json
      });
    }
  })));
}

// ---------------------------------------------------------------
// Palettes
// ---------------------------------------------------------------

function createEntitiesPalette(dispatch, state, editor, setEditor) {
  const game = state.game;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Delete",
    checked: editor.deleteMode,
    onChange: deleteMode => setEditor({
      ...editor,
      deleteMode
    })
  })), /*#__PURE__*/React.createElement("div", null, "Editing Player:", /*#__PURE__*/React.createElement(Dropdown, {
    options: Object.keys(state.game.players).map(p => parseInt(p)),
    selected: editor.playerID,
    onChange: playerID => setEditor({
      ...editor,
      playerID
    })
  })), "Create Entity: ", /*#__PURE__*/React.createElement(Dropdown, {
    options: globalConfig.config.entityTypes,
    selected: editor.entityType,
    onChange: entityType => setEditor({
      ...editor,
      entityType
    })
  }), createEntityOptions(game, editor, setEditor), /*#__PURE__*/React.createElement(Button, {
    label: "Undo (U)",
    disabled: game.tickInterval != null || editor.started,
    onClick: () => {
      dispatch({
        type: 'UNDO',
        reset: true
      });
      setEditor({
        ...editor,
        version: editor.version + 1
      });
    }
  }), /*#__PURE__*/React.createElement(Button, {
    label: "Redo (O)",
    disabled: game.tickInterval != null || editor.started,
    onClick: () => {
      dispatch({
        type: 'REDO',
        reset: true
      });
      setEditor({
        ...editor,
        version: editor.version + 1
      });
    }
  }));
}
function pheromonePalette(dispatch, state, editor, setEditor) {
  const config = globalConfig.config;
  const game = state.game;
  return /*#__PURE__*/React.createElement("div", null, "Selected Pheromone:", /*#__PURE__*/React.createElement(Dropdown, {
    options: config.pheromoneTypes,
    selected: editor.selectedPheromone,
    onChange: selectedPheromone => setEditor({
      ...editor,
      selectedPheromone,
      pheromoneQuantity: config[selectedPheromone].quantity
    })
  }), /*#__PURE__*/React.createElement(Slider, {
    key: 'pheromoneSlider_' + editor.selectedPheromone,
    min: 0,
    max: config[editor.selectedPheromone].quantity,
    value: editor.pheromoneQuantity,
    label: 'Quantity',
    onChange: pheromoneQuantity => setEditor({
      ...editor,
      pheromoneQuantity
    })
  }), /*#__PURE__*/React.createElement("div", null), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Render Pheromone",
    checked: !!game.pheromoneDisplay[editor.selectedPheromone],
    onChange: isVisible => dispatch({
      type: 'SET_PHEROMONE_VISIBILITY',
      pheromoneType: editor.selectedPheromone,
      isVisible
    })
  }), /*#__PURE__*/React.createElement("div", null), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Render Pheromones As Values",
    checked: !!state.game.showPheromoneValues,
    onChange: shouldShow => dispatch({
      type: 'SET',
      value: shouldShow,
      property: 'showPheromoneValues'
    })
  }));
}
function copyPastePalette(dispatch, state, editor, setEditor) {
  const config = globalConfig.config;
  return /*#__PURE__*/React.createElement("div", null, "Clipboard Mode:", /*#__PURE__*/React.createElement(Dropdown, {
    options: ['COPY', 'PASTE'],
    selected: editor.clipboardMode,
    onChange: clipboardMode => setEditor({
      ...editor,
      clipboardMode
    })
  }));
}

// ---------------------------------------------------------------
// Hotkeys
// ---------------------------------------------------------------

function registerHotkeys(dispatch, editor, setEditor) {
  dispatch({
    type: 'SET_HOTKEY',
    press: 'onKeyDown',
    key: 'up',
    fn: s => {
      const game = s.getState().game;
      let moveAmount = Math.round(Math.max(1, game.gridHeight / 10));
      if (game.tickInterval == null) {
        dispatch({
          type: 'SET_VIEW_POS',
          viewPos: add(game.viewPos, {
            x: 0,
            y: moveAmount
          })
        });
        setEditor({
          ...editor,
          version: editor.version + 1
        });
      }
    }
  });
  dispatch({
    type: 'SET_HOTKEY',
    press: 'onKeyDown',
    key: 'down',
    fn: s => {
      const game = s.getState().game;
      let moveAmount = Math.round(Math.max(1, game.gridHeight / 10));
      if (game.tickInterval == null) {
        dispatch({
          type: 'SET_VIEW_POS',
          viewPos: add(game.viewPos, {
            x: 0,
            y: -1 * moveAmount
          })
        });
        setEditor({
          ...editor,
          version: editor.version + 1
        });
      }
    }
  });
  dispatch({
    type: 'SET_HOTKEY',
    press: 'onKeyDown',
    key: 'left',
    fn: s => {
      const game = s.getState().game;
      let moveAmount = Math.round(Math.max(1, game.gridWidth / 10));
      if (game.tickInterval == null) {
        dispatch({
          type: 'SET_VIEW_POS',
          viewPos: add(game.viewPos, {
            x: -1 * moveAmount,
            y: 0
          })
        });
        setEditor({
          ...editor,
          version: editor.version + 1
        });
      }
    }
  });
  dispatch({
    type: 'SET_HOTKEY',
    press: 'onKeyDown',
    key: 'right',
    fn: s => {
      const game = s.getState().game;
      let moveAmount = Math.round(Math.max(1, game.gridWidth / 10));
      if (game.tickInterval == null) {
        dispatch({
          type: 'SET_VIEW_POS',
          viewPos: add(game.viewPos, {
            x: moveAmount,
            y: 0
          })
        });
        setEditor({
          ...editor,
          version: editor.version + 1
        });
      }
    }
  });
  // dispatch({
  //   type: 'SET_HOTKEY', press: 'onKeyDown',
  //   key: 'O',
  //   fn: (s) => {
  //     const game = s.getState().game;
  //     dispatch({type: 'INCREMENT_ZOOM', zoom: 1});
  //     setEditor({...editor, version: editor.version + 1});
  //   }
  // });
  dispatch({
    type: 'SET_HOTKEY',
    press: 'onKeyDown',
    key: 'M',
    fn: s => {
      dispatch({
        type: 'TICK'
      });
    }
  });
  dispatch({
    type: 'SET_HOTKEY',
    press: 'onKeyDown',
    key: 'J',
    fn: s => {
      for (let i = 0; i < 8; i++) {
        dispatch({
          type: 'TICK'
        });
      }
    }
  });
  dispatch({
    type: 'SET_HOTKEY',
    press: 'onKeyDown',
    key: 'I',
    fn: s => {
      const game = s.getState().game;
      dispatch({
        type: 'INCREMENT_ZOOM',
        zoom: -1
      });
      setEditor({
        ...editor,
        version: editor.version + 1
      });
    }
  });
  dispatch({
    type: 'SET_HOTKEY',
    press: 'onKeyDown',
    key: 'U',
    fn: s => {
      if (editor.started) return;
      const game = s.getState().game;
      dispatch({
        type: 'UNDO'
      });
      setEditor({
        ...editor,
        version: editor.version + 1
      });
    }
  });
  dispatch({
    type: 'SET_HOTKEY',
    press: 'onKeyUp',
    key: 'O',
    fn: s => {
      setTimeout(() => {
        if (editor.started) return;
        const game = s.getState().game;
        dispatch({
          type: 'REDO'
        });
        setEditor({
          ...editor,
          version: editor.version + 1
        });
      }, 10);
    }
  });
}

// ---------------------------------------------------------------
// Entity Creation
// ---------------------------------------------------------------

function createEntities(game, dispatch, editor, rect) {
  let args = [];
  switch (editor.entityType) {
    case 'DIRT':
    case 'FOOD':
      if (editor.subdividing) {
        args = [rect.width, rect.height];
      } else {
        args = [1, 1]; // width and height
      }

      break;
    case 'STONE':
      args = [editor.stoneSubType, 1, 1]; // width and height
      break;
    case 'VINE':
      let theta = 0;
      if (editor.dir == 'down') {
        theta = Math.PI;
      } else if (editor.dir == 'right') {
        theta = Math.PI / 2;
      } else if (editor.dir == 'left') {
        theta = 3 * Math.PI / 2;
      }
      args = [editor.vineSubType, theta];
      break;
    case 'SEED':
      args = [editor.seedType];
      break;
    case 'DOODAD':
      args = [rect.width, rect.height, editor.doodad];
      break;
    case 'SPIDER_WEB':
      args = [rect.width, rect.height];
      break;
    case 'BACKGROUND':
      args = [1, 1, editor.background]; // width and height
      break;
    case 'EGG':
    case 'LARVA':
    case 'PUPA':
    case 'DEAD_ANT':
    case 'ANT':
      args = [editor.playerID, editor.caste, editor.isGoalCritter];
      break;
    case 'CRITTER_EGG':
      args = [editor.critterEggType];
      break;
    case 'TERMITE_EGG':
    case 'TERMITE':
    case 'DEAD_TERMITE':
      args = [editor.playerID, editor.termiteCaste, editor.isGoalCritter];
      break;
    case 'TOKEN':
      args = [editor.playerID, editor.pheromoneType];
      break;
    case 'SPIDER':
    case 'SCORPION':
    case 'DEAD_SPIDER':
    case 'DEAD_SCORPION':
    case 'BEETLE':
    case 'DEAD_BEETLE':
    case 'FOOT':
    case 'APHID':
    case 'ROLY_POLY':
    case 'DEAD_APHID':
    case 'DEAD_ROLY_POLY':
      args = [editor.isGoalCritter];
      break;
    case 'WORM':
    case 'CENTIPEDE':
    case 'DEAD_WORM':
    case 'DEAD_CENTIPEDE':
    case 'CATERPILLAR':
    case 'DEAD_CATERPILLAR':
      // create initial segments:
      const randNeighbor = pos => {
        return Math.random() < 0.5 ? add(pos, {
          x: 1,
          y: 0
        }) : add(pos, {
          x: 0,
          y: 1
        });
      };
      const segments = [];
      let position = {
        ...rect.position
      };
      for (let i = 0; i < editor.numSegments - 1; i++) {
        const segmentPos = randNeighbor(position);
        segments.push(segmentPos);
        position = segmentPos;
      }
      args = [segments, editor.isGoalCritter];
      break;
    default:
      console.error("no entity palette for ", editor.entityType);
  }
  dispatch({
    type: 'CREATE_ENTITIES',
    entityType: editor.entityType,
    rect,
    args
  });
}
function createEntityOptions(game, editor, setEditor) {
  const options = [];
  switch (editor.entityType) {
    case 'DIRT':
    case 'FOOD':
      options.push( /*#__PURE__*/React.createElement(Checkbox, {
        label: "Subdividing",
        checked: editor.subdividing,
        onChange: subdividing => setEditor({
          ...editor,
          subdividing
        })
      }));
      break;
    case 'STONE':
      options.push( /*#__PURE__*/React.createElement("span", null, "SubType:", /*#__PURE__*/React.createElement(Dropdown, {
        options: ['STONE', 'BRICK', 'KITCHEN'],
        selected: editor.stoneSubType,
        onChange: stoneSubType => setEditor({
          ...editor,
          stoneSubType
        })
      })));
      break;
    case 'VINE':
      options.push( /*#__PURE__*/React.createElement("span", null, "SubType:", /*#__PURE__*/React.createElement(Dropdown, {
        options: ['BUD', 'STALK', 'LEAF'],
        selected: editor.vineSubType,
        onChange: vineSubType => setEditor({
          ...editor,
          vineSubType
        })
      }), /*#__PURE__*/React.createElement(Dropdown, {
        options: ['up', 'down', 'left', 'right'],
        selected: editor.dir,
        onChange: dir => setEditor({
          ...editor,
          dir
        })
      })));
      break;
    case 'SEED':
      options.push( /*#__PURE__*/React.createElement("span", null, "SubType:", /*#__PURE__*/React.createElement(Dropdown, {
        options: ['VINE'],
        selected: editor.seedType,
        onChange: seedType => setEditor({
          ...editor,
          seedType
        })
      })));
      break;
    case 'EGG':
    case 'LARVA':
    case 'PUPA':
    case 'ANT':
    case 'DEAD_ANT':
      options.push( /*#__PURE__*/React.createElement("span", null, "Caste:", /*#__PURE__*/React.createElement(Dropdown, {
        options: game.config[editor.playerID].castes,
        selected: editor.caste,
        onChange: caste => setEditor({
          ...editor,
          caste
        })
      }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Checkbox, {
        label: "Is Goal Critter",
        checked: editor.isGoalCritter,
        onChange: isGoalCritter => setEditor({
          ...editor,
          isGoalCritter
        })
      }))));
      break;
    case 'TERMITE_EGG':
    case 'TERMITE':
    case 'DEAD_TERMITE':
      options.push( /*#__PURE__*/React.createElement("span", null, "Termite Caste:", /*#__PURE__*/React.createElement(Dropdown, {
        options: game.config.termiteCastes,
        selected: editor.termiteCaste,
        onChange: termiteCaste => setEditor({
          ...editor,
          termiteCaste
        })
      }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Checkbox, {
        label: "Is Goal Critter",
        checked: editor.isGoalCritter,
        onChange: isGoalCritter => setEditor({
          ...editor,
          isGoalCritter
        })
      }))));
      break;
    case 'BACKGROUND':
      options.push( /*#__PURE__*/React.createElement("span", null, "Background:", /*#__PURE__*/React.createElement(Dropdown, {
        options: ['FLOOR_TILE', 'PICNIC_BLANKET'],
        selected: editor.background,
        onChange: background => setEditor({
          ...editor,
          background
        })
      })));
      break;
    case 'TOKEN':
      options.push( /*#__PURE__*/React.createElement("span", null, "Pheromone Type:", /*#__PURE__*/React.createElement(Dropdown, {
        options: ['COLONY', 'MOVE_LARVA_PHER', 'EGG', 'PUPA', 'DOMESTICATE', 'RAID_PHER'],
        selected: editor.pheromoneType,
        onChange: pheromoneType => setEditor({
          ...editor,
          pheromoneType
        })
      })));
      break;
    case 'DOODAD':
      options.push( /*#__PURE__*/React.createElement("span", null, "Doodad Type:", /*#__PURE__*/React.createElement(Dropdown, {
        options: ['QUESTION', 'NICKEL', 'BOTTLE_CAP', 'PENCIL', 'HOSE'],
        selected: editor.doodad,
        onChange: doodad => setEditor({
          ...editor,
          doodad
        })
      })));
      break;
    case 'CRITTER_EGG':
      options.push( /*#__PURE__*/React.createElement("span", null, "Critter Type:", /*#__PURE__*/React.createElement(Dropdown, {
        options: globalConfig.config.critterTypes,
        selected: editor.critterEggType,
        onChange: critterEggType => setEditor({
          ...editor,
          critterEggType
        })
      })));
      break;
    case 'WORM':
    case 'CENTIPEDE':
    case 'CATERPILLAR':
    case 'DEAD_CATERPILLAR':
    case 'DEAD_WORM':
    case 'DEAD_CENTIPEDE':
      options.push( /*#__PURE__*/React.createElement("span", null, "Number of Segments:", /*#__PURE__*/React.createElement(NumberField, {
        value: editor.numSegments,
        onChange: numSegments => setEditor({
          ...editor,
          numSegments
        })
      }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Checkbox, {
        label: "Is Goal Critter",
        checked: editor.isGoalCritter,
        onChange: isGoalCritter => setEditor({
          ...editor,
          isGoalCritter
        })
      }))));
      break;
    case 'SPIDER':
    case 'BEETLE':
    case 'SCORPION':
      options.push( /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Checkbox, {
        label: "Is Goal Critter",
        checked: editor.isGoalCritter,
        onChange: isGoalCritter => setEditor({
          ...editor,
          isGoalCritter
        })
      }))));
      break;
  }
  return /*#__PURE__*/React.createElement("div", null, options);
}
module.exports = LevelEditor;