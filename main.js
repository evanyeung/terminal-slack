const slack = require('./slackClient.js');
const components = require('./userInterface.js');
const dataStore = require('./dataStore.js');
const formatMessage = require('./formatMessage.js');
const rtmCallbacks = require('./rtmCallbacks');
const utils = require('./utils.js');

const { SCROLL_PER_MESSAGE, UNKNOWN_USER_NAME } = require('./constants.js');

let users;
let channels;

slack.init((data, ws) => {
  dataStore.setCurrentUser(data.self);

  // don't update focus until ws is connected
  // focus on the channel list
  components.channelList.select(0);
  components.channelList.focus();
  // re render screen
  components.screen.render();

  ws.on('message', (message /* , flags */) => {
    rtmCallbacks.onMessage({ users }, message);
  });

  // initialize these event handlers here as they allow functionality
  // that relies on websockets

  // event handler when message is submitted
  components.messageInput.on('submit', (text) => {
    const id = utils.getNextId();
    components.messageInput.clearValue();
    components.messageInput.focus();
    components.chatWindow.scrollTo(components.chatWindow.getLines().length * SCROLL_PER_MESSAGE);
    components.chatWindow.insertBottom(
      `{bold}${dataStore.getCurrentUser().name}{/bold}: ${text} (pending - ${id})`
    );
    components.chatWindow.scroll(SCROLL_PER_MESSAGE);

    components.screen.render();
    ws.send(JSON.stringify({
      id,
      type: 'message',
      channel: dataStore.getCurrentChannelId(),
      text,
    }));
  });

  // set the user list to the users returned from slack
  // called here to check against current user
  slack.getUsers((error, response, userData) => {
    if (error || response.statusCode !== 200) {
      console.log( // eslint-disable-line no-console
        'Error: ', error, response || response.statusCode
      );
      return;
    }

    const parsedUserData = JSON.parse(userData);
    users = parsedUserData.members
      .filter(user => !user.deleted && user.id !== dataStore.getCurrentUser().id);

    components.userList.setItems(users.map(slackUser => slackUser.name));
    components.screen.render();
  });
});

// set the channel list
components.channelList.setItems(['Connecting to Slack...']);
components.screen.render();

// set the channel list to the channels returned from slack
slack.getChannels((error, response, data) => {
  if (error || response.statusCode !== 200) {
    console.log( // eslint-disable-line no-console
      'Error: ', error, response && response.statusCode
    );
    return;
  }

  const channelData = JSON.parse(data);
  channels = channelData.channels.filter(channel => !channel.is_archived);

  components.channelList.setItems(
    channels.map(slackChannel => slackChannel.name)
  );
  components.screen.render();
});

// event handler when user selects a channel
function updateMessages(data, markFn) {
  components.chatWindow.deleteTop(); // remove loading message

  // filter and map the messages before displaying them
  data.messages
    .filter(item => !item.hidden)
    .filter(item => item.type === 'message')
    // Some messages related to message threading don't have text. This feature
    // isn't supported by terminal-slack right now so we filter them out
    .filter(item => typeof item.text !== 'undefined')
    .map((message) => {
      const len = users.length;
      let username;
      let i;

      // get the author
      if (message.user === dataStore.getCurrentUser().id) {
        username = dataStore.getCurrentUser().name;
      } else {
        for (i = 0; i < len; i += 1) {
          if (message.user === users[i].id) {
            username = users[i].name;
            break;
          }
        }
      }
      return { text: message.text, username: username || UNKNOWN_USER_NAME };
    })
    .forEach((message) => {
      // add messages to window
      components.chatWindow.unshiftLine(
        `{bold}${message.username}{/bold}: ${formatMessage(message.text, users)}`
      );
    });

  // mark the most recently read message
  if (data.messages.length) {
    markFn(dataStore.getCurrentChannelId(), data.messages[0].ts);
  }

  // reset messageInput and give focus
  components.messageInput.clearValue();
  components.chatWindow.scrollTo(components.chatWindow.getLines().length * SCROLL_PER_MESSAGE);
  components.messageInput.focus();
  components.screen.render();
}

components.userList.on('select', (data) => {
  const username = data.content;

  // a channel was selected
  components.mainWindowTitle.setContent(`{bold}${username}{/bold}`);
  components.chatWindow.setContent('Getting messages...');
  components.screen.render();

  // get user's id
  const userId = users.find(potentialUser => potentialUser.name === username).id;

  slack.openIm(userId, (error, response, imData) => {
    const parsedImData = JSON.parse(imData);
    dataStore.setCurrentChannelId(parsedImData.channel.id);

    // load im history
    slack.getImHistory(
      dataStore.getCurrentChannelId(),
      (histError, histResponse, imHistoryData) => {
        updateMessages(JSON.parse(imHistoryData), slack.markIm);
      });
  });
});

components.channelList.on('select', (data) => {
  const channelName = data.content;

  // a channel was selected
  components.mainWindowTitle.setContent(`{bold}${channelName}{/bold}`);
  components.chatWindow.setContent('Getting messages...');
  components.screen.render();

  // join the selected channel
  slack.joinChannel(channelName, (error, response, channelData) => {
    const parsedChannelData = JSON.parse(channelData);
    dataStore.setCurrentChannelId(parsedChannelData.channel.id);

    // get the previous messages of the channel and display them
    slack.getChannelHistory(dataStore.getCurrentChannelId(),
      (histError, histResponse, channelHistoryData) => {
        updateMessages(JSON.parse(channelHistoryData), slack.markChannel);
      }
    );
  });
});
