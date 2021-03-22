/**
 * All global configuration.
 */

var config = {
    port: process.env.PORT || 3000,
    client_id: process.env.CLIENT_ID || '',
    client_secret: process.env.CLIENT_SECRET || '',
    redirect_uri: process.env.REDIRECT_URI || 'http://localhost:8888/callback',
    castApplicationId: process.env.CAST_APP_ID || '45F0BB1E',
    castNamespace: process.env.CAST_NAMESPACE || 'urn:x-cast:com.google.cast.spotlist'
}

module.exports = config;
