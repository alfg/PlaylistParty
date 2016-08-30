import $ from 'jquery';
import _ from 'lodash';
import CastSender from './castSender';

// Underscore JS settings.
// @see http://underscorejs.org
_.templateSettings = {
  evaluate:     /\{\{#([\s\S]+?)\}\}/g,       // {{# console.log("blah") }}
  interpolate:   /\{\{[^#\{]([\s\S]+?)[^\}]\}\}/g,   // {{ title }}
  escape:     /\{\{\{([\s\S]+?)\}\}\}/g,       // {{{ title }}}
}

export default class PlaylistPlayer {
  constructor(options) {
    // super(options);

    this._defaults = {
      player: {
        quality: 'hd720',
        autohide: 1
      },
      getCategoriesApi: '/api/categories',
      getCategoryByIdApi: '/api/categories/{0}',
      getFeaturedPlaylistsApi: '/api/featured-playlists',
      getNewReleasesApi: '/api/new-releases',
      getUserPlaylistsApi: '/api/playlists/{0}',
      getPlaylistTracksByIdApi: '/api/playlists/{0}/{1}/tracks',

      userPlaylistTemplate: '/static/tmpl/userPlaylist.html',
      playlistTemplate: '/static/tmpl/playlists.html',
      categoriesTemplate: '/static/tmpl/categories.html'
    };

    this._options = $.extend(true, {}, this._defaults, options);

    this._playlists = null;
    this._currentPlaylist = null; // Selected playlist array.
    this._selectedPlaylist = null; // Selected playlist name.
    this._categories = null;

    this._player = window._player;
    this._cast = window._cast;
    this._isCasting = window._isCasting;

    this.init();
  }

  init() {
    var self = this;

    this.youTubeLoadPlayer(); // Loads Youtube iFrame Player.

    $('.js-fullscreen').on('click', function(e, el) { self.clickFullscreen(e, this) });
    $('.js-fullwidth').on('click', function(e, el) { self.clickFullwidth(e, this) });
    $('.js-normal').on('click', function(e, el) { self.clickNormal(e, this) });
    $('.js-cast').on('click', function(e, el) { self.clickCast(e, this) });

    window['__onGCastApiAvailable'] = function(loaded, errorInfo) {
      if (loaded) {
          window._cast = new CastSender();
          self._cast = window._cast;
      } else {
          console.log(errorInfo);
          $('.js-cast').hide();
      }
    }
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

  clickNormal(e, el) {
    var self = this;

    $('.js-player').removeClass('full-screen');
    $('.js-player').removeClass('full-width');
    window.scrollTo(0, 0);
  }

  clickCast(e, el) {
    var self = this;

    if (window._isCasting) {
      self.stopCast();
    } else {
      self.startCast();
    }
  }

  startCast() {
    var self = this;

    var el = $('#playlists').find('[data-playlist="' + self._selectedPlaylist + '"]')
    var bg = el.find('img').attr('src');

    // Hide YT Player.
    $('#player').slideUp();

    // Show casting banner.
    $('#casting').css('background-image', 'url(' + bg + ')');
    $('#casting-text').text('Connecting to cast...');
    $('#casting').slideDown();

    // Pause player and initialize cast.
    self._player.pauseVideo();

    self._cast.play(self._currentPlaylist, function() {

      // Update casting message and button.
      window._isCasting = true;
      $('#casting-text').text('Casting ' + self._selectedPlaylist);
      $('.js-cast').text('Stop Casting');
    });
  }

  stopCast() {

    self._cast.stop(function() {
      window._isCasting = false;
      console.log('stop cast');

      // Show YT Player.
      $('#player').slideDown();

      // Show casting banner.
      $('#casting-text').text('');
      $('#casting').slideUp();
      $('.js-cast').text('Cast Playlist');
    });

  }

  updateCast() {
    var self = this;

    var el = $('#playlists').find('[data-playlist="' + self._selectedPlaylist + '"]')
    var bg = el.find('img').attr('src');

    // Update casting banner.
    $('#casting').css('background-image', 'url(' + bg + ')');
    $('#casting-text').text('Casting ' + self._selectedPlaylist);

    self._cast.play(self._currentPlaylist);
  }

  clickFullscreen(e, el) {
    var self = this;

    $('.js-player').removeClass('full-width');
    $('.js-player').addClass('full-screen');
    window.scrollTo(0, 200);
  }

  clickFullwidth(e, el) {
    var self = this;

    $('.js-player').removeClass('full-screen');
    $('.js-player').addClass('full-width');
    window.scrollTo(0, 0);
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

  getCategories() {
    var self = this;

    $('#playlists').removeClass('show');

    $.ajax({
      url: self._options.getCategoriesApi,
      dataType: 'json'
    })
    .done(function(data) {
      self._categories = data;
      self.renderCategories(data);
    });
  }

  getCategoryById(category) {
    var self = this;

    $('#playlists').removeClass('show');

    $.ajax({
      url: String.format(self._options.getCategoryByIdApi, category),
      dataType: 'json'
    })
    .done(function(data) {
      self._playlists = data;
      self.renderPlaylists(data);
    });
  }

  getUserPlaylists(user) {
    var self = this;

    $('#playlists').removeClass('show');

    $.ajax({
      url: String.format(self._options.getUserPlaylistsApi, user),
      dataType: 'json'
    })
    .done(function(data) {
      self._playlists = data;
      self.renderPlaylists(data);
    });

  }

  clickPlaylist(e, el) {
    var self = this;

    $('#playlists .playing').removeClass('on');
    $('#playlists img').removeClass('blur');
    $(el).find('.playing').addClass('on');
    $(el).find('img').addClass('blur');

    e.preventDefault(); // Prevent updating to index (#) route.

    self._selectedPlaylist = $(el).data('playlist');
    self.loadPlaylist(self._selectedPlaylist);
    $('.js-spinner').text('Loading playlist...');
    window.scrollTo(0, 0);

    if (!window._isCasting) {
      $('#casting').slideUp();
    }
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
        self._currentPlaylist = self.buildVideosArray(data);

        if (window._isCasting) {
          self.updateCast();
          $('.js-spinner').empty();
        } else {
          self._player.loadPlaylist(self._currentPlaylist, 0, 5, self._options.player.quality);
          $('.js-spinner').empty();
          $('#player').slideDown();
          $('.player-controls').slideDown();
        }
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

      $('#playlists')
      .html(playlistTmpl({data: playlistData}))
      .addClass('show');
      $('.js-playlist').on('click', function(e, el) { self.clickPlaylist(e, this) });
    });
  }

  renderUserPlaylist() {
    var self = this;

    $.ajax({
      url: self._options.userPlaylistTemplate,
      dataType: 'html'
    })
    .done(function(tmpl) {

      var userPlaylistTmpl = _.template(tmpl);

      $('#playlists')
      .html(userPlaylistTmpl)
      .addClass('show');

      $('#user-form').on('submit', function(e) {
        e.preventDefault();

        var user = $('#user-input').val();
        window.location.hash = `/playlist/${user}`;
      });
    });
  }

  renderCategories(data) {
    var self = this;
    var categoriesData = data.data;

    $.ajax({
      url: self._options.categoriesTemplate,
      dataType: 'html'
    })
    .done(function(tmpl) {

      var categoriesTmpl = _.template(tmpl);

      $('#playlists')
      .html(categoriesTmpl({data: categoriesData}))
      .addClass('show');
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
        autohide:     options.player.autohide,
        autoplay:     0,
        iv_load_policy: 3,
        modestbranding: 0,
        showinfo:   1
      },

      events: {
        'onReady':       function() { self.player_Ready() },
        'onStateChange':   this.player_StateChange
      }
    });
  }
}
