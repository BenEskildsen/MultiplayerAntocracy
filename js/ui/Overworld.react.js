// @flow

const React = require('react');
const Button = require('./components/Button.react');
const Checkbox = require('./components/Checkbox.react');
const Dropdown = require('./components/Dropdown.react');
const PlayButton = require('./PlayButton.react');
const QuitButton = require('../ui/components/QuitButton.react');
const Table = require('../ui/components/Table.react');
const {
  applyUpgrade,
  allUpgrades,
  freePlayUpgrades,
  argentineanAntUpgrades,
  marauderAntUpgrades,
  desertAntUpgrades,
} = require('../state/upgrades');
const levels = require('../levels/levels');
const {loadLevel} = require('../thunks/levelThunks');
const {getNextLevel} = require('../selectors/campaignSelectors');
const {postVisit, getHighScores} = require('../thunks/clientToServerThunks');
const {useState, useEffect, useMemo} = React;

import type {State, Action} from '../types';

type Props = {
  state: State,
  dispatch: (action: Action) => Action,
  store: Object,
};

const displayNames = {
  species: 'Species',
  queens: 'Young Queens',
  game_time: 'Play Time',
  ants: 'Total Ants',
};
const orderByTypes = {
  queens: 'DESC',
  game_time: 'ASC',
  ants: 'DESC',
  species: 'DESC',
};

function Overworld(props: Props): React.Node {
  const {state, dispatch, store} = props;
  const {campaign} = state;

  // leaderboard stuff
  const level = useMemo(() => getNextLevel(state) + "Level", []);
  const mapNames = [level]
  const scoreTypes = ['queens', 'game_time', 'ants'];
  const [scores, setScores] = useState(() => {
    let score = {};
    for (const map of mapNames) {
      score[map] = {};
      for (const orderBy of scoreTypes) {
        score[map][orderBy] = [];
      }
    }
    return score;
  });
  let localScores = JSON.parse(localStorage.getItem('scores'));
  if (localScores == null) {
    localScores = {};
    for (const map of mapNames) {
      localScores[map] = [];
    }
    localStorage.setItem('scores', JSON.stringify(localScores));
  }

  // on mount
  useEffect(() => {
    getHighScores({mapNames, scoreTypes: orderByTypes})
      .then((res) => {
        console.log(res.data);
        setScores(res.data);
      });
  }, []);

  const flattenedScores = [];
  for (const orderBy in scores[level]) {
    for (const row of scores[level][orderBy]) {
      // de-dupe based on gameID
      let alreadyAdded = false;
      for (const elem of flattenedScores) {
        if (elem.id == row.id) {
          alreadyAdded = true;
          break;
        }
      }
      if (!alreadyAdded) {
        flattenedScores.push(row);
      }
    }
  }

  const scoreCards =  (
    <div
      key={'table_' + level}
      style={{
        display: 'inline-block',
        width: '100%',
        marginRight: 5,
      }}
    >
      <Table
        rows={flattenedScores}
        maxRows={5}
        sortColumn={{by: 'DESC', name: 'ants'}}
        columns={{
          username: {
            displayName: 'Player Name', maxWidth: 12,
            notSortable: true,
          },
          ants: {
            displayName: displayNames['ants'],
            descOnly: true,
          },
          species: {
            displayName: displayNames['species'],
            notSortable: true,
          },
          game_time: {
            displayName: displayNames['game_time'],
            ascOnly: true,
            sortFn: (a, b) => {
              const [aMinStr, aSecStr] = a.game_time.split(":");
              const aMin = parseInt(aMinStr);
              const aSec = parseInt(aSecStr);

              const [bMinStr, bSecStr] = b.game_time.split(":");
              const bMin = parseInt(bMinStr);
              const bSec = parseInt(bSecStr);

              const minDiff = aMin - bMin;
              if (minDiff != 0) return minDiff;
              return aSec - bSec;
            },
          },
          queens: {
            displayName: displayNames['queens'],
            descOnly: true,
          },
        }}
      />
    </div>
  );
  return (
    <div
      style={{
        backgroundColor: 'rgb(227, 218, 200)',
        width: '100%',
        height: '100%',
        display: 'inline-block',
        overflowY: 'scroll',
      }}
    >
      <QuitButton
        isInGame={true} dispatch={dispatch} store={store}
        style={{
          margin: 4,
        }}
      />
      <div
        style={{
          margin: 'auto',
          marginTop: 12,
          width: '100%',
          maxWidth: '700px',
        }}
      >
        <h3 style={{marginBottom: 4}}><b>Campaign Info:</b></h3>
        <div>Species: <b>{campaign.species}</b></div>
        <div>
          <div>Upgrades Unlocked:</div>
          {
            campaign.upgrades
              .filter(u => u.name != null &&
                u.name != 'Young Queen Caste' &&
                u.path[0] + "" == "1" &&
                u.description != null
              )
              .map(upgrade => {
                return (
                  <div
                    key={"upgrade_" + upgrade.name}
                    className="displayOnHover"
                    style={{
                      paddingBottom: '6px',
                      paddingTop: '12px',
                    }}
                  >
                    <div><b>{upgrade.name}</b></div>
                    <div className="hidden">
                      {upgrade.description}
                    </div>
                  </div>
                );
              })
          }
        </div>
        <h3></h3>
        <div>
          <PlayButton
            store={store} isCampaign={true}
            isContinue={true}
            title="Next Level"
            level={level.slice(0, -5)}
          />
          <img
            width={200}
            height={200}
            style={{
              borderRadius: 4,
              border: '2px solid black',
              marginLeft: 250,
              marginBottom: 8,
            }}
            src={'img/' + level + '.png'}
          />
        </div>
        <div
          style={{
            margin: 'auto',
            fontSize: '1.5em',
            textAlign: 'center',
          }}
        >
          Next Level ({level.slice(0, -5)}) Leaderboard:
        </div>
        <div>{scoreCards}</div>
        <div
          style={{
            margin: 'auto',
            marginTop: 16,
            fontSize: '1.5em',
            textAlign: 'center',
          }}
        >
          Your Games on {level.slice(0, -5)}:
        </div>
        <div
          style={{
            width: '60%',
            margin: 'auto',
          }}
        >
          <Table
            rows={JSON.parse(localStorage.getItem('scores'))[level] || []}
            columns={{
              species: {displayName: 'Species'},
              ants: {displayName: 'Total Ants'},
              game_time: {displayName: 'Time to 250 Ants'},
              queens: {displayName: 'Young Queens'},
            }}
            hideColSorts={true}
          />
        </div>
      </div>
    </div>
  );
}

module.exports = Overworld;
