# SpotlistTV

Play Spotify Playlists on Youtube.

![Spotlist.TV](screenshot.png)

Built with NodeJS, Express, Backbone, and ES6.

http://spotlist.tv

## Development

##### Register API Keys
- https://developer.spotify.com/
- https://developers.google.com/youtube/v3/getting-started


##### Clone and install dependencies

```bash
$ git clone https://github.com/alfg/spotlistTV.git
$ cd spotlistTV
$ npm install
```

Open `config.js` and configure or set environment variables

```javascript
client_id: '<key>',  // Spotify API key.
client_secret: '<secret>',  // Spotify Secret Key.
redirect_uri: 'http://localhost:3000/callback',  // Spotify redirect URI.
googleApiKey: '<google api key>',  // Google API Key.
```

Run server.
```bash
node server.js
```

##### Build Web Frontend
```bash
$ gulp
```

Frontend will now build and watch for changes. If you want to build without watching, use `gulp build`.

Visit `http://localhost:3000`


##### Chromecast
TODO

## License

[MIT License](http://alfg.mit-license.org/) © Alfred Gutierrez
