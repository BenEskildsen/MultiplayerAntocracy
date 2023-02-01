
const React = require('react');
const AudioWidget = require('./Components/AudioWidget.react');
const Button = require('./Components/Button.react');
const Modal = require('./Components/Modal.react');
const SmantModal = require('./Components/SmantModal.react');
const QuitButton = require('../ui/components/QuitButton.react');
const globalConfig = require('../config');
const {getDisplayTime, isMobile, isElectron} = require('../utils/helpers');
const {memo} = React;

function TopBar(props) {
  const {
    dispatch, numAnts, numKilled,
    enemiesKilled, enemyTermitesKilled,
    numYoungQueens, isExperimental,
    modal,
    tickInterval, upgradedAt,
    innerWidth,
    countdownMillis,
    inCountdown,
    isMuted,
    store,
  } = props;

  if (isExperimental && tickInterval == null) {
    return null
  }

  const height = 100;
  const topPadding = 8;
  const leftPadding = innerWidth / 2 - 100;

  let enemiesDiedHTML = null;
  if (enemyTermitesKilled.length > 0) {
    enemiesDiedHTML = (<div>
      <div><b>Enemy Ants Killed: {enemiesKilled}</b></div>
      <b>Enemy Termites Killed: {enemyTermitesKilled}</b>
    </div>);
  } else {
    enemiesDiedHTML = (<div>
      <b>Enemy Ants Killed: {enemiesKilled}</b>
    </div>);
  }

  const upLen = globalConfig.config.upgradeNums.length;
  let noMoreUpgrades = true;
  let nextUpgrade = `${upLen}/${upLen} upgrades already selected`
  let nextUpgradeLabel = nextUpgrade;
  for (const num of globalConfig.config.upgradeNums) {
    if (!upgradedAt.includes(num)) {
      noMoreUpgrades = false;
      nextUpgrade = num;
      break;
    }
  }
  if (!noMoreUpgrades) {
    nextUpgradeLabel = `Next Upgrade at ${nextUpgrade}`;
  }

  let displayTime = null;
  let denominator = "/ " + globalConfig.config.antsToWin;
  if (inCountdown) {
    denominator = null;
    displayTime = getDisplayTime(countdownMillis);
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: topPadding,
        height,
        width: '100%',
        zIndex: 2,
        textShadow: '-1px -1px 0 #FFF, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff',
      }}
    >
      <div
        style={{
          float: 'left',
          paddingLeft: 8,
        }}
      >
        <QuitButton isInGame={true} dispatch={dispatch} store={store} />
        <AudioWidget
          audioFiles={isElectron() ? globalConfig.config.campaignAudioFiles : globalConfig.config.audioFiles}
          isShuffled={false}
          isMuted={isMuted}
          setIsMuted={() => {
            store.dispatch({type: 'SET_IS_MUTED', isMuted: !isMuted});
          }}
          style={{
          }}
        />
        <div>
          <Button
            label="Instructions"
            onClick={() => {
              instructionsModal(dispatch);
            }}
          />
        </div>
        <div>
          <Button
            label={tickInterval ? 'Pause' : 'Play'}
            disabled={modal != null}
            onClick={() => {
              if (tickInterval != null) {
                dispatch({type: 'STOP_TICK'});
              } else {
                dispatch({type: 'START_TICK'});
              }
            }}
          />
        </div>
      </div>
      <div
        style={{
          float: 'right',
          paddingRight: 8,
        }}
      >
        <Button
          label="+"
          onClick={() => dispatch({type: 'SWAP_MINI_MAP'})}
        />
      </div>
      <div
        style={{
          left: leftPadding,
          position: 'absolute',
        }}
      >
        <div
          style={{
            fontSize: '32px',
          }}
        >
          {displayTime ? (
            <div><b>Time: {displayTime}</b></div>
          ) : null}
          <b>Ants: {numAnts} {denominator}</b>
        </div>
        {displayTime ? (
          <div>
            <b>Young Queens: {numYoungQueens}</b>
          </div>
        ) : (
          <div>
            <b>{nextUpgradeLabel}</b>
          </div>
        )}
        <div>
          <b>Ants Died: {numKilled}</b>
        </div>
      </div>
    </div>
  );
}

function instructionsModal(dispatch) {
  dispatch({type: 'STOP_TICK'});
  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyUp',
    key: 'enter',
    fn: (s) => dismissModal(s.dispatch),
  });
  dispatch({
    type: 'SET_MODAL',
    modal: (<SmantModal
      title="Instructions"
      body={(<span style={{textAlign: 'initial'}}>
        <div>
          <div style={{textAlign: 'center'}}><b>Controls:</b></div>
          Use the arrow keys or WASD to move. Use the buttons to have your queen
          perform actions or press the labelled (KEY) for the corresponding action.
          {isMobile() ? "Use the joystick in the bottom right corner to control the queen" : null}
          Your worker ants behave automatically.
        </div>
        <div>
          <div style={{textAlign: 'center'}}><b>Goal:</b></div>
          Get to 250 ants by laying eggs. Eggs hatch into larva, which when fed turn
          into pupa. Pupa hatch into new worker ants. Upgrade your queen with new abilities
          on your way to 250. After you get 250 ants you will have 10 minutes to raise as
          many young queens as you can, then you can register your high score. Don't die though!
        </div>
      </span>)}
      buttons={[{label: 'Dismiss (Enter)', onClick: () => {
        dismissModal(dispatch);
      }}]}
    />),
  });
}

function dismissModal(dispatch) {
  dispatch({type: 'DISMISS_MODAL'});
  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyUp',
    key: 'enter',
    fn: (s) => {},
  });
  dispatch({type: 'START_TICK'});
}

module.exports = memo(TopBar);
