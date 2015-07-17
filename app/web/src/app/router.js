import $ from 'jquery';
import Backbone from 'backbone';

import HelloView from './views/hello';
import Home from './controllers/home';


export default Backbone.Router.extend({

  routes: {
    '': Home,
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

  about: () => {
    var helloView = new HelloView({
      template: _.template('Im the about page')
    }).render();

    $('#js-app').empty().append(helloView.$el);
  }

});
