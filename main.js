var ui = require('./userInterface.js');
var slack = require('./slackClient.js');
const notifier = require('node-notifier');
const path = require('path');
var components = ui.init(); // ui components
var users;
var currentUser;
var channels;
var currentChannelId;

// This is a hack to make the message list scroll to the bottom whenever a message is sent.
// Multiline messages would otherwise only scroll one line per message leaving part of the message
// cut off. This assumes that messages will be less than 50 lines high in the chat window.
var SCROLL_PER_MESSAGE = 50;

// generates ids for messages
var getNextId = (function () {
  var id = 0;
  return function () {
    id += 1;
    return id;
  };
}());

// handles the reply to say that a message was successfully sent
function handleSentConfirmation(message) {
  // for some reason getLines gives an object with int keys
  var lines = components.chatWindow.getLines();
  var keys = Object.keys(lines);
  var line;
  var i;
  for (i = keys.length - 1; i >= 0; i -= 1) {
    line = lines[keys[i]].split('(pending - ');
    if (parseInt(line.pop()[0], 10) === message.reply_to) {
      components.chatWindow.deleteLine(parseInt(keys[i], 10));

      if (message.ok) {
        components.chatWindow.insertLine(i, line.join(''));
      } else {
        components.chatWindow.insertLine(i, line.join('') + ' (FAILED)');
      }
      break;
    }
  }
  components.chatWindow.scroll(SCROLL_PER_MESSAGE);
  components.screen.render();
}


function handleNewMessage(message) {
  // get the author
  var username;
  if (message.user === currentUser.id){
    username =  currentUser.name
  }
  else {
    username = users.find(function (user){
      return message.user === user.id;
    }).name;
    notifier.notify({   //added notifier support
      title: 'Terminal slack',
      message: username + ': '+ message.text ,
      icon: path.join(__dirname, 'slack.png'),
      sound: 'Glass',
      wait: true
    }, function (err, response) {
      // Response is response from notification
    });
    if (message.channel !== currentChannelId) {
      return;
    }
  }
  components.chatWindow.insertBottom(
    '{bold}' + username + '{/bold}: ' + message.text
  );
  components.chatWindow.scroll(SCROLL_PER_MESSAGE);
  components.screen.render();
}

slack.init(function (data, ws) {
  currentUser = data.self;

  // don't update focus until ws is connected
  // focus on the channel list
  components.channelList.select(0);
  components.channelList.focus();
  // re render screen
  components.screen.render();

  ws.on('message', function (message /* , flags */) {
    var parsedMessage = JSON.parse(message);

    if ('reply_to' in parsedMessage) {
      handleSentConfirmation(parsedMessage);
    } else if (parsedMessage.type === 'message') {
      handleNewMessage(parsedMessage);
    }
  });

  // initialize these event handlers here as they allow functionality
  // that relies on websockets

  // event handler when message is submitted
  components.messageInput.on('submit', function (text) {
    var id = getNextId();
    components.messageInput.clearValue();
    components.messageInput.focus();
    components.chatWindow.scrollTo(components.chatWindow.getLines().length * SCROLL_PER_MESSAGE);
    components.chatWindow.insertBottom(
      '{bold}' + currentUser.name + '{/bold}: ' + text + ' (pending - ' + id + ' )'
    );
    components.chatWindow.scroll(SCROLL_PER_MESSAGE);

    components.screen.render();
    ws.send(JSON.stringify({
      id: id,
      type: 'message',
      channel: currentChannelId,
      text: text,
    }));
  });

  // set the user list to the users returned from slack
  // called here to check against currentUser
  slack.getUsers(function (error, response, userData) {
    if (error || response.statusCode !== 200) {
      console.log('Error: ', error, response || response.statusCode);
      return;
    }

    var parsedUserData = JSON.parse(userData);
    users = parsedUserData.members.filter(function (user) {
      return !user.deleted && user.id !== currentUser.id;
    });

    components.userList.setItems(
      users.map(function (slackUser) {
        return slackUser.name;
      })
    );
    components.screen.render();
  });
});

// set the channel list
components.channelList.setItems(['Connecting to Slack...']);
components.screen.render();

// set the channel list to the channels returned from slack
slack.getChannels(function (error, response, data) {
  if (error || response.statusCode !== 200) {
    console.log('Error: ', error, response || response.statusCode);
    return;
  }

  var channelData = JSON.parse(data);
  channels = channelData.channels.filter(function (channel) {
    return !channel.is_archived;
  });

  components.channelList.setItems(
    channels.map(function (slackChannel) {
      return slackChannel.name;
    })
  );
  components.screen.render();
});

// event handler when user selects a channel
var updateMessages = function (data, markFn) {
  components.chatWindow.deleteTop(); // remove loading message

  // filter and map the messages before displaying them
  data.messages
  .filter(function (item) {
    return (item.type === 'message');
  })
  .map(function (message) {
    var len = users.length;
    var username;

    // get the author
    if (message.user === currentUser.id) {
      username = currentUser.name;
    } else {
      for (var i = 0; i < len; i += 1) {
        if (message.user === users[i].id) {
          username = users[i].name;
          break;
        }
      }
    }

    return { text: message.text, username: username };
  })
  .forEach(function (message) {
    // add messages to window
    components.chatWindow.unshiftLine(
      '{bold}' + message.username + '{/bold}: ' + message.text
    );
  });

  // mark the most recently read message
  if (data.messages.length) {
    markFn(currentChannelId, data.messages[0].ts);
  }

  // reset messageInput and give focus
  components.messageInput.clearValue();
  components.chatWindow.scrollTo(components.chatWindow.getLines().length * SCROLL_PER_MESSAGE);
  components.messageInput.focus();
  components.screen.render();
};

components.userList.on('select', function (data) {
  var userName = data.content;

  // a channel was selected
  components.mainWindowTitle.setContent('{bold}' + userName + '{/bold}');
  components.chatWindow.setContent('Getting messages...');
  components.screen.render();

  // get user's id
  var userId = users.find(function (potentialUser) {
    return potentialUser.name === userName;
  }).id;

  slack.openIm(userId, function (error, response, imData) {
    var parsedImData = JSON.parse(imData);
    currentChannelId = parsedImData.channel.id;

    // load im history
    slack.getImHistory(currentChannelId, function (histError, histResponse, imHistoryData) {
      updateMessages(JSON.parse(imHistoryData), slack.markIm);
    });
  });
});

components.channelList.on('select', function (data) {
  var channelName = data.content;

  // a channel was selected
  components.mainWindowTitle.setContent('{bold}' + channelName + '{/bold}');
  components.chatWindow.setContent('Getting messages...');
  components.screen.render();

  // join the selected channel
  slack.joinChannel(channelName, function (error, response, channelData) {
    var parsedChannelData = JSON.parse(channelData);
    currentChannelId = parsedChannelData.channel.id;

    // get the previous messages of the channel and display them
    slack.getChannelHistory(currentChannelId,
      function (histError, histResponse, channelHistoryData) {
        updateMessages(JSON.parse(channelHistoryData), slack.markChannel);
      }
    );
  });
});
