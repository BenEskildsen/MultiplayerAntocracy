// @flow

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
  upgradeMap,
} = require('../state/upgrades');
const {initSpriteSheetSystem} = require('../systems/spriteSheetSystem');
const {useState, useEffect} = React;

import type {State, Action} from '../types';

type Props = {
  state: State,
  dispatch: (action: Action) => Action,
  store: Object,
};

function SpeciesSelectionModal(props: Props): React.Node {
  const {state, dispatch, store, callback} = props;

  const [selectedSpecies, setSelectedSpecies] = useState('Marauder Ants');

  useEffect(() => {
    initSpriteSheetSystem(store);
  }, []);

  const upgrades = upgradeMap({campaign: {species: selectedSpecies}}).initial;
  let upgradesHTML = [];
  for (const upgrade of upgrades) {
    if (upgrade.name == 'Young Queen Caste') continue;
    upgradesHTML.push(
      <div
        key={"upgrade_" + upgrade.name}
        style={{
          paddingBottom: '6px',
          paddingTop: '12px',
        }}
      >
        <b>{upgrade.name}</b>
        <div>
          {upgrade.description}
        </div>
      </div>
    );
  }

  let speciesOptions = ['Marauder Ants', 'Leaf Cutter Ants', 'Desert Ants'];
  let displayOptions = [
      'Marauder Ants (Easy)',
      'Leaf Cutter Ants (Medium)',
      'Desert Ants (Hard)',
  ];
  if (localStorage.getItem('wonCampaign')) {
    speciesOptions = ['Marauder Ants', 'Leaf Cutter Ants', 'Desert Ants', 'Random Everything'];
    displayOptions = [
      'Marauder Ants (Easy)',
      'Leaf Cutter Ants (Medium)',
      'Desert Ants (Hard)',
      'Random Everything (???)',
    ];
  }

  const body = (
    <div
      style={{
        margin: 'auto',
        marginTop: 12,
        width: '100%',
        maxWidth: '400px',
      }}
    >
      <div>
        <Dropdown
          options={speciesOptions}
          displayOptions={displayOptions}
          selected={selectedSpecies}
          onChange={setSelectedSpecies}
          style={{fontSize: '16px'}}
        />
      </div>
      <div>
        Starting Upgrades for {selectedSpecies}:
        <div
          style={{paddingLeft: 8}}
        >
          {upgradesHTML}
        </div>
      </div>
      <div>
        <Button
          label="Confirm Selected Species"
          onClick={() => {
            dispatch({type: 'SET_SPECIES', species: selectedSpecies, playerID: 1});
            callback();
          }}
        />
      </div>
    </div>
  );
  return (
    <Modal
      title={'Select Species'}
      body={body}
      // height={upgrades.length * 65}
      width={600}
      buttons={[]}
    />
  );
}

module.exports = SpeciesSelectionModal;
