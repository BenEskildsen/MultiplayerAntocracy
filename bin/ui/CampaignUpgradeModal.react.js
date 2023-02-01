const React = require('react');
const Button = require('./components/Button.react');
const Checkbox = require('./components/Checkbox.react');
const Dropdown = require('./components/Dropdown.react');
const Divider = require('./components/Divider.react');
const SmantModal = require('./Components/SmantModal.react');
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
  const sequencesInUpgrades = ["Colony Evolutions"];
  const sequenceColumns = [];
  for (const sequence of sequencesInUpgrades) {
    const upgradesHTML = [];
    upgradesHTML.push( /*#__PURE__*/React.createElement("div", {
      key: "title_" + sequence
    }, /*#__PURE__*/React.createElement("b", null, sequence)));
    upgradesHTML.push( /*#__PURE__*/React.createElement(Divider, null));
    for (let i = 0; i < upgrades.length; i++) {
      const upgrade = upgrades[i];
      const alreadyHave = campaign.upgrades.filter(u => u.name == upgrade.name && u.name != 'Heal Queen').length > 0;
      const locked = false;
      let label = "Upgrade";
      if (alreadyHave) {
        label = "Already Evolved";
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
  return /*#__PURE__*/React.createElement(SmantModal, {
    title: 'Young Queen Target Reached',
    body: body
    // height={upgrades.length * 65}
    ,
    height: 600,
    width: 300,
    buttons: []
  });
}
module.exports = UpgradeModal;