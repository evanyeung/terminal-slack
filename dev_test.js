var request = require('request'),
    WebSocket = require('ws'),
    TOKEN = 'xoxp-4806430644-4806430646-4828204363-89ebec';



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
    console.log(data.url);

    var ws = new WebSocket(data.url);

    ws.on('open', function() { console.log('Opened!'); });
    ws.on('message', function(data, flags) {
        console.log('Message!');
        console.log(data);
    });

    getChannels(function(error, response, data){
        console.log(data);
    });
});

function getChannels(callback) {
    request.get({
        url: 'https://slack.com/api/channels.list',
        qs: {
            token: TOKEN,
        }
    },
    function(error, response, data) {
        callback(error, response, data);
    });
}
