var config = require('../config');
var google = require('googleapis');
var youtube = google.youtube('v3');

var request = require('request');

function YoutubeService() {
    // this.app = app;
}

YoutubeService.prototype.searchYoutube = function(query, callback) {
    var params = {
        part: 'snippet',
        q: query,
        key: config.googleApiKey
    };
    youtube.search.list(params, function(result, data) {
        if (data !== null && data !== undefined && data.items.length > 0) {
            console.log(data.items[0].id);
            callback(data.items[0].id.videoId);
        }
    });
};

module.exports = YoutubeService;
