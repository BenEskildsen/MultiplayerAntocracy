// @flow

const React = require('react');
const Button = require('./Components/Button.react');
const Divider = require('./Components/Divider.react');
const Modal = require('./Components/Modal.react');
const SmantModal = require('./Components/SmantModal.react');
const SpeciesSelectionModal = require('./SpeciesSelectionModal.react');
const levels = require('../levels/levels');
const {config} = require('../config');
const {loadLevel} = require('../thunks/levelThunks');
const {isMobile} = require('../utils/helpers');
const {
  applyUpgrade,
  allUpgrades,
  freePlayUpgrades,
  argentineanAntUpgrades,
  marauderAntUpgrades,
  desertAntUpgrades,
  upgradeMap,
} = require('../state/upgrades');
const {getLevelDescription} = require('../selectors/campaignSelectors');
const {postVisit} = require('../thunks/clientToServerThunks');
const {dispatchToServer} = require('../clientToServer');
const {isHost} = require('../selectors/sessions');
const {useState, useEffect, useMemo} = React;

type Props = {
  levelName: string,
  store: Store,
  isCampaign: boolean,
  isContinue: boolean,
};

const text = {
  freeBody:
    ' As a lone queen you must scavenge for food, and then raise a brood of workers ' +
    ' by laying eggs and feeding the larva that hatch from them. ' +
    ' Customize your colony with upgrades as you grow to 250 ants, then ' +
    ' make as many new queens as possible to maximize your score! ' +
    ' But watch out for the mythical Giant Foot!',
  challengeBody:
    'This level is a challenge and not meant for first-time players! ' +
    'Begin embedded deep inside an enemy ant colony and fight your way out. ' +
    'Then compete for dominance against two other enemy ant colonies. ' +
    'Note that if you pick up enemy ant eggs, larva, or pupa the workers that ' +
    'hatch form them will switch allegiance to your colony, just like real-life ' +
    'Slave Driver ants. Good Luck!',
};

function PlayButton(props: Props): React.Node {
  const {store, level, isCampaign, title, isUniquePlayer, isContinue} = props;
  const dispatch = store.dispatch;

  const [loading, setLoading] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // on start click
  useEffect(() => {
    if (loading != '') {
      let progress = 0;
      const state = store.getState();
      if (state.game != null) {
        progress = state.game.loadingProgress;
      }
      let title = 'Antocracy -- Rule by Ants';
      let body = isCampaign ? getLevelDescription(state, isContinue) : text.freeBody;
      if (isMobile()) {
        title = '~~Experimental~~ Mobile Mode';
        body = (<span>
          Mobile browser compatibility issues means this game is experimental only
          on phones. Playing on desktop is recommended, since not all features may
          work as intended on mobile/tablet. For best results on mobile, play with the device
          sideways.
          <Divider/>
          {body}
        </span>);
      }
      if (level == 'challenge') {
        body = text.challengeBody;

      }
      // Server tells US when to start tick
      // so this NEVER runs
      const onClick = () => {
        if (isLoaded) {
          postVisit('/players', 'plays_vs_players', !!isUniquePlayer);

          const isUnique = !!!localStorage.getItem('revisit_' + level);
          postVisit('/game', level, isUnique)
            .then(() => {
              localStorage.setItem('revisit_' + level, true);
            });

          dispatch({type: 'DISMISS_MODAL'});
          dispatch({type: 'SET_SCREEN', screen: 'GAME'});
          dispatch({type: 'SET', property: 'isUnique', value: isUnique});
          // dispatch({type: 'START_TICK'});
          if (State.clientID == isHost(state)) {
            dispatchToServer({type: 'SET_SCREEN', screen: 'GAME'});
            // dispatchToServer({type: 'START_TICK'});
          }
          // const nextURL = window.location.href + 'game/' + level;
          // const nextTitle = 'antocracy.io -- ' + level;
          // const nextState = { additionalInformation: 'Updated URL based on level'};
          // window.history.replaceState(nextState, nextTitle, nextURL);
        }
      }
      if (!isCampaign) {
        dispatch({type: 'SET_MODAL', modal: (
          <Modal
            title={title}
            body={body}
            buttons={[{
              label: !isLoaded ? `(Loading... ${progress.toFixed(1)}%)` : 'Waiting for other players',
              disabled: true,
              // onClick: onClick,
            }]}
          />
        )});
      } else {
        dispatch({type: 'SET_MODAL', modal: (
          <SmantModal
            title={title}
            body={body}
            buttons={[{
              label: !isLoaded ? `(Loading... ${progress.toFixed(1)}%)` : 'Begin',
              disabled: !isLoaded,
              onClick: onClick,
            }]}
          />
        )});
      }
    }

    if (loading == 'Loading..') {
      setLoading('Loading...');
      let levelName = level.slice(-5) != 'Level' ? level + 'Level' : level;
      setTimeout(() => playLevel(
        store, levelName, setLoadingProgress, setIsLoaded,
      ), 100);
    }
  }, [loading, isLoaded, loadingProgress]);
  return (
    <div>
      <Button
        style={{
          width: '100%',
          height: 50,
          fontSize: '2em',
          color: 'white',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
        id="PLAY_button"
        disabled={loading != ''}
        label={title}
        onClick={() => {
          if (!isCampaign) {
            dispatch({type: 'SET_SPECIES', species: 'Free Play', playerID: 1});
            setLoading("Loading..");
          } else {
            if (store.getState()?.campaign?.levelsCompleted?.length > 0 && !props.isContinue) {
              setLoading("Loading..");
            } else {
              if (!props.isContinue) {
                localStorage.removeItem('randomUpgrades');
                dispatch({type: 'CLEAR_SAVED_CAMPAIGN'});
                dispatch({
                  type: 'SET_MODAL',
                  modal: (<SpeciesSelectionModal
                    state={store.getState()} store={store} dispatch={dispatch}
                    callback={() => {
                      dispatch({type: 'DISMISS_MODAL'});
                      setLoading("Loading..");
                    }}
                    />
                  ),
                });
              } else {
                dispatch({type: 'CONTINUE_CAMPAIGN'});
                setLoading("Loading..");
              }
            }
          }
        }}
      />
      <h3>{loading}</h3>
    </div>
  );
}


function playLevel(
  store, levelName: string, setLoadingProgress, setIsLoaded,
): void {
  const dispatch = store.dispatch;
  const state = store.getState();
  let upgrades = upgradeMap(state).initial;
  if (state.campaign?.upgrades?.length > 0) {
    upgrades = state.campaign.upgrades.filter(u => !u.levelOnly);
  }

  dispatch({type: 'START', isCampaign: state.campaign.species != 'Free Play'});
  loadLevel(store, levelName, upgrades);
  if (isHost(state)) {
    console.log("sending to server");
    dispatchToServer({type: 'START', isCampaign: state.campaign.species != 'Free Play'});
    dispatchToServer({type: 'DO_LOAD_LEVEL', levelName, startingUpgrades: upgrades});
  }

  const checkLoading = () => {
    const state = store.getState();
    let progress = 0;
    if (state.game != null) {
      progress = state.game.loadingProgress;
      setLoadingProgress(progress);
    }
    if (
      progress < 100 ||
      Object.keys(state.sprites).length < Object.keys(config.imageFiles).length
    ) {
      setTimeout(checkLoading, 100);
    } else {
      dispatchToServer({type: 'DONE_LOADING'});
      setIsLoaded(true);
    }
  }
  setTimeout(checkLoading, 100);
  // setIsLoaded(true);

  // dispatch({type: 'START_TICK'});
}

module.exports = PlayButton;
