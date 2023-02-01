const campaignReducer = (campaign, action) => {
  if (campaign == null) campaign = {};
  switch (action.type) {
    case 'SET_CURRENT_LEVEL_WON':
      {
        if (!campaign.levelsCompleted.includes(campaign.levelName)) {
          campaign.levelsCompleted.push(campaign.levelName);
        }
        break;
      }
    case 'SET_CURRENT_LEVEL_NAME':
      {
        campaign.levelName = action.levelName;
        break;
      }
    case 'SET_SPECIES':
      {
        const {
          species
        } = action;
        campaign = {
          ...campaign,
          species,
          isCampaign: !!!action.isExperimental && species != 'Free Play'
        };
      }
    case 'SET_CURRENCY':
      {
        const {
          currency
        } = action;
        campaign = {
          ...campaign,
          currency
        };
        break;
      }
    case 'CLEAR_UPGRADES':
      {
        campaign = {
          ...campaign,
          upgrades: []
        };
        break;
      }
    case 'CLEAR_LEVEL_ONLY_UPGRADES':
      {
        campaign = {
          ...campaign,
          upgrades: campaign.upgrades.filter(u => u.levelOnly != true)
        };
        break;
      }
    case 'CONTINUE_CAMPAIGN':
      {
        const curCampaign = JSON.parse(localStorage.getItem('curCampaign'));
        return {
          ...campaign,
          ...curCampaign
        }; // don't save to localStorage
      }
    case 'CLEAR_SAVED_CAMPAIGN':
      {
        localStorage.removeItem('curCampaign');
        const flags = ['larva', 'larvaToken', 'foodToken', 'dirtToken'];
        for (const flag of flags) {
          localStorage.removeItem('seenThisCampaign_' + flag);
        }
        return {
          isCampaign: true,
          // whether or not we're actually in the campaign
          species: 'Marauder Ants',
          upgrades: [],
          currency: 0,
          level: 0,
          levelName: '',
          levelsCompleted: []
        }; // don't save to localStorage
      }
  }

  // save all campaign changes to the curCampaign localStorage
  // console.log(action.type, action, campaign.levelName);
  if (campaign.isCampaign) {
    localStorage.setItem('curCampaign', JSON.stringify(campaign));
  }
  return campaign;
};
module.exports = {
  campaignReducer
};