var config = require('../config');
var request = require('request');
var Youtube = require('./youtube');


function SpotifyService(app) {
    this.app = app;
    this.youtubeService = new Youtube(app);
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
            self.app.locals.token = token;
            callback();
        }
    });
};

SpotifyService.prototype.getPlaylists = function() {
    var self = this;
    console.log(self.app.locals.token);
    var options = {
        url: 'https://api.spotify.com/v1/browse/featured-playlists?country=US&limit=5',
        headers: {
            'Authorization': 'Bearer ' + self.app.locals.token
        },
        json: true
    };

    // Request featured-playlists.
    request.get(options, function(error, response, body) {
        var playlists = body.playlists.items;
        self.getTracks(playlists);
    });
}

SpotifyService.prototype.getTracks = function(playlists) {
    var self = this;

    for (var i = 0; i < playlists.length; i++) {
        self.app.locals.playlistData.push({
            playlist: playlists[i].name,
            image: playlists[i].images[0].url,
            tracks: []});


        // Request each playlist's tracks resource.
        self.getTrackNames(playlists, i);
    }
}

SpotifyService.prototype.getTrackNames = function(playlists, i) {
    var self = this;

    // Prepare request for each playlist resource.
    var options = {
        url: playlists[i].tracks.href,
        headers: {
            'Authorization': 'Bearer ' + self.app.locals.token
        },
        json: true
    };

    request.get(options, function(error, response, body) {
        // console.log('\n\n===================');
        // console.log(playlists[i].name);
        // console.log('===================\n');

        for (var j = 0; j < body.items.length; j++) {
            // console.log(body.items[j].track.name);
            // playlistData[i].tracks.push(body.items[j].track.name);
            if (self.app.locals.playlistData[i] !== undefined) {
                // console.log(playlistData[i].tracks);
                // playlistData[i].tracks.push(body.items[j].track.name);
                var trackName = body.items[j].track.name;

                // Search Youtube for track by name.
                self.youtubeService.searchYoutube(trackName, function(data) {
                    console.log(data);
                    if (data !== null && data !== undefined) {
                        self.app.locals.playlistData[i].tracks.push(data);
                    }
                });
            }

        }

    });
}

module.exports = SpotifyService;
