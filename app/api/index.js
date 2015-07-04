var express = require('express');
var router = express.Router();

/**
 * Homepage demo.
 */
router.get('/', function(req, res) {
	res.json({ data: 'Hello World!'});
});

module.exports = router;
