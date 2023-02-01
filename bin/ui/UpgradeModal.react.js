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
  upgradeMap
} = require('../state/upgrades');
const {
  isMobile,
  isIpad
} = require('../utils/helpers');
const {
  initSpriteSheetSystem
} = require('../systems/spriteSheetSystem');
const {
  useState,
  useEffect
} = React;
function UpgradeModal(props) {
  const {
    state,
    dispatch,
    store
  } = props;
  const {
    game,
    campaign
  } = state;
  const [selectedUpgrade, setSelectedUpgrade] = useState('Argentinean Ants');
  const [levelName, setLevel] = useState('bigColonyLevel');
  const upgrades = upgradeMap(state).additional;

  // do the filtering based on sequences
  const sequencesInUpgrades = [];
  for (const upgrade of upgrades) {
    const {
      sequenceID
    } = upgrade;
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
    upgradesHTML.push( /*#__PURE__*/React.createElement("div", {
      key: "title_" + sequence
    }, /*#__PURE__*/React.createElement("b", null, sequence)));
    upgradesHTML.push( /*#__PURE__*/React.createElement(Divider, null));
    for (let i = 0; i < upgrades.length; i++) {
      const upgrade = upgrades[i];
      if (upgrade.sequenceID != sequence) continue;
      const alreadyHave = campaign.upgrades.filter(u => u.name == upgrade.name).length > 0;
      const locked = maxSequenceIndex[sequence] < upgrade.sequenceIndex;
      let label = "Upgrade";
      if (alreadyHave) {
        label = "Already Upgraded";
      }
      if (locked) {
        label = "Locked";
      }
      const upgradeRow = /*#__PURE__*/React.createElement("div", {
        key: "upgrade_" + upgrade.name,
        className: "displayOnHover",
        style: {
          paddingBottom: '6px',
          paddingTop: '12px'
        }
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, upgrade.name)), /*#__PURE__*/React.createElement("div", {
        style: {
          margin: 'auto'
        }
      }, /*#__PURE__*/React.createElement(Button, {
        label: label,
        disabled: alreadyHave || locked,
        onClick: () => {
          dispatch({
            type: 'START_TICK'
          });
          dispatch({
            type: 'DISMISS_MODAL'
          });
          applyUpgrade(dispatch, game, game.playerID, upgrade);
        }
      })), /*#__PURE__*/React.createElement("div", {
        className: "hidden"
      }, upgrade.description));
      upgradesHTML.push(upgradeRow);
    }
    sequenceColumns.push(upgradesHTML);
  }
  const body = /*#__PURE__*/React.createElement("div", {
    style: {
      // backgroundColor: '#edc39d',
      width: '100%',
      height: '100%',
      display: 'inline-block'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      margin: 'auto',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", null, sequenceColumns.map(col => {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-block',
        width: 300,
        verticalAlign: 'top'
      }
    }, col);
  }))));
  return /*#__PURE__*/React.createElement(Modal, {
    title: 'Select an Upgrade',
    body: body
    // height={upgrades.length * 65}
    ,
    height: isMobile() && !isIpad() ? window.innerHeight : 500,
    width: isMobile() && !isIpad() ? 300 : 900,
    buttons: []
  });
}
module.exports = UpgradeModal;