import $ from 'jquery';
import _ from 'lodash';

// Underscore JS
// @see http://underscorejs.org
_.templateSettings = {
	evaluate: 		/\{\{#([\s\S]+?)\}\}/g, 			// {{# console.log("blah") }}
	interpolate: 	/\{\{[^#\{]([\s\S]+?)[^\}]\}\}/g, 	// {{ title }}
	escape: 		/\{\{\{([\s\S]+?)\}\}\}/g, 			// {{{ title }}}
}


export default class PlaylistPlayer {
        constructor(options) {
            // super(options);

    		this._defaults = {
    			player: {
    				quality: 'hd720',
    				autohide: 1
    			},
                getPlaylistsApi: '/api/playlists',
                getUserPlaylistsApi: '/api/playlists/{0}',
                getPlaylistTracksByIdApi: '/api/playlists/{0}/{1}/tracks',
                playlistTemplate: '/static/tmpl/playlists.html'
    		};

    		this._options = $.extend(true, {}, this._defaults, options);

    		this._player = null;
            this._playlists = null;

            this.youTubeLoadPlayer();
        }

        init() {
            this.getFeaturedPlaylists();
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

			$.ajax({
				url: self._options.getPlaylistsApi,
				dataType: 'json'
			})
            .done(function(data) {
                self._playlists = data;
                self.renderPlaylists(data);
            });

        }

        getUserPlaylists(user) {
            var self = this;

			$.ajax({
				url: self._options.getUserPlaylistsApi
    				.replace('{0}', user),
				dataType: 'json'
			})
            .done(function(data) {
                self._playlists = data;
                self.renderPlaylists(data);
            });

        }

        clickPlaylist(e, el) {
            var self = this;

            e.preventDefault(); // Prevent updating to index (#) route.

            var playlist = $(el).data('playlist');
            self.loadPlaylist(playlist);
			$('#player').slideDown();
        }

        loadPlaylist(playlistName) {
            var self = this;

            var playlist = _.find(self._playlists.data, function(p) {
                return p.name == playlistName
            });

			var url = self._options.getPlaylistTracksByIdApi
				.replace('{0}', playlist.owner.id)
				.replace('{1}', playlist.id)

			$.ajax({
				url: url,
				dataType: 'json'
			})
            .done(function(data) {
				var videos = self.buildVideosArray(data);
				self._player.loadPlaylist(videos, 0, 5, self._options.player.quality);
            });
        }

        renderPlaylists(data) {
            var self = this;
            var playlistData = data.data;

            $.ajax({
                url: self._options.playlistTemplate,
                dataType: 'html'
            })
            .done(function(tmpl) {

				var playlistTmpl = _.template(tmpl);

				$('#playlists').html(playlistTmpl({data: playlistData}));
                $('.js-playlist').on('click', function(e, el) { self.clickPlaylist(e, this) });
            });
        }

		player_Ready(e) {
			// e.target.playVideo();
		}

		youTubeLoadPlayer() {

            var self = this;
			// Setup ready event callback for YouTube iframe API.
			window.onYouTubeIframeAPIReady 	= function() { self.youTube_IframeAPIReady(self._options); };

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

			this._player = new YT.Player('player', {

				playerVars: {
					autohide: 		options.player.autohide,
					autoplay: 		0,
					iv_load_policy: 3,
					modestbranding: 0,
					showinfo: 	1
				},

				events: {
					'onReady': 			this.player_Ready,
					'onStateChange': 	this.player_StateChange
				}
			});
		}
    }
