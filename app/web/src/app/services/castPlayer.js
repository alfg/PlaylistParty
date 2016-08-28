import $ from 'jquery';
import _ from 'lodash';

export default class CastPlayer {
	constructor(options) {

		this._defaults = {
			player: {
				quality: 'default',
				controls: 0
			},
			getFeaturedPlaylistsApi: '/api/featured-playlists',
			getPlaylistTracksByIdApi: '/api/playlists/{0}/{1}/tracks',
		};

		this._options = $.extend(true, {}, this._defaults, options);

		this._playlists = null;
		this._categories = null;
		this._player = window._player;

		this._message = null;

		this.init();
	}

	init() {
		var self = this;

		this.youTubeLoadPlayer(); // Loads Youtube iFrame Player.

    cast.receiver.logger.setLevelValue(0);
    window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    console.log('Starting Receiver Manager');

    // handler for the 'ready' event
    castReceiverManager.onReady = function(event) {
      console.log('Received Ready event: ' + JSON.stringify(event.data));
      window.castReceiverManager.setApplicationState("Application status is ready...");
    };

    // handler for 'senderconnected' event
    castReceiverManager.onSenderConnected = function(event) {
      console.log('Received Sender Connected event: ' + event.data);
      console.log(window.castReceiverManager.getSender(event.data).userAgent);
    };

    // handler for 'senderdisconnected' event
    castReceiverManager.onSenderDisconnected = function(event) {
      console.log('Received Sender Disconnected event: ' + event.data);
      if (window.castReceiverManager.getSenders().length == 0) {
      window.close();
    }
    };

    // handler for 'systemvolumechanged' event
    castReceiverManager.onSystemVolumeChanged = function(event) {
      console.log('Received System Volume Changed event: ' + event.data['level'] + ' ' +
          event.data['muted']);
    };

    // create a CastMessageBus to handle messages for a custom namespace
    window.messageBus =
      window.castReceiverManager.getCastMessageBus(
          'urn:x-cast:com.google.cast.spotlist');

    // handler for the CastMessageBus message event
    window.messageBus.onMessage = function(event) {
      console.log('Message [' + event.senderId + ']: ' + event.data);
      // display the message from the sender
      //displayText(event.data);

			console.log(event);
			console.log(window._player);

			window._player.loadPlaylist(JSON.parse(event.data), 0, 5, self._options.player.quality);
      // inform all senders on the CastMessageBus of the incoming message event
      // sender message listener will be invoked
      window.messageBus.send(event.senderId, event.data);
    }

    // initialize the CastReceiverManager with an application status message
    window.castReceiverManager.start({statusText: "Application is starting"});
    console.log('Receiver Manager started');
	}

	cast() {

	}

	buildVideosArray(tracksArr) {
		var tracks = tracksArr.data.items;
		var videos = [];

		for (var i = 0; i < tracks.length; i++) {

			var v = tracks[i].track.external_ids.youtube;
			videos.push(v);
		}

		return videos;
	}

	getFeaturedPlaylists() {
		var self = this;

		var d = new Date();
		var now = d.getTime();

		$('#playlists').removeClass('show');

		$.ajax({
			url: self._options.getFeaturedPlaylistsApi,
			data: { timestamp: now },
			dataType: 'json',
			type: 'GET'
		})
		.done(function(data) {
			self._playlists = data;
		});
	}

	loadPlaylist(playlistName) {
		var self = this;

		var playlist = _.find(self._playlists.data, function(p) {
			return p.name == playlistName
		});

		var url = String.format(self._options.getPlaylistTracksByIdApi,
			playlist.owner.id, playlist.id);

			$.ajax({
				url: url,
				dataType: 'json'
			})
			.done(function(data) {
				var videos = self.buildVideosArray(data);
				self._player.loadPlaylist(videos, 0, 5, self._options.player.quality);
			});
	}

	player_Ready(e) {
		var self = this;

		this._player = window._player;
		this._player.setVolume(0);
	}

	youTubeLoadPlayer() {

		var self = this;
		// Setup ready event callback for YouTube iframe API.
		window.onYouTubeIframeAPIReady = function() { self.youTube_IframeAPIReady(self._options); };

		// Load the YouTube Iframe API.
		var $script = $('<script />', {
			src: 'https://www.youtube.com/iframe_api'
		});

		$('script')
		.first()
		.before($script)
		;
	}

	youTube_IframeAPIReady(options) {
		var self = this;

		window._player = new YT.Player('player', {

			playerVars: {
				controls: 0,
				autoplay: 1,
				iv_load_policy: 3,
				modestbranding: 0,
				showinfo:	1
			},

			events: {
				'onReady': function() { self.player_Ready() },
				'onStateChange': this.player_StateChange
			}
		});
	}
}
