const notifier = require('node-notifier');
const path = require('path');

const components = require('./userInterface.js');
const dataStore = require('./dataStore.js');
const formatMessage = require('./formatMessage.js');

const { SCROLL_PER_MESSAGE, UNKNOWN_USER_NAME } = require('./constants.js');

function handleNewMessage(globals, message) {
  const { users } = globals;
  let username;
  if (message.user === dataStore.getCurrentUser().id) {
    username = dataStore.getCurrentUser().name;
  } else {
    const author = users.find(user => message.user === user.id);
    username = (author && author.name) || UNKNOWN_USER_NAME;

    notifier.notify({
      icon: path.join(__dirname, 'Slack_Mark_Black_Web.png'),
      message: `${username}: ${message.text}`,
      sound: true,
      title: 'Terminal Slack',
    });
  }

  if (message.channel !== dataStore.getCurrentChannelId() ||
      typeof message.text === 'undefined') {
    return;
  }

  components.chatWindow.insertBottom(
    `{bold}${username}{/bold}: ${formatMessage(message.text, users)}`
  );
  components.chatWindow.scroll(SCROLL_PER_MESSAGE);
  components.screen.render();
}

// handles the reply to say that a message was successfully sent
function handleSentConfirmation(message) {
  // for some reason getLines gives an object with int keys
  const lines = components.chatWindow.getLines();
  const keys = Object.keys(lines);
  let line;
  let i;
  for (i = keys.length - 1; i >= 0; i -= 1) {
    line = lines[keys[i]].split('(pending - ');
    if (parseInt(line.pop()[0], 10) === message.reply_to) {
      components.chatWindow.deleteLine(parseInt(keys[i], 10));

      if (message.ok) {
        components.chatWindow.insertLine(i, line.join(''));
      } else {
        components.chatWindow.insertLine(i, `${line.join('')} (FAILED)`);
      }
      break;
    }
  }
  components.chatWindow.scroll(SCROLL_PER_MESSAGE);
  components.screen.render();
}

function onMessage(globals, message) {
  const parsedMessage = JSON.parse(message);

  if ('reply_to' in parsedMessage) {
    handleSentConfirmation(parsedMessage);
  } else if (parsedMessage.type === 'message') {
    handleNewMessage(globals, parsedMessage);
  }
}

module.exports = {
  onMessage,
};
