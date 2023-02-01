// @flow

const {oneOf} = require('../utils/stochastic');
const levels = require('../levels/levels');

const tiers = [
  ['campaign1A'],
  ['campaign2A', 'campaign2B'],
  ['campaign3A', 'campaign3B', 'campaign3C'],
  ['campaign4A', 'campaign4B'],
  ['campaign5A', 'campaign5B'],
];

const youngQueensByTier = [
  1,
  20,
  40,
  60,
  90,
];

const getNextLevel = (state) => {
  if (state?.campaign?.levelsCompleted == null) {
    return oneOf(tiers[0]);
  }
  const tierNum = state.campaign.levelsCompleted.length
  const tier = tiers[tierNum];

  // hard-code levels for tiers 4 and 5 to face a different ant species
  // 4A - Leaf Cutter Ants
  // 4B - Marauder Ants
  // 5A - Desert Ants
  // 5B - Marauder Ants
  // So Marauders and Random will play 4A vs Leaf Cutters and 5A vs Desert
  // Leaf Cutters will play 4B vs Marauder and 5A vs Desert Ants
  // Desert Ants will play 4A vs Leaf Cutters and 5B vs Marauders
  if (tierNum == 3) {
    if (state.campaign.species == 'Leaf Cutter Ants') {
      return 'campaign4B';
    } else {
      return 'campaign4A';
    }
  }
  if (tierNum == 4) {
    if (state.campaign.species == 'Desert Ants') {
      return 'campaign5B';
    } else {
      return 'campaign5A';
    }
  }

  const level = oneOf(tier);
  return level;
};

const getLevelYoungQueenTarget = (state) => {
  const tier = state.campaign.levelsCompleted.length;
  return youngQueensByTier[tier];
}

const getNumLevels = () => {
  return tiers.length;
}

const descriptionMap = [

  'Greetings, I am Smant the Advisor Ant. I will accompany you through' +
  ' this campaign. Navigate and customize your ant species through 5 randomized levels' +
  ' of increasing difficulty. Don\'t die or you\'ll have to start the level over!',

  'In this level you\'ll have to take down a spider AND a vicious scorpion! But don\'t' +
  ' forget to first raise the target number of young queens and locate the trivia tidbit' +
  ' somewhere in the world to unlock additional upgrades for your colony',

  'Our colony has grown powerful enough to take on some of the other social insects' +
  ' in our vicinity. In this level you\'ll face down a termite colony. Kill their giant' +
  ' queen to defeat them!',

  'It is now time to take on one of our rival ant colonies! Overwhelm or infiltrate' +
  ' the enemy colony, locate the queen, and kill her for the good of the one true' +
  ' Antocracy!',

  'This is it, my queen, the final showdown. Time to take on all our remaining enemies' +
  ' at once. Defeat the scorpion, the termite colony, and the last rival ant colony' +
  ' to win it all! However beware... Our scouts report rumors of a mythical devastating' +
  ' giant foot in this area. Avoid it at all costs.',

];

const getLevelDescription = (state, isContinue) => {
  if (state?.campaign?.levelsCompleted == null || !isContinue) {
    return descriptionMap[0];
  }
  return descriptionMap[state.campaign.levelsCompleted.length];
}

module.exports = {
  getNextLevel,
  getLevelYoungQueenTarget,
  getNumLevels,
  getLevelDescription,
}
