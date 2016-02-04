require('dotenv').config();

var request = require('request'),
    WebSocket = require('ws'),
    TOKEN = process.env.SLACK_TOKEN;

if (TOKEN === undefined) {
    console.log('Error: SLACK_TOKEN undefined. Please add SLACK_TOKEN to the environment variables.');
    process.exit(1);
}

// makes a request to slack. Adds token to query
function slackRequest(endpoint, query, callback) {
    var qs = query;
    qs.token = TOKEN;
    request.get({
        url: 'https://slack.com/api/' + endpoint,
        qs: qs
    },
    function (error, response, data) {
        if (error) {
            require('fs').writeFileSync('error_log.txt', error);
            process.exit(1);
        }
        if (response.statusCode != 200) {
            require('fs').writeFileSync('error_log.txt', 'Response Error: ' + response.statusCode);
            process.exit(1);
        }

        var parsedData = JSON.parse(data);
        if (!parsedData.ok) {
            // can't see console.logs with blessed
            require('fs').writeFileSync('error_log.txt', 'Error: ' + parsedData.error);
            process.exit(1);
        }
        if (callback) { callback(error, response, data); }
    });
}

module.exports = {
    init: function(callback) {
        slackRequest('rtm.start', {}, function(error, response, data) {
            data = JSON.parse(data);
            var ws = new WebSocket(data.url);
            callback(data, ws);
        });
    },
    getChannels: function(callback) {
        slackRequest('channels.list', {}, function(error, response, data) {
            if(callback) callback(error, response, data);
        });
    },
    joinChannel: function(name, callback) {
        slackRequest(
            'channels.join',
            {name: name},
            function(error, response, data) {
                if(callback) callback(error, response, data);
            }
        );
    },
    getChannelHistory: function(id, callback) {
        slackRequest(
            'channels.history',
            {channel: id},
            function(error, response, data) {
                if(callback) callback(error, response, data);
            }
        );
    },
    markChannel: function(id, timestamp, callback) {
        slackRequest(
            'channels.mark',
            {
                channel: id,
                ts: timestamp
            },
            function(error, response, data) {
                if(callback) callback(error, response, data);
            }
        );
    },
    getUsers: function(callback) {
        slackRequest('users.list', {}, function(error, response, data) {
            if(callback) callback(error, response, data);
        });
    }
};
