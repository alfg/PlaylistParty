import $ from 'jquery';
import Backbone from 'backbone';

import PlaylistPlayer from './services/playlistPlayer';
import HelloView from './views/hello';
import Home from './controllers/home';
import User from './controllers/user';


export default Backbone.Router.extend({

  routes: {
    '': Home,
    'featured-playlists': Home,
    'categories': 'categories',
    'categories/:category': 'category',
    'playlist/:user': User,
    'about': 'about'
  },

  initialize: () => {
    $('body').append('<div id="js-app"></div>');
  },

  home: () => {
    var helloView = new HelloView({
      template: _.template('Hello <%= name %> !')
    }).render();

    $('#js-app').empty().append(helloView.$el);

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

  about: () => {
    var helloView = new HelloView({
      template: _.template('Im the about page')
    }).render();

    $('#js-app').empty().append(helloView.$el);
  }

});
