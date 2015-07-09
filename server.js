#!/usr/bin/env node

/*
 * dozeTV.
 * WebApp to convert Spotify Playlists to Youtube Playlists.
 * Powered by NodeJS and Express.js.
 *
 * Copyright (c) 2015 Alfred Gutierrez alfg.co.
 *
 * Project home:
 *   https://github.com/alfg/dozeTV
 */

// Import application and set port.
var app = require('./app/app');
var config = require('./config');
var port = process.env.PORT || config.port; // set our port

// Start server.
app.listen(port);
console.log('starting on port ' + port);
