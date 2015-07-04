// Route loader.
// Load `*.js` under current directory as properties
//  i.e., `users.js` will become `exports['user']` or `exports.users`
require('fs').readdirSync(__dirname + '/').forEach(function(file) {
  if (file.match(/\.js$/) !== null && file !== 'routes.js') {
    var name = file.replace('.js', '');
    exports[name] = require('./' + file);
  }
});
