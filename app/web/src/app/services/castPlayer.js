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
		this._cast = null;

		this.init();
	}

	init() {
		var self = this;

		this.youTubeLoadPlayer(); // Loads Youtube iFrame Player.
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
			self.renderPlaylists(data);
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
