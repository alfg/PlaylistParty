var express = require('express');
var config = require('../../config');
var cache = require('../cache');
var router = express.Router();

var Spotify = require('../spotify');

var playlistInterval = config.playlistInterval;

/**
 * Homepage demo.
 */
router.get('/', function(req, res) {
	res.json({ data: 'Hello World!'});
});

router.get('/playlists', function(req, res) {
    res.json({data: cache.playlistData});
});

// Fetch playlists on app start and set interval to 1 hour.
setInterval(fetchPlaylists, playlistInterval);
fetchPlaylists();

function fetchPlaylists() {
	console.log("refreshing playlist data...");
	var spotifyService = new Spotify();

    // Auth before getting playlists.
    spotifyService.getAuth(function() {
        spotifyService.getPlaylists();
    });
}

module.exports = router;
