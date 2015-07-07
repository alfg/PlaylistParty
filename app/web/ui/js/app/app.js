;(function($) {

	// Plugin constructor with options and methods
	var MainPlugin = function(options) {

		var _self = this;

		var _defaults = {
			animConfig: {
				duration: 800,
				easing: 'easeInOutQuint',
				queue: false
			},
			player: {
				quality: 'hd720',
				autohide: 1
			},

            getPlaylistsApi: '/api/playlists'
		};

		var _options 	= $.extend(true, {}, _defaults, options);

		var _player 	= null;
		var _tmplShow 	= null;

		this.methods = {

			init: function () {
				// Find page name
				var page = $('#content').data('page');

				// Active navlink indicator
				$('#nav li.nav-' + page).find('a').addClass('secondary');

				switch (page) {

					case "index":
						_self.methods.initIndex();
						break;
				}
			},

			initIndex: function() {
                console.log('hello');
                _self.methods.getPlaylists();
                _self.methods.youTubeLoadPlayer();
			},

            getPlaylists: function() {
                console.log('getting playlists');

				$.ajax({
					url: _options.getPlaylistsApi,
					dataType: 'json'
				})
                .done(function(data) {
                    console.log(data);
                });

            },

			player_Ready: function(e) {
                console.log('ready');
				// e.target.playVideo();
			},

			youTubeLoadPlayer: function() {

				// Setup ready event callback for YouTube iframe API.
				window.onYouTubeIframeAPIReady 	= _self.methods.youTube_IframeAPIReady;

				// Load the YouTube Iframe API.
				var $script = $('<script />', {
					src: 'https://www.youtube.com/iframe_api'
				});

				$('script')
					.first()
					.before($script)
				;
			},

			youTube_IframeAPIReady: function() {

				_player = new YT.Player('player', {

					playerVars: {
						autohide: 		_options.player.autohide,
						autoplay: 		0,
						iv_load_policy: 3,
						modestbranding: 0,
						showinfo: 		0
					},

					events: {
						'onReady': 			_self.methods.player_Ready,
						'onStateChange': 	_self.methods.player_StateChange
					}
				});
			}


		}

		// Initialize
		_self.methods.init();
	};

	// Load plugin on document ready
	$(document).ready(new MainPlugin());

})($);
