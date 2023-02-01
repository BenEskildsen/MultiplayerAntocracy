const React = require('react');
const Button = require('./components/Button.react');
const Checkbox = require('./components/Checkbox.react');
const Dropdown = require('./components/Dropdown.react');
const Modal = require('./components/Modal.react');
const {
  applyUpgrade,
  allUpgrades,
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
function SpeciesSelectionModal(props) {
  const {
    state,
    dispatch,
    store,
    callback
  } = props;
  const [selectedSpecies, setSelectedSpecies] = useState('Marauder Ants');
  useEffect(() => {
    initSpriteSheetSystem(store);
  }, []);
  const upgrades = upgradeMap({
    campaign: {
      species: selectedSpecies
    }
  }).initial;
  let upgradesHTML = [];
  for (const upgrade of upgrades) {
    if (upgrade.name == 'Young Queen Caste') continue;
    upgradesHTML.push( /*#__PURE__*/React.createElement("div", {
      key: "upgrade_" + upgrade.name,
      style: {
        paddingBottom: '6px',
        paddingTop: '12px'
      }
    }, /*#__PURE__*/React.createElement("b", null, upgrade.name), /*#__PURE__*/React.createElement("div", null, upgrade.description)));
  }
  let speciesOptions = ['Marauder Ants', 'Leaf Cutter Ants', 'Desert Ants'];
  let displayOptions = ['Marauder Ants (Easy)', 'Leaf Cutter Ants (Medium)', 'Desert Ants (Hard)'];
  if (localStorage.getItem('wonCampaign')) {
    speciesOptions = ['Marauder Ants', 'Leaf Cutter Ants', 'Desert Ants', 'Random Everything'];
    displayOptions = ['Marauder Ants (Easy)', 'Leaf Cutter Ants (Medium)', 'Desert Ants (Hard)', 'Random Everything (???)'];
  }
  const body = /*#__PURE__*/React.createElement("div", {
    style: {
      margin: 'auto',
      marginTop: 12,
      width: '100%',
      maxWidth: '400px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Dropdown, {
    options: speciesOptions,
    displayOptions: displayOptions,
    selected: selectedSpecies,
    onChange: setSelectedSpecies,
    style: {
      fontSize: '16px'
    }
  })), /*#__PURE__*/React.createElement("div", null, "Starting Upgrades for ", selectedSpecies, ":", /*#__PURE__*/React.createElement("div", {
    style: {
      paddingLeft: 8
    }
  }, upgradesHTML)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    label: "Confirm Selected Species",
    onClick: () => {
      dispatch({
        type: 'SET_SPECIES',
        species: selectedSpecies,
        playerID: 1
      });
      callback();
    }
  })));
  return /*#__PURE__*/React.createElement(Modal, {
    title: 'Select Species',
    body: body
    // height={upgrades.length * 65}
    ,
    width: 600,
    buttons: []
  });
}
module.exports = SpeciesSelectionModal;