module.exports = {
  // This is a hack to make the message list scroll to the bottom whenever a message is sent.
  // Multiline messages would otherwise only scroll one line per message leaving part of the message
  // cut off. This assumes that messages will be less than 50 lines high in the chat window.
  SCROLL_PER_MESSAGE: 50,
  UNKNOWN_USER_NAME: 'Unknown User',
};
