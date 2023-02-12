const spreadSheetId = '1lwgcY3yLb_HOdWpN_c2fATYpeCmQvpJ1QnThqgSOnVw';


const ss = SpreadsheetApp.openById(spreadSheetId);
const sheetSettings = ss.getSheetByName('Settings');
const sheetResults = ss.getSheetByName('Results');
const sheetChannelsId = ss.getSheetByName('ChannelsId');
const sheet_Unique_ChannelsId = ss.getSheetByName('Unique Channels Id');

const searchPhraseCell = "A2";


/**
 * The function retrieves a list of channels from the YouTube video output by a key query
 * 1st step:
 * Extracts makes a request to YouTube with a keyword (request) YouTube.Search.list
 * Retrieves the list of IDs of all channels and writes this list line by line to the page ChannelsId
 * Then, in requests of 50 pieces, it receives data about the channel and writes it to the Result page
 * At the end, the list of channel IDs on the page ChannelsId is cleared 
 */
function startFn() {
  try {

    let searchPhrase = sheetSettings.getRange(searchPhraseCell).getValue(); // get the keyword
    let nextPageToken = '';
    let arrChannelsId = []; 
    let channelsListString = '';

    /**
     * We execute a request to YouTube with a search phrase
     * i < 10 - 10 is the number of the next 50 search results (maxResults)
     */
    for (let i = 0; i < 10; i++) {
      let result = YouTube.Search.list('snippet', {
        q: searchPhrase,
        maxResults: 50,
        pageToken: nextPageToken
      })
      result.items.map(item => {
        arrChannelsId.push([item.snippet.channelId]);
      })
      nextPageToken = result.nextPageToken;
    }
    let lastRow = sheetChannelsId.getLastRow();
    sheetChannelsId.getRange(lastRow + 1, 1, arrChannelsId.length, 1).setValues(arrChannelsId); //Write the received channel IDs to the page ChannelsId

    let lrChannelsId = sheet_Unique_ChannelsId.getLastRow(); // Getting the values of unique ID channels
    let unique_channelsIdArr = sheet_Unique_ChannelsId.getRange(2, 1, lrChannelsId - 1, 1).getValues();
    let unique_channelsId = unique_channelsIdArr.flat();
    let unique_channelsIChanksCount = Math.round(unique_channelsIdArr.length / 50) >= 1.5 ? Math.round(unique_channelsIdArr.length / 50) : Math.round(unique_channelsIdArr.length / 50) + 1; //We get the number of cycles of receiving data about channels. Allowed number of channels for one request - 50 maximum

    let counterMultiplicator = 0;
    for (let i = 0; i < unique_channelsIChanksCount; i++) {

      channelsListString = unique_channelsId.slice(counterMultiplicator, counterMultiplicator + 50);
      channelsListString.toString()

      counterMultiplicator = counterMultiplicator + 50;

      let resChannels = YouTube.Channels.list('snippet, statistics, topicDetails', {
        id: channelsListString
      })

      let resArr = [];
      resChannels.items.map(it => {
        let name = it.snippet.title;
        let handle = it.snippet.customUrl;
        let totalSubscribers = it.statistics.subscriberCount;
        let totalViews = it.statistics.viewCount;
        let totalVideos = it.statistics.videoCount;
        let channelDesc = it.snippet.description;
        let location = it.snippet.country;
        let joinDate = Utilities.formatDate(new Date(it.snippet.publishedAt), "GMT", "dd.MM.YYYY");
        let category = '';
        it.topicDetails?.topicCategories ? category = it.topicDetails.topicCategories : category = '';
        let categoryStr = '';
        if (category != '') {
          category.map(cat => {
            categoryStr += " ," + cat.substring(30);
          });
          categoryStr = categoryStr.substring(2);

        } else {
          categoryStr = "no categories";
        }

        resArr.push([name, handle, totalSubscribers, totalViews, totalVideos, channelDesc, location, joinDate, categoryStr, searchPhrase]); 

      })
      let lr = sheetResults.getLastRow();
      sheetResults.getRange(lr + 1, 1, resArr.length, 10).setValues(resArr);
    }
  sheetChannelsId.getRange("A:A").clear(); // Clearing the channel ID list
  } catch (e) {
    Logger.log(e)
  }
}


function onOpen() {
  let ui = SpreadsheetApp.getUi();
  ui.createMenu('My Menu')
    .addItem('Get Channels', 'startFn')
    .addToUi();
}


