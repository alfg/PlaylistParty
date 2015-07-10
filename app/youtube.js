var config = require('../config');
var google = require('googleapis');
var youtube = google.youtube('v3');

var request = require('request');

function YoutubeService() {
}

YoutubeService.prototype.searchYoutube = function(query, i, callback) {
    // See: https://developers.google.com/youtube/v3/docs/search/list

    var self = this;

    var params = {
        part: 'snippet',
        videoEmbeddable: 'true',
        type: 'video',
        q: query,
        key: config.googleApiKey
    };

    youtube.search.list(params, function(result, data) {
        if (data !== null && data !== undefined && data.items.length > 0) {
            console.log(data.items[0].id);
            data.items[0].order = i;
            callback(data.items[0]);
        }
    });
};

module.exports = YoutubeService;
