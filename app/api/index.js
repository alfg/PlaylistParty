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
	var spotifyService = new Spotify();

    // Get playlists.
    spotifyService.getPlaylists(function(data) {
		res.json({data: data});
	});
});

router.get('/playlists/:user_id/:playlist_id', function(req, res) {
	var user_id = req.params.user_id;
	var playlist_id = req.params.playlist_id;
	var spotifyService = new Spotify();

    // Get playlists.
    spotifyService.getPlaylistById(user_id, playlist_id, function(data) {
		res.json({data: data});
	});
});

router.get('/playlists/:user_id/:playlist_id/tracks', function(req, res) {
	var user_id = req.params.user_id;
	var playlist_id = req.params.playlist_id;
	var spotifyService = new Spotify();

    // Get playlists.
    spotifyService.getPlaylistTracksById(user_id, playlist_id, function(data) {
		res.json({data: data});
	});
});

// Fetch playlists on app start and set interval to 1 hour.
// setInterval(fetchPlaylists, playlistInterval);
// fetchPlaylists();

function fetchPlaylists() {
	console.log("refreshing playlist data...");
	var spotifyService = new Spotify();

    // Auth before getting playlists.
    spotifyService.getAuth(function() {
        spotifyService.getPlaylists();
    });
}

module.exports = router;
