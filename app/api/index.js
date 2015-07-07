var express = require('express');
var router = express.Router();
var Spotify = require('../spotify');


/**
 * Homepage demo.
 */
router.get('/', function(req, res) {
	res.json({ data: 'Hello World!'});
});

router.get('/playlists', function(req, res) {
    res.json({data: req.app.locals.playlistData});
});

router.get('/fetch', function(req, res) {
	var spotifyService = new Spotify(req.app);

    // Auth before getting playlists.
    spotifyService.getAuth(function() {
        spotifyService.getPlaylists();
    });

	res.json({message: "Refreshing data."})
});

module.exports = router;
