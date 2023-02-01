const {selectQuery, updateQuery, upsertQuery, writeQuery} = require('./dbUtils');

const recordVisit = (req, res, next) => {
  const {hostname, path, map, isUnique} = req.body;
  const table = 'site_visits';
  if (!isUnique) {
    upsertQuery(
      table,
      {
        hostname, path, map,
        num_visits: 1,
        last_visited: new Date(),
      },
      {
        num_visits: table + '.num_visits + 1',
        last_visited: 'current_timestamp',
      },
      {hostname, path, map},
    ).then(() => {
      res.status(201).send({success: true});
    });
  } else {
    upsertQuery(
      table,
      {
        hostname, path, map,
        num_visits: 1,
        num_unique_visits: 1,
        last_visited: new Date(),
      },
      {
        num_visits: table + '.num_visits + 1',
        num_unique_visits: table + '.num_unique_visits + 1',
        last_visited: 'current_timestamp',
      },
      {hostname, path, map},
    ).then(() => {
      res.status(201).send({success: true});
    });
  }
};

const recordSession = (req, res, next) => {
  const {
    hostname, ending, map, is_unique,
    ants, queens, play_minutes, username,
    device, species,
  } = req.body;
  writeQuery(
    'ant_sessions',
    {
      hostname, ending, map, is_unique,
      ants, queens, play_minutes, username,
      device, species,
    },
  ).then(() => {
    res.status(201).send({success: true});
  }).catch((err) => {
    console.log('failed to write session');
    console.log(err);
    res.status(500).send({error: err});
  });
};

// make sure the given username is free
const checkUsername = (req, res, next) => {
  const {username, localUser} = req.body;
  // if the username is stored on the user's machine, then we know this is
  // their username and don't need to check
  if (localUser) {
    next();
  } else {
    // else see if any rows match this username
    selectQuery('ant_scores', ['username'], {username})
      .then(result => {
        if (result.rows.length == 0) {
          next();
        } else {
          res.status(400).send({error: 'There is already a user with this name'});
        }
      });
  }
};

const writeScore = (req, res, next) => {
  const {username, map, game_time, queens, ants, species} = req.body;
  writeQuery(
    'ant_scores',
    {username, map, game_time, queens, ants, species},
  ).then(() => {
    res.status(201).send({success: true});
  }).catch((err) => {
    console.log('failed to write score');
    console.log(err);
    res.status(500).send({error: err});
  });
};

const getHighScores = (req, res, next) => {
  const {mapNames, scoreTypes} = req.query;
  const orderByTypes = JSON.parse(scoreTypes);

  let scores = {};
  let totalQueries = 0;
  for (const map of mapNames) {
    scores[map] = {};
    for (const orderBy in orderByTypes) {
      scores[map][orderBy] = [];
      totalQueries++;
    }
  }

  let numQueries = 0;
  for (const map of mapNames) {
    for (const orderBy in orderByTypes) {
      selectQuery(
        'ant_scores',
        ['id', 'username', 'map', 'game_time', 'queens', 'ants', 'species'],
        {map},
        {orderBy, order: orderByTypes[orderBy]},
        5, // top 5
      ).then((result) => {
        numQueries++;
        scores[map][orderBy] = result.rows
          .map(row => {
            return {...row, game_time: getDisplayTime(parseInt(row.game_time))};
          });
        if (numQueries == totalQueries) {
          res.status(200).send(scores);
          return;
        }
      }).catch((err) => {
        console.log('failed to read score');
        console.log(err);
        res.status(500).send({error: err});
      });
    }
  }

};

const TABLE_TO_COLS = {
  'site_visits':
    ['hostname', 'path', 'map', 'num_visits', 'num_unique_visits', 'last_visited'],
  'ant_scores':
    ['id', 'username', 'map', 'game_time', 'queens', 'ants', 'species'],
  'ant_sessions':
    [
      'hostname', 'username', 'map', 'is_unique', 'ending', 'ants',
      'play_minutes', 'device', 'species', 'queens',
    ],
  'blog_users':
    [
      'username', 'permissionlevel', 'email', 'numLogins', 'createdat', 'lastLogin',
    ],
  'blog_comments':
    [
      'username', 'thread', 'comment', 'createdat',
    ],
};

const getDashboardData = (req, res, next) => {
  const {table} = req.query;
  // would want to abstract this across all column names if
  // doing server-side filtering
  const query = {};
  // if (hostname != null && hostname != '*') {
  //   query.hostname = hostname;
  // }

  selectQuery(
    table,
    TABLE_TO_COLS[table],
    // 'site_visits',
    // ['hostname', 'path', 'map', 'num_visits', 'num_unique_visits', 'last_visited'],
    query,
  ).then((result) => {
    res.status(200).send(result.rows);
    return;
  }).catch((err) => {
    console.log('failed to read score');
    console.log(err);
    res.status(500).send({error: err, foo: 'bar'});
  });
};


// ------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------

const getDisplayTime = (millis) => {
  const seconds = Math.floor(millis / 1000);
  const minutes = Math.floor(seconds / 60);
  const leftOverSeconds = seconds - (minutes * 60);
  let leftOverSecondsStr = leftOverSeconds == 0 ? '00' : '' + leftOverSeconds;
  if (leftOverSeconds < 10 && leftOverSeconds != 0 ) {
    leftOverSecondsStr = '0' + leftOverSecondsStr;
  }

  return `${minutes}:${leftOverSecondsStr}`;
}

module.exports = {
  recordVisit,
  checkUsername,
  getHighScores,
  writeScore,
  recordSession,
  getDashboardData,
};
