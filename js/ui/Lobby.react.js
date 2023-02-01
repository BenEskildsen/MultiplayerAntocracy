// @flow

const React = require('react');
const AudioWidget = require('./components/AudioWidget.react');
const Button = require('./components/Button.react');
const Checkbox = require('./components/Checkbox.react');
const Dropdown = require('./components/Dropdown.react');
const Divider = require('./components/Divider.react');
const ItchWidget = require('./components/ItchWidget.react');
const ItchLink = require('./components/ItchLink.react');
const Modal = require('../ui/components/Modal.react');
const PlayButton = require('../ui/PlayButton.react');
const Table = require('../ui/components/Table.react');
const QuitButton = require('../ui/components/QuitButton.react');
const levels = require('../levels/levels');
const {getNextLevel} = require('../selectors/campaignSelectors');
const {isElectron} = require('../utils/helpers');
const {postVisit, getHighScores} = require('../thunks/clientToServerThunks');
const {initSpriteSheetSystem} = require('../systems/spriteSheetSystem');
const globalConfig = require('../config');
const {useState, useEffect, useMemo} = React;

import type {State, Action} from '../types';

type Props = {
  store: Store,
  dispatch: (action: Action) => Action,
};

const displayNames = {
  queens: 'Young Queens',
  game_time: 'Play Time',
  ants: 'Total Ants',
};
const orderByTypes = {
  queens: 'DESC',
  game_time: 'ASC',
  ants: 'DESC',
};

function Lobby(props: Props): React.Node {
  const {dispatch, store} = props;
  const state = store.getState();

  const [level, setLevel] = useState('picnic');
  const [isRevisit, setIsRevisit] = useState(!!localStorage.getItem('isRevisit'));
  const [curCampaign, setCurCampaign] = useState(JSON.parse(localStorage.getItem('curCampaign')));
  const [isCampaign, setIsCampaign] = useState(false);

  // handle screen size change specifically for background gif
  const [rerender, setRerender] = useState(0);
  const onresize = () => setRerender(rerender + 1);
  let width = window.innerWidth;
  let height = window.innerHeight;
  useEffect(() => {
    window.addEventListener('resize', onresize);
    width = window.innerWidth;
    height = window.innerHeight;
    return (() => {
      window.removeEventListener('resize', onresize);
    });
  }, [rerender]);

  // leaderboard stuff
  let mapNames = ['picnic', 'kitchen'];
  let lockedMapNames = [
    'undergrowth', 'challenge','spiral', 'garden', 'dust', 'castle', 'lunch', 'hill',
  ];
  if (isElectron()) {
    mapNames = [...mapNames, ...lockedMapNames];
    lockedMapNames = [];
  }
  const fullMapNames = [
    ...mapNames,
    'campaign1ALevel',
    'campaign2ALevel', 'campaign2BLevel',
    'campaign3ALevel', 'campaign3BLevel', 'campaign3CLevel',
    'campaign4ALevel', 'campaign4BLevel',
    'campaign5ALevel', 'campaign5BLevel',
  ]
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
    for (const map of fullMapNames) {
      localScores[map] = [];
    }
    localStorage.setItem('scores', JSON.stringify(localScores));
  } else {
    // make sure local storage is up to date with new maps
    for (const map of fullMapNames) {
      if (!localScores[map]) {
        localScores[map] = [];
      }
    }
    localStorage.setItem('scores', JSON.stringify(localScores));
  }

  // on mount
  useEffect(() => {
    initSpriteSheetSystem(store);
    postVisit('/index', 'lobby', !isRevisit)
      .then(() => {
        localStorage.setItem('isRevisit', true);
      });
    getHighScores({mapNames, scoreTypes: orderByTypes})
      .then((res) => {
        console.log(res.data);
        setScores(res.data);
      });
  }, []);

  const mapCards = mapNames
    .map(lev => {
      return (<MapCard
        key={"MapCard_" + lev}
        dispatch={dispatch} level={lev}
        isSelected={level == lev} setLevel={setLevel}
      />);
    });
  const lockedMapCards = lockedMapNames
    .map(lev => {
      return (<MapCard
        key={"MapCard_" + lev}
        disabled={true}
        dispatch={dispatch} level={lev}
        isSelected={level == lev} setLevel={setLevel}
      />);
    });

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
    <span>
      <QuitButton isInGame={false} dispatch={dispatch} store={store} />
      <AudioWidget
        audioFiles={isElectron() ? globalConfig.config.campaignAudioFiles : globalConfig.config.audioFiles}
        isShuffled={false}
        isMuted={state.isMuted}
        setIsMuted={() => {
          store.dispatch({type: 'SET_IS_MUTED', isMuted: !state.isMuted});
        }}
        style={{
          margin: 5,
          borderRadius: 8,
          left: 5,
        }}
      />
      <div
        style={{
          margin: 'auto',
          maxWidth: 700,
          padding: 8,
          textAlign: 'center',
          fontFamily: '"Courier New", sans-serif',
          overflowY: 'scroll',
          height: '90%',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'inline',
            zIndex: -1,
            opacity: 0.3,
          }}
        >
          <img
            width={width}
            height={height}
            src={isElectron() ? 'img/Background2.gif': 'img/backgroundTest.gif'}
          />
        </div>
        <h1>ANTocracy</h1>
        {curCampaign == null ? null :
          <span>
            <Button
              label={"Continue Campaign"}
              onClick={() => {
                dispatch({type: 'CONTINUE_CAMPAIGN'});
                dispatch({type: 'SET_SCREEN', screen: 'OVERWORLD'});
              }}
              style={{
                width: '100%',
                height: 50,
                fontSize: '2em',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              id="PLAY_button"
            />
            <h3></h3>
          </span>
        }
        {isElectron()
          ?
            <PlayButton
              store={store} isCampaign={true}
              title={curCampaign == null ? "Campaign" : "New Campaign"}
              level={getNextLevel(curCampaign)}
              isUniquePlayer={isGloballyUniquePlayer(mapNames)}
            />
          :
            <span><ItchWidget /><h3></h3></span>
        }
        <Divider
          style={{
            width: '150%',
            marginLeft: '-25%',
          }}
        />
        <h3></h3>
        <PlayButton
          store={store} isCampaign={false} title={"Free Play"}
          level={level}
          isUniquePlayer={isGloballyUniquePlayer(mapNames)}
        />
        <div>{mapCards}{lockedMapCards}</div>
        <div
          style={{
            margin: 'auto',
            fontSize: '2em',
            textAlign: 'center',
          }}
        >
          Leaderboards
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
          Your Games
        </div>
        <div
          style={{
            width: '60%',
            margin: 'auto',
          }}
        >
          <Table
            rows={JSON.parse(localStorage.getItem('scores'))[level]}
            columns={{
              ants: {displayName: 'Total Ants'},
              game_time: {displayName: 'Time to 250 Ants'},
              queens: {displayName: 'Young Queens'},
            }}
            hideColSorts={true}
          />
        </div>
      </div>
      <LevelEditorCard dispatch={dispatch} mapNames={mapNames} />
      <MadeBy />
      <ReviewCard />
    </span>
  );
}

// returns true if the player has not played any map, false if they have played
// any map
function isGloballyUniquePlayer(mapNames) {
  for (const map of mapNames) {
    const isUnique = !!!localStorage.getItem('revisit_' + map);
    if (!isUnique) return false;
  }
  return true;
}

function MapCard(props) {
  const {dispatch, level, isSelected, setLevel, disabled} = props;
  return (
    <div
      style={{
        display: 'inline-block',
        width: 120,
        border: isSelected ? '3px solid #FF7F50' : 'none',
        margin: 4,
        borderRadius: 8,
        opacity: disabled ? 0.4 : 1,
      }}
      title={disabled ? 'Purchase the Antocracy Campaign to unlock this map' : null}
      onClick={() => disabled ? false : setLevel(level)}
    >
      <img
        width={120}
        height={120}
        style={{
          borderRadius: 4,
        }}
        src={'img/' + level + 'Level.png'}
      />
      {level}
    </div>
  );
}

function MadeBy(props) {
  const [rerender, setRerender] = useState(0);

  const onresize = () => setRerender(rerender + 1);

  let left = window.innerWidth - 315;
  let top = window.innerHeight - 82;
  useEffect(() => {
    window.addEventListener('resize', onresize);
    left = window.innerWidth - 315;
    top = window.innerHeight - 82;
    return (() => {
      window.removeEventListener('resize', onresize);
    });
  }, [rerender]);

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        padding: 6,
        fontSize: '1.4em',
        backgroundColor: 'rgba(250, 248, 239, 0.5)',
      }}
    >
      <div>
        Made by&nbsp;
        <b>
          <a
            id="benhub"
            style={{
              textDecoration: 'none',
            }}
            href="https://www.benhub.io" target="_blank">Ben Eskildsen
          </a>
        </b>
      </div>
      <div>
        Music by&nbsp;
        <b>
          Clay Wirsing
        </b>
      </div>
      <div style={{
        fontSize: '0.5em',
      }}>
        version: 1.02
      </div>
    </div>
  );
}


function ReviewCard() {
  const [rerender, setRerender] = useState(0);
  const onresize = () => setRerender(rerender + 1);

  let left = window.innerWidth - 322;
  let top = 5;
  useEffect(() => {
    window.addEventListener('resize', onresize);
    left = window.innerWidth - 322;
    top = 5;
    return (() => {
      window.removeEventListener('resize', onresize);
    });
  }, [rerender]);

  return (
    <div
      style={{
        position: 'absolute',
        width: 310,
        left,
        top,
        backgroundColor: 'rgb(250, 248, 239)',
        borderRadius: 8,
        padding: 4,
      }}
    >
      <div>
        If you like this game (or have suggestions for improvements),
        please leave a review or comment on its <ItchLink campaignLink={isElectron()} />
        &nbsp;or join the discord:
        <iframe
          src="https://discord.com/widget?id=855475680263667732&theme=dark"
          width="310" height="70" allowtransparency="true" frameBorder="0"
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts">
        </iframe>
      </div>
    </div>
  );
}

function LevelEditorCard(props) {
  const {dispatch, mapNames} = props;
  const [level, setLevel] = useState('kitchenLevel');
  const [useLevel, setUseLevel] = useState(true);
  const [rerender, setRerender] = useState(0);

  const onresize = () => setRerender(rerender + 1);

  let left = 5;
  let top = window.innerHeight - 82;
  useEffect(() => {
    window.addEventListener('resize', onresize);
    left = 5;
    top = window.innerHeight - 82;
    return (() => {
      window.removeEventListener('resize', onresize);
    });
  }, [rerender]);

  const levelOptions = Object.keys(levels)
    .filter(l => {
      if (!isElectron()) {
        const isCampaign = l.slice(0, 8) != 'campaign';
        const isIncluded = mapNames.filter(m => m + 'Level' == l).length > 0;
        return isCampaign && isIncluded;
      }
      return true;
    });

  return (
    <div
      style={{
        position: 'absolute',
        width: 310,
        left,
        top,
        backgroundColor: 'rgb(250, 248, 239)',
        borderRadius: 8,
        padding: 4,
      }}
    >
      Select Level:
      <Dropdown
        options={levelOptions}
        selected={level}
        onChange={setLevel}
      />
      <div>
        <Checkbox
          label="Use Selected Level"
          checked={useLevel}
          onChange={setUseLevel}
        />
      </div>
      <div>
        <Button
          label="Level Editor"
          style={{
            width: '100%',
          }}
          onClick={() => {
            dispatch({type: 'START', screen: 'EDITOR', isExperimental: true});
            if (useLevel) {
              dispatch({type: 'SET_LEVEL', level: levels[level], isExperimental: true});
              dispatch({type: 'SET_PLAYERS_AND_SIZE'});
            }
            dispatch({
              type: 'SET_SPECIES', species: 'Free Play',
              playerID: 1, isExperimental: true,
            });
          }}
        />
      </div>
    </div>
  );
}


module.exports = Lobby;
