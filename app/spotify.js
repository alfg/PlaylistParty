var async = require('async');
var config = require('../config');
var cache = require('./cache');
var request = require('request');
var Youtube = require('./youtube');


function SpotifyService() {
    this.youtubeService = new Youtube();
    this.country = 'US';
    this.limit = 100;
}

SpotifyService.prototype.getAuth = function(callback) {
    var self = this;

    // Request Authorization Options.
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (new Buffer(config.client_id + ':' + config.client_secret).toString('base64'))
        },
        form: {
            grant_type: 'client_credentials'
        },
        json: true
    };

    // Request Authorization.
    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {

            // Prepare Auth Bearer.
            var token = body.access_token;
            cache.token = token;
            callback();
        }
    });
};

SpotifyService.prototype.getFeaturedPlaylists = function(date, callback) {
    var self = this;

    var timestamp = formatLocalDate(date);

    var options = {
        url: 'https://api.spotify.com/v1/browse/featured-playlists',
        qs: {
            country: self.country,
            limit: 50, // Featured playlists max.
            timestamp: timestamp
        },
        headers: {
            //'Authorization': 'Bearer ' + self.app.locals.token
            'Authorization': 'Bearer ' + cache.token
        },
        json: true
    };

    // Request featured-playlists.
    self.getAuth(function() {
        // Update auth token.
        options.headers['Authorization'] = 'Bearer ' + cache.token;

        request.get(options, function(error, response, body) {
            var playlists = body.playlists.items;
            callback(playlists);
        });
    });
}

SpotifyService.prototype.getNewReleases = function(callback) {
    var self = this;

    var date = formatLocalDate();

    var options = {
        url: 'https://api.spotify.com/v1/browse/new-releases',
        qs: {
            country: self.country,
            limit: 50 // New releases max.
        },
        headers: {
            'Authorization': 'Bearer ' + cache.token
        },
        json: true
    };

    // Request featured-playlists.
    self.getAuth(function() {
        // Update auth token.
        options.headers['Authorization'] = 'Bearer ' + cache.token;

        request.get(options, function(error, response, body) {
            var albums = body.albums.items;
            callback(albums);
        });
    });
}

SpotifyService.prototype.getCategories = function(callback) {
    var self = this;

    var options = {
        url: 'https://api.spotify.com/v1/browse/categories',
        qs: {
            country: self.country,
            limit: 50 // New releases max.
        },
        headers: {
            'Authorization': 'Bearer ' + cache.token
        },
        json: true
    };

    // Request featured-playlists.
    self.getAuth(function() {
        // Update auth token.
        options.headers['Authorization'] = 'Bearer ' + cache.token;

        request.get(options, function(error, response, body) {
            var categories = body.categories.items;
            callback(categories);
        });
    });
}

SpotifyService.prototype.getCategoryPlaylist = function(category_id, callback) {
    var self = this;

    var options = {
        url: 'https://api.spotify.com/v1/browse/categories/{0}/playlists'
            .replace('{0}', category_id),
        qs: {
            country: self.country,
            limit: 50 // Categories Playlist max.
        },
        headers: {
            'Authorization': 'Bearer ' + cache.token
        },
        json: true
    };

    // Request featured-playlists.
    self.getAuth(function() {
        // Update auth token.
        options.headers['Authorization'] = 'Bearer ' + cache.token;

        request.get(options, function(error, response, body) {
            var playlists = body.playlists.items;
            callback(playlists);
        });
    });
}

SpotifyService.prototype.getPlaylistById = function(user_id, playlist_id, callback) {
    var self = this;

    var date = formatLocalDate();

    var options = {
        url: 'https://api.spotify.com/v1/users/{0}/playlists/{1}'
            .replace('{0}', user_id).replace('{1}', playlist_id),
        qs: {
            country: self.country,
            limit: self.limit,
            timestamp: date
        },
        headers: {
            //'Authorization': 'Bearer ' + self.app.locals.token
            'Authorization': 'Bearer ' + cache.token
        },
        json: true
    };

    // Request featured-playlists.
    self.getAuth(function() {
        // Update auth token.
        options.headers['Authorization'] = 'Bearer ' + cache.token;

        request.get(options, function(error, response, body) {
            var playlist = body;
            callback(playlist);
        });
    });
}

SpotifyService.prototype.getPlaylistTracksById = function(user_id, playlist_id, callback) {
    var self = this;

    var date = formatLocalDate();

    var options = {
        url: 'https://api.spotify.com/v1/users/{0}/playlists/{1}/tracks'
            .replace('{0}', encodeURIComponent(user_id)).replace('{1}', playlist_id),
        qs: {
            country: self.country,
            limit: self.limit,
            timestamp: date
        },
        headers: {
            //'Authorization': 'Bearer ' + self.app.locals.token
            'Authorization': 'Bearer ' + cache.token
        },
        json: true
    };

    // Request featured-playlists.
    self.getAuth(function() {
        // Update auth token.
        options.headers['Authorization'] = 'Bearer ' + cache.token;

        request.get(options, function(error, response, body) {
            var data = body;
            callback(data);
        });
    });
}

SpotifyService.prototype.getUserPlaylists = function(user_id, callback) {
    var self = this;

    var date = formatLocalDate();

    var options = {
        url: 'https://api.spotify.com/v1/users/{0}/playlists'
            .replace('{0}', encodeURIComponent(user_id)),
        qs: {
            country: self.country,
            limit: 50, // Max playlists per user limit.
            timestamp: date
        },
        headers: {
            'Authorization': 'Bearer ' + cache.token
        },
        json: true
    };

    // Request featured-playlists.
    self.getAuth(function() {
        // Update auth token.
        options.headers['Authorization'] = 'Bearer ' + cache.token;

        request.get(options, function(error, response, body) {
            var playlists = body.items;
            callback(playlists);
        });
    });
}

SpotifyService.prototype.getYoutubeVideos = function(tracks, callback) {
    var self = this;

    async.map(tracks.items, getTrack, function(err, results) {
        callback(tracks);
    });

    function getTrack(item, cb) {
        var trackName = item.track.name;
        var artistName = item.track.artists[0].name;
        var query = '{0} {1}'
            .replace('{0}', trackName)
            .replace('{1}', artistName);

        // Search Youtube for track by name.
        self.youtubeService.searchYoutube(query, function(data) {
            if (data !== null && data !== undefined) {
                item.track.external_ids['youtube'] = data.id;
                cb();
            } else {
                cb();
            }
        });
    }
}

function formatLocalDate(timestamp) {
    var now = new Date(parseInt(timestamp)),
        tzo = -now.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function(num) {
            var norm = Math.abs(Math.floor(num));
            return (norm < 10 ? '0' : '') + norm;
        };
    return now.getFullYear()
        + '-' + pad(now.getMonth()+1)
        + '-' + pad(now.getDate())
        + 'T' + pad(now.getHours())
        + ':' + pad(now.getMinutes())
        + ':' + pad(now.getSeconds())
        + dif + pad(tzo / 60)
        + ':' + pad(tzo % 60);
}

module.exports = SpotifyService;
