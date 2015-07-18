var express = require('express');
var config = require('../../config');
var cache = require('../cache');
var router = express.Router();

var Spotify = require('../spotify');

/**
 * Homepage demo.
 */
router.get('/', function(req, res) {
	res.json({ data: 'Hello World!'});
});

router.get('/playlists', function(req, res) {

	var cacheKey = 'featured_playlists';
	var timeout = 60 * 15; // 15 minutes.

	cache.getOrSet(cacheKey, timeout, getFeaturedPlaylists, function(data) {
		res.json({data: data});
	});

	// Cache function.
	function getFeaturedPlaylists(callback) {
	    // Get playlists.
		var spotifyService = new Spotify();
	    spotifyService.getFeaturedPlaylists(function(data) {
            callback(data);
		});
	}
});

router.get('/playlists/:user_id', function(req, res) {
	var user_id = req.params.user_id;

    // Get user playlists.
	var spotifyService = new Spotify();
    spotifyService.getUserPlaylists(user_id, function(data) {
		res.json({data: data});
	});
});

router.get('/playlists/:user_id/:playlist_id', function(req, res) {
	var user_id = req.params.user_id;
	var playlist_id = req.params.playlist_id;

    // Get playlists.
	var spotifyService = new Spotify();
    spotifyService.getPlaylistById(user_id, playlist_id, function(data) {
		res.json({data: data});
	});
});

router.get('/playlists/:user_id/:playlist_id/tracks', function(req, res) {
	var user_id = req.params.user_id;
	var playlist_id = req.params.playlist_id;
	var cacheKey = 'playlist_tracks_' + user_id + playlist_id;
	var timeout = 60 * 60 * 4; // 4 hours.

	cache.getOrSet(cacheKey, timeout, getTracks, function(data) {
		res.json({data: data});
	});

	// Cache function.
	function getTracks(callback) {
	    // Get playlists tracks with Youtube IDs.
		var spotifyService = new Spotify();
	    spotifyService.getPlaylistTracksById(user_id, playlist_id, function(data) {
			spotifyService.getYoutubeVideos(data, function(data) {
                callback(data);
			});
		});
	}
});

module.exports = router;
