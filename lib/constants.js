const UNKNOWN_USER_NAME = 'Unknown User';
// This is a hack to make the message list scroll to the bottom whenever a message is sent.
// Multiline messages would otherwise only scroll one line per message leaving part of the message
// cut off. This assumes that messages will be less than 50 lines high in the chat window.
const SCROLL_PER_MESSAGE = 50;

module.exports = {
  UNKNOWN_USER_NAME,
  SCROLL_PER_MESSAGE,
};
