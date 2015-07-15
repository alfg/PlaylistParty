var express = require('express');
var config = require('../../config');
var cache = require('../cache');
var router = express.Router();

var NodeCache = require('node-cache');
var myCache = new NodeCache();

var Spotify = require('../spotify');

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
	var cacheKey = 'playlist_tracks_' + user_id + playlist_id;

	// TODO: Create caching service.
	myCache.get(cacheKey, function(err, value) {
		if (!err) {
			if (value == undefined) {
			    // Get playlists.
				var spotifyService = new Spotify();
			    spotifyService.getPlaylistTracksById(user_id, playlist_id, function(data) {
					spotifyService.getYoutubeVideos(data, function(data) {
						myCache.set(cacheKey, data, 15);
						res.json({data: data});
					});
				});

			} else {
				res.json({data: value});
			}
		}
	})

});

module.exports = router;
