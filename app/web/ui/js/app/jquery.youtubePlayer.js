
/*	================================================================================

youtubePlayer

Summary:
	Playback of YouTube playlists using the YouTube iFrame API.
	See: https://developers.google.com/youtube/iframe_api_reference

Configuration:
	urlTmplShow (string) 	HTML for the show info.

	// Callbacks.
	context (object) 		The context in which the callback(s) will execute (optional).
	onComplete (function) 	Callback to execute when the plugin is completely instantiated and rendered (optional).
							Parameters sent to callback: { $elem }

Data attributes:
	data-jq-pluginname 		Elements with this attribute will be loaded into the _$els collection.

Dependencies:
	BasePlugin class
	jQuery


	================================================================================ */

;(function($) {

	var Plugin = new BasePlugin();

	Plugin.PLUGIN_NAME 		= 'youtubePlayer';

	Plugin.COMMANDS_RETURN 	= [];
	Plugin.INIT_AFTER_AUTH 	= false;
	Plugin.PLUGIN_ELS 		= null;

	Plugin.PluginObject = function($element, options) {

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
			urlTmplShow: 	'/ui/tmpl/watch-show-info.html',

			// Callbacks.
			context: 		null,
			onComplete: 	function() {}
		};
		var _options 	= $.extend(true, {}, _defaults, options);

		var _eNS 		= '.' + Plugin.PLUGIN_NAME; // Event namespace.
		var _player 	= null;
		var _self 		= this;
		var _tmplShow 	= null;

		var _$elem 		= $element;
		var _$els 		= Plugin.getPluginElements(_$elem);

		// Public methods.
		this.commands = {

			init: function() {

				// Load up JSON and template.
				_private.loadAssets()
					.then(_private.youTubeLoadPlayer)
				;

				// Setup elements.
				_$elem.find('.hidden').hide().removeClass('hidden');

				// Events.
				$(document).on('cntv:playlist', _private.document_Playlist);
			},

			destroy: function() {

				// Remove all events this plugin added.
				_$elem.off(_eNS);
				$(document).off(_eNS);

				// Remove all DOM elements this plugin appended.
				_$elem.removeData(Plugin.PLUGIN_NAME);
			}
		};

		// Private methods.
		var _private = {

			buildVideosArray: function(videoObj) {

				var videos = [];

				for (var i = 0; i < videoObj.length; i++) {

					// Extract video ID from Youtube URL.
					var v = videoObj[i].VideoURL.split('v=')[1];
					videos.push(v);
				}

				return videos;
			},

			document_Playlist: function(event, json) {

				var showID = json.Channel.Schedule[0].Show.ShowID;
				var videos = _private.buildVideosArray(json.Channel.Schedule[0].Show.Videos);

				if (! showID) return;

				// Queue list of videos.
				_player.loadPlaylist(videos, 0, 5, _options.player.quality);

				var showData	= json.Channel;
				var showTmpl 	= _.template(_tmplShow, showData);

				_$els.showInfo
					.fadeOut(function() {
						_$els.showInfo.html(showTmpl);
					})
					.fadeIn()
				;
			},

			loadAssets: function() {

				var df = $.Deferred();

				$.when(

					$.ajax({
						url: _options.urlTmplShow,
						dataType: 'html'
					})

				).then(function(htmlArgs) {

					_tmplShow 	= htmlArgs;

					df.resolve();

					// onComplete callback.
					setTimeout(function() {
						_options.onComplete.call(_options.context, { '$elem': _$elem });
					}, 1);

				}).fail(function() {

					console.log('--- init.when.fail()');
					console.log('arguments:', arguments);
				});

				return df;
			},

			player_Ready: function(e) {

				if (location.hostname.indexOf('local.com') === -1) e.target.playVideo();

				$(document).trigger('cntv:playerReady');
			},

			youTubeLoadPlayer: function() {

				// Setup ready event callback for YouTube iframe API.
				window.onYouTubeIframeAPIReady 	= _private.youTube_IframeAPIReady;

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

				var autoplay = $.localData.get({ key: 'autoplay' });
				autoplay = autoplay ? 1 : 0;

				_player = new YT.Player('youtube-player', {

					playerVars: {
						autohide: 		_options.player.autohide,
						autoplay: 		autoplay,
						iv_load_policy: 3,
						modestbranding: 0,
						showinfo: 		0
					},

					events: {
						'onReady': 			_private.player_Ready,
						'onStateChange': 	_private.player_StateChange
					}
				});
			}
		};
	};

	Plugin.createPlugin();

})(jQuery);
