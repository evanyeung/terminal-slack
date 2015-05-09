var ui = require('./userInterface.js'),
    slack = require('./slackClient.js'),
    fs = require('fs'),
    components = ui.init(), // ui components
    users,
    channels,
    currentChannelId,

    // generates ids for messages
    getNextId = (function() {
        var id = 0;
        return function() {
            return id += 1;
        };
    })();

slack.init(function(data, ws) {
    var currentUser = data.self;

    // focus on the channel list
    components.channelList.select(0);
    components.channelList.focus();
    // re render screen
    components.screen.render();

    fs.appendFile('./ws_log.txt', '\n\n###############\n\n');
    ws.on('message', function(message, flags){
        fs.appendFile('./ws_log.txt', message + '\n');
    });

    // initialize these event handlers here as they allow functionality
    // that relies on websockets

    // event handler when message is submitted
    components.messageInput.on('submit', function(text) {
        components.messageInput.clearValue();
        components.messageInput.focus();
        components.chatWindow.insertBottom(
            '{bold}' + currentUser.name + '{/bold}: ' + text + ' (pending)'
        );

        components.screen.render();
        ws.send(JSON.stringify({
            id: getNextId(),
            type: 'message',
            channel: currentChannelId,
            text: text
        }));
    });
});

// set the channel list
components.channelList.setItems(['Connecting to Slack...']);
components.screen.render();

// set the channel list to the channels returned from slack
slack.getChannels(function(error, response, data){
    if (error || response.statusCode != 200) {
        console.log('Error: ', error, response || response.statusCode);
        return;
    }

    data = JSON.parse(data);
    channels = data.channels;
    components.channelList.setItems(
        channels.map(function(channel) {
            return channel.name;
        })
    );
});

// get list of users
slack.getUsers(function(response, error, data){
    users = JSON.parse(data).members;
});

// event handler when user selects a channel
components.channelList.on('select', function(data) {
    var channelName = data.content;

    // a channel was selected
    components.mainWindowTitle.setContent('{bold}' + channelName + '{/bold}');
    components.chatWindow.setContent('Getting messages...');
    components.screen.render();

    // join the selected channel
    slack.joinChannel(channelName, function(error, response, data) {
        if (error || response.statusCode != 200) {
            console.log('Error: ', error, response || response.statusCode);
            return;
        }

        data = JSON.parse(data);
        currentChannelId = data.channel.id;

        // get the previous messages of the channel and display them
        slack.getChannelHistory(currentChannelId, function(error, response, data) {
            if (error || response.statusCode != 200) {
                console.log('Error: ', error, response || response.statusCode);
                return;
            }

            data = JSON.parse(data);

            // filter and map the messages before displaying them
            data.messages
                .filter(function(item) {
                    return (item.type === 'message');
                })
                .map(function(message) {
                    var len = users.length,
                        username;

                    // get the author
                    for(var i=0; i < len; i++) {
                        if (message.user === users[i].id) {
                            username = users[i].name;
                        }
                    }
                    return {text: message.text, username: username};
                })
                .reverse() // messages are sent in "reverse"
                .forEach(function(message) {
                    components.chatWindow.deleteTop(); // remove loading message
                    // add messages to window
                    components.chatWindow.insertBottom(
                        '{bold}' + message.username + '{/bold}: ' + message.text
                    );
                });

            // reset messageInput and give focus
            components.messageInput.clearValue();
            components.messageInput.focus();
            components.screen.render();

            // mark the most recently read message
            slack.markChannel(currentChannelId, data.latest);
        });
    });
});

// event handler when input is deselected
components.messageInput.on('cancel', function() {
    components.channelList.focus();
    components.screen.render();
});

