// @flow

const React = require('react');
const Button = require('./Components/Button.react');
const Checkbox = require('./Components/Checkbox.react');
const Divider = require('./Components/Divider.react');
const Dropdown = require('./Components/Dropdown.react');
const Slider = require('./Components/Slider.react');
const {makeConfig} = require('../state/makeConfig');
const {useState, useMemo, useEffect} = React;

import type {State, Action} from '../types';

type Props = {
  dispatch: (action: Action) => Action,
  state: State,
};

const globalConfig = {
  msPerTick: {min: 0, max: 5000, step: 10}, // need to restart tick interval

  // cpuMediaThreshold: {min: 5, max: 200, step: 5},
  // cpuMajorThreshold: {min: 5, max: 250, step: 5},
};

const playerConfig = {
  numStartingWorkers: {min: 1, max: 500, step: 1},

  eggLayingCooldown: {min: 0, max: 50, step: 1},
  maxEggCharges: {min: 1, max: 30, step: 1},

  prevPositionPenalty: {min: -10000, max: 0, step: 10},
};

const pherConfig = {
  quantity: {min: 0, max: 1000, step: 10},
  decayAmount: {min: 0, max: 10, step: 1, isFloat: true},
  dispersionRate: {min: 0, max: 1, step: 0.1, isFloat: true},
  dispersionThreshold: {min: 0, max: 1, step: 1, isFloat: true},
};

const taskConfig = {
  base: {min: 0, max: 20, step: 1},
  forwardMovementBonus: {min: 0, max: 50, step: 1},
  ALERT: {min: 0, max: 500, step: 1, isFloat: true}, // /10
  FOOD: {min: -10, max: 100, step: 1, isFloat: true},
  COLONY: {min: -50, max: 50, step: 1, isFloat: false},
  EGG: {min: -10, max: 30, step: 1},
  LARVA: {min: -10, max: 30, step: 1, isFloat: true},
  MOVE_LARVA_PHER: {min: -10, max: 30, step: 1, isFloat: true},
  PUPA: {min: -10, max: 30, step: 1},
  DIRT_DROP: {min: -10, max: 30, step: 1},
  MARKED_DIRT_PHER: {min: -10, max: 30, step: 1},
  QUEEN_PHER: {min: -10, max: 10, step: 1, isFloat: true},
  QUEEN_ALERT: {min: 0, max: 500, step: 1, isFloat: true},
  CRITTER_PHER: {min: -10, max: 10, step: 1, isFloat: true},
};

function ExperimentalSidebar(props: Props): React.Node {
  const {dispatch, state} = props;
  const {game} = state;
  const config = game.config;

  const [task, setTask] = useState('WANDER');
  const [pheromone, setPheromone] = useState('COLONY');

  const sliders = useMemo(() => {
    const sliders = [];
    for (const param in globalConfig) {
      const setting = globalConfig[param];
      const value = config[param];
      const label = param;
      sliders.push(
        <Slider
          key={'slider_' + param}
          min={setting.min} max={setting.max} step={setting.step}
          value={value} label={label}
          isFloat={setting.isFloat}
          onChange={(val) => {
            dispatch({type: 'UPGRADE', path: [param], value: val});
            if (param === 'msPerTick' && game.tickInterval != null) {
              dispatch({type: 'STOP_TICK'});
              dispatch({type: 'START_TICK'});
            }
          }}
        />
      );
    }
    return sliders;
  }, [game.config.msPerTick]);

  const playerID = game.playerID;

  const playerSliders = useMemo(() => {
    const playerSliders = [];
    for (const param in playerConfig) {
      const setting = playerConfig[param];
      const value = config[playerID][param];
      const label = param;
      playerSliders.push(
        <Slider
          key={'slider_' + playerID + '_' + param}
          min={setting.min} max={setting.max} step={setting.step}
          value={value} label={label}
          isFloat={setting.isFloat}
          onChange={(val) => {
            dispatch({
              type: 'UPGRADE',
              path: [game.playerID, param],
              value: val,
            });
          }}
        />
      );
    }
    return playerSliders;
  }, [
    game.config[playerID].numStartingWorkers,
    game.config[playerID].eggLayingCooldown,
    game.config[playerID].maxEggCharges,
    game.config[playerID].prevPositionPenalty,
  ]);

  const taskSliders = useMemo(() => {
    const taskSliders = [];
    for (const param in taskConfig) {
      const setting = taskConfig[param];
      const value = config[playerID][task][param];
      const label = param;
      taskSliders.push(
        <Slider
          key={'slider_' + task + '_' + param}
          min={setting.min} max={setting.max} step={setting.step}
          value={value} label={label}
          isFloat={setting.isFloat}
          onChange={(val) => {
            dispatch({
              type: 'UPGRADE',
              path: [playerID, task, param],
              value: val,
            });
          }}
        />
      );
    }
    return taskSliders;
  }, [
    game.config[playerID][task].base,
    game.config[playerID][task].forwardMovementBonus,
    game.config[playerID][task].ALERT,
    game.config[playerID][task].QUEEN_ALERT,
    game.config[playerID][task].FOOD,
    game.config[playerID][task].COLONY,
    game.config[playerID][task].EGG,
    game.config[playerID][task].LARVA,
    game.config[playerID][task].MOVE_LARVA_PHER,
    game.config[playerID][task].PUPA,
    game.config[playerID][task].DIRT_DROP,
    game.config[playerID][task].MARKED_DIRT_PHER,
    game.config[playerID][task].QUEEN_PHER,
    game.config[playerID][task].CRITTER_PHER,
  ]);

  const pherSliders = useMemo(() => {
    const pherSliders = [];
    for (const param in pherConfig) {
      const setting = pherConfig[param];
      const value = config[playerID][pheromone][param];
      const label = param;
      pherSliders.push(
        <Slider
          key={'slider_' + pheromone + '_' + param}
          min={setting.min} max={setting.max} step={setting.step}
          value={value} label={label}
          isFloat={setting.isFloat}
          onChange={(val) => {
            dispatch({
              type: 'UPGRADE',
              path: [playerID, pheromone, param],
              value: val,
            });
          }}
        />
      );
    }
    return pherSliders;
  }, [
    game.config[playerID][pheromone].quantity,
    game.config[playerID][pheromone].decayAmount,
    game.config[playerID][pheromone].dispersionRate,
    game.config[playerID][pheromone].dispersionThreshold,
  ]);
  return (
    <div
      id="sliderBar"
      style={{
        display: 'inline-block',
        float: 'left',
        height: config.canvasHeight,
      }}
    >
      <Button
        label="Reset All Sliders to Default Values"
        onClick={() => {
          dispatch({
            type: 'SET_CONFIG',
            config: makeConfig(
              {x: game.gridWidth, y: game.gridHeight},
              game.numPlayers,
            ),
          });
        }}
      />
      <Divider />
      {sliders}
      <Divider />
      {playerSliders}
      <Divider />
      <Dropdown
        options={[
          'COLONY', 'FOOD', 'EGG', 'LARVA', 'PUPA',
          'DIRT_DROP', 'ALERT', 'QUEEN_PHER', 'MOVE_LARVA_PHER',
          'CRITTER_PHER', 'MARKED_DIRT_PHER', 'QUEEN_ALERT',
          'QUEEN_FOLLOW', 'PASS_THROUGH_COLONY',
        ]}
        selected={pheromone}
        onChange={setPheromone}
      />
      <Checkbox
        label="Render Pheromone"
        checked={!!game.pheromoneDisplay[pheromone]}
        onChange={(isVisible) => dispatch({
          type: 'SET_PHEROMONE_VISIBILITY',
          pheromoneType: pheromone,
          isVisible,
        })}
      />
      {pherSliders}
      <Divider />
      <Checkbox
        label="Color ants by task"
        checked={!!state.game.showTaskColors}
        onChange={(shouldShow) => dispatch({
          type: 'SET', value: shouldShow, property: 'showTaskColors',
        })}
      />
      <Dropdown
        options={[
          'WANDER', 'EXPLORE', 'RETRIEVE', 'RETURN', 'DEFEND',
          'FEED_LARVA', 'MOVE_DIRT', 'MOVE_EGG', 'MOVE_LARVA',
          'MOVE_PUPA', 'GO_TO_DIRT', 'ATTACK', 'PATROL',
        ]}
        displayOptions={[
          'Wander (white)', 'Explore (purple)', 'Retrieve (brown)',
          'Return (black)', 'Defend (orange)', 'Feed Larva (blue)',
          'Move Dirt (yellow)', 'Move Egg (grey)', 'Move Larva (pink)',
          'Move Pupa (green)', 'Go to Dirt (steelblue)', 'Attack (orange)',
          'Patrol (red)', 'Raid (green)',
        ]}
        selected={task}
        onChange={setTask}
      />
      {taskSliders}
    </div>
  );
}

module.exports = ExperimentalSidebar;
