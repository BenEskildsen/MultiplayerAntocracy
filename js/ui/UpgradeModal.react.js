// @flow

const React = require('react');
const Button = require('./components/Button.react');
const Checkbox = require('./components/Checkbox.react');
const Dropdown = require('./components/Dropdown.react');
const Divider = require('./components/Divider.react');
const Modal = require('./Components/Modal.react');
const {
  applyUpgrade,
  allUpgrades,
  freePlayUpgrades,
  argentineanAntUpgrades,
  marauderAntUpgrades,
  desertAntUpgrades,
  upgradeMap,
} = require('../state/upgrades');
const {isMobile, isIpad} = require('../utils/helpers');
const {initSpriteSheetSystem} = require('../systems/spriteSheetSystem');
const {useState, useEffect} = React;

type Props = {
  state: State,
  dispatch: (action: Action) => Action,
  store: Object,
};
function UpgradeModal(props: Props): React.Node {
  const {state, dispatch, store} = props;
  const {game, campaign} = state;

  const [selectedUpgrade, setSelectedUpgrade] = useState('Argentinean Ants');
  const [levelName, setLevel] = useState('bigColonyLevel');

  const upgrades = upgradeMap(state).additional;

  // do the filtering based on sequences
  const sequencesInUpgrades = [];
  for (const upgrade of upgrades) {
    const {sequenceID} = upgrade;
    if (sequenceID != null && !sequencesInUpgrades.includes(sequenceID)) {
      sequencesInUpgrades.push(sequenceID);
    }
  }
  const maxSequenceIndex = {};
  for (const sequence of sequencesInUpgrades) {
    maxSequenceIndex[sequence] = 0;
    for (const upgrade of campaign.upgrades) {
      if (upgrade.sequenceID == sequence && upgrade.sequenceIndex >= maxSequenceIndex[sequence]) {
        maxSequenceIndex[sequence] = upgrade.sequenceIndex + 1;
      }
    }
    // only show largest upgrade in sequence
    // upgrades = upgrades.filter(u => {
    //   if (u.sequenceID != sequence) return true;
    //   return u.sequenceIndex <= maxSequenceIndex + 1;
    // });
  }

  const sequenceColumns = [];
  for (const sequence of sequencesInUpgrades) {
    const upgradesHTML = [];
    upgradesHTML.push(<div key={"title_" + sequence}><b>{sequence}</b></div>);
    upgradesHTML.push(<Divider />);
    for (let i = 0; i < upgrades.length; i++) {
      const upgrade = upgrades[i];
      if (upgrade.sequenceID != sequence) continue;
      const alreadyHave = campaign.upgrades
        .filter(u => u.name == upgrade.name)
        .length > 0;
      const locked = maxSequenceIndex[sequence] < upgrade.sequenceIndex;
      let label = "Upgrade";
      if (alreadyHave) {
        label = "Already Upgraded";
      }
      if (locked) {
        label = "Locked";
      }

      const upgradeRow = (
        <div
          key={"upgrade_" + upgrade.name}
          className="displayOnHover"
          style={{
            paddingBottom: '6px',
            paddingTop: '12px',
          }}
        >
          <div><b>{upgrade.name}</b></div>
          <div style={{
            margin: 'auto',
          }}>
            <Button
              label={label}
              disabled={alreadyHave || locked}
              onClick={() => {
                dispatch({type: 'START_TICK'});
                dispatch({type: 'DISMISS_MODAL'});
                applyUpgrade(dispatch, game, game.playerID, upgrade);
              }}
            />
          </div>
          <div className="hidden">
            {upgrade.description}
          </div>
        </div>
      );
      upgradesHTML.push(upgradeRow);
    }
    sequenceColumns.push(upgradesHTML);
  }

  const body = (
    <div
      style={{
        // backgroundColor: '#edc39d',
        width: '100%',
        height: '100%',
        display: 'inline-block',
      }}
    >
    <div
      style={{
        margin: 'auto',
        width: '100%',
      }}
    >
      <div>
        {sequenceColumns.map(col => {
          return (
            <div style={{
              display: 'inline-block',
              width: 300,
              verticalAlign: 'top',
            }}>{col}</div>
          );
        })}
      </div>
    </div>
    </div>
  );
  return (
    <Modal
      title={'Select an Upgrade'}
      body={body}
      // height={upgrades.length * 65}
      height={isMobile() && !isIpad() ? window.innerHeight : 500}
      width={isMobile() && !isIpad() ? 300 : 900}
      buttons={[]}
    />
  );
}

module.exports = UpgradeModal;
