var MatomoTracker = require('matomo-tracker');

function getRemoteAddr(req) {
    if (req.ip) return req.ip;
    if (req._remoteAddress) return req._remoteAddress;
    var sock = req.socket;
    if (sock.socket) return sock.socket.remoteAddress;
    return sock.remoteAddress;
}

exports = module.exports = function analytics(options) {
    var matomo = new MatomoTracker(options.siteId, options.matomoUrl);

    return function track(req, res, next) {
        var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

        if(req.body.action){
            var action = req.body.action;
        } else {
            var action = 'unkown'
        }
        
        matomo.track({
            url: fullUrl,
            action_name: action,
            ua: req.header('User-Agent'),
            lang: req.header('Accept-Language'),
            cvar: JSON.stringify({
              '1': ['API version', 'v1'],
              '2': ['HTTP method', req.method]
            }),
            cip: getRemoteAddr(req)

        });
        next();
    }
}