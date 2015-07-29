/**
 * All global configuration.
 */

var config = {
    port: process.env.PORT || 3000,
    client_id: process.env.CLIENT_ID || '',
    client_secret: process.env.CLIENT_SECRET || '',
    redirect_uri: process.env.REDIRECT_URI || 'http://localhost:8888/callback',
    googleApiKey: process.env.GOOGLE_API_KEY || '',
}

module.exports = config;
