var config = require('../config');
var cache = require('./cache');

var google = require('googleapis');
var youtube = google.youtube('v3');
var request = require('request');

function YoutubeService() {
}

YoutubeService.prototype.searchYoutube = function(query, callback) {
    // See: https://developers.google.com/youtube/v3/docs/search/list

    var self = this;

	var cacheKey = 'searchYoutube_' + query;
	var timeout = 60 * 60 * 24; // 24 hours.

	cache.getOrSet(cacheKey, timeout, searchYoutube, function(data) {
        callback(data);
	});

    function searchYoutube(cb) {
        var params = {
            part: 'snippet',
            videoEmbeddable: 'true',
            type: 'video',
            q: query + ' official video',
            key: config.googleApiKey,
            safeSearch: 'none'
        };

        youtube.search.list(params, function(result, data) {
            if (data !== null && data !== undefined && data.items.length > 0) {
                cb(data.items[0]);
            } else {
                cb(null);
            }
        });
    }

};

module.exports = YoutubeService;
