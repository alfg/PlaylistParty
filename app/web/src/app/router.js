import $ from 'jquery';
import Backbone from 'backbone';

import PlaylistPlayer from './services/playlistPlayer';
import CastReceiver from './services/castReceiver';


export default Backbone.Router.extend({

    routes: {
        '': 'home',
        'featured-playlists': 'home',
        'playlist': 'playlist',
        'playlist/:user': 'userPlaylists',
        'playlist/:user/:playlistId': 'userPlaylist',
        'categories': 'categories',
        'categories/:category': 'category',
        'about': 'about',
        'receiver': 'receiver'
    },

    initialize: () => {
        $('#content').append('<div id="js-app"></div>');
    },

    home: () => {
        var player = new PlaylistPlayer();
        player.getFeaturedPlaylists();

        $('#playlist-title').empty().text('Featured Playlists');
    },

    categories: () => {
        var player = new PlaylistPlayer();
        player.getCategories();

        $('#playlist-title').empty().text('Categories');
    },

    category: (category) => {
        var player = new PlaylistPlayer();
        player.getCategoryById(category);

        $('#playlist-title').empty().text(category);
    },

    playlist: () => {
        var player = new PlaylistPlayer();
        player.renderUserPlaylist();

        $('#playlist-title').empty().text(`Enter a Spotify Username`);
    },

    userPlaylists: (user) => {
        var player = new PlaylistPlayer();
        player.getUserPlaylists(user);

        $('#playlist-title').empty().text(`${user}'s Public Playlists`);
    },

    userPlaylist: (user, playlistId) => {
        var player = new PlaylistPlayer();
        player.getUserPlaylistById(user, playlistId, (data) => {
          $('#playlist-title').empty().text(`Playing ${data.name}`);
        });
    },

    about: () => {
        var helloView = new HelloView({
            template: _.template('Im the about page')
        }).render();

        $('#js-app').empty().append(helloView.$el);
    },

    receiver: () => {
      console.log('receiving...');
      var player = new CastReceiver();
    }

});
