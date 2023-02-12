# Youtube-Extractor
Be sure to check the quotas
https://developers.google.com/youtube/v3/getting-started#quota


/**
 * The function retrieves a list of channels from the YouTube video output by a key query
 * 1st step:
 * Extracts makes a request to YouTube with a keyword (request) YouTube.Search.list
 * Retrieves the list of IDs of all channels and writes this list line by line to the page ChannelsId
 * Then, in requests of 50 pieces, it receives data about the channel and writes it to the Result page
 * At the end, the list of channel IDs on the page ChannelsId is cleared 
 */
