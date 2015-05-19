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

    // don't update focus until ws is connected
    // focus on the channel list
    components.channelList.select(0);
    components.channelList.focus();
    // re render screen
    components.screen.render();

    //fs.appendFile('./ws_log.txt', '\n\n###############\n\n');
    ws.on('message', function(message, flags){
        message = JSON.parse(message);

        if ('reply_to' in message) {
            handleSentConfirmation(message);
        }
        else if (message.type === 'message') {
            handleNewMessage(message);
        }
    });

    // initialize these event handlers here as they allow functionality
    // that relies on websockets

    // event handler when message is submitted
    components.messageInput.on('submit', function(text) {
        var id = getNextId();
        components.messageInput.clearValue();
        components.messageInput.focus();
        components.chatWindow.insertBottom(
            '{bold}' + currentUser.name + '{/bold}: ' + text +
            ' (pending - ' + id +' )'
        );
        components.chatWindow.scroll(1);

        components.screen.render();
        ws.send(JSON.stringify({
            id: id,
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
            components.chatWindow.deleteTop(); // remove loading message

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
                // Have to add messages in reverse order as no scrolling.
                // There may be a way to avoid this if I look into blessing more
                .reverse()
                .forEach(function(message) {
                    // add messages to window
                    components.chatWindow.insertBottom(
                        '{bold}' + message.username + '{/bold}: ' + message.text
                    );
                });

            // reset messageInput and give focus
            components.messageInput.clearValue();
            components.chatWindow.scrollTo(components.chatWindow.getLines().length);
            components.messageInput.focus();
            components.screen.render();

            // mark the most recently read message
            slack.markChannel(currentChannelId, data.latest);
        });
    });
});

// handles the reply to say that a message was successfully sent
function handleSentConfirmation(message) {
    // for some reason getLines gives an object with int keys
    var lines = components.chatWindow.getLines(),
        keys = Object.keys(lines),
        line, i;
    for(i=keys.length - 1; i >= 0; i--){
        line = lines[keys[i]].split('(pending - ');
        if (parseInt(line.pop()[0]) === message.reply_to) {

            components.chatWindow.deleteLine(parseInt(keys[i]));

            if (message.ok) {
                components.chatWindow.insertLine(i, line.join(''));
            }
            else {
                components.chatWindow.insertLine(i, line.join('') + ' (FAILED)');
            }
            break;
        }
    }
    // for some reason it has to be called twice
    components.screen.render();
    components.screen.render();
}

function handleNewMessage(message) {
    if(message.channel !== currentChannelId) {
        return;
    }

    var len = users.length,
        username;

    // get the author
    for(var i=0; i < len; i++) {
        if (message.user === users[i].id) {
            username = users[i].name;
        }
    }
    components.chatWindow.unshiftLine(
        '{bold}' + username + '{/bold}: ' + message.text
    );
    components.screen.render();
}
