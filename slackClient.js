var request = require('request'),
    WebSocket = require('ws'),
    TOKEN = 'xoxp-4806430644-4806430646-4828204363-89ebec';

module.exports = {
    init: function(callback) {
        var self = this;
        request.get({
            url: 'https://slack.com/api/rtm.start',
            qs: {
                token: TOKEN
            }
        },
        function(error, response, data) {
            if (response.statusCode != 200) {
                console.log("Error: ", response.statusCode);
                return;
            }

            data = JSON.parse(data);
            var ws = new WebSocket(data.url);
            callback(data, ws);
        });
    },
    getChannels: function(callback) {

        request.get({
            url: 'https://slack.com/api/channels.list',
            qs: {
                token: TOKEN,
            }
        },
        function(error, response, data) {
            if(callback) callback(error, response, data);
        });
    },
    joinChannel: function(name, callback) {
        request.get({
            url: 'https://slack.com/api/channels.join',
            qs: {
                token: TOKEN,
                name: name
            }
        },
        function(error, response, data) {
            if(callback) callback(error, response, data);
        });
    },
    getChannelHistory: function(id, callback) {
        request.get({
            url: 'https://slack.com/api/channels.history',
            qs: {
                token: TOKEN,
                channel: id
            }
        },
        function(error, response, data) {
            if(callback) callback(error, response, data);
        });
    },
    markChannel: function(id, timestamp, callback) {
        request.get({
            url: 'https://slack.com/api/channels.mark',
            qs: {
                token: TOKEN,
                channel: id,
                ts: timestamp
            }
        },
        function(error, response, data) {
            if(callback) callback(error, response, data);
        });
    },
    getUsers: function(callback) {
        request.get({
            url: 'https://slack.com/api/users.list',
            qs: {
                token: TOKEN,
            }
        },
        function(error, response, data) {
            if(callback) callback(error, response, data);
        });
    }
};
