const { UNKNOWN_USER_NAME } = require('./constants.js');

// formats channel and user mentions readably
function formatMessage(text, currentUser, users) {
  if (text === null || typeof text === 'undefined') {
    return '';
  }

  let formattedText = text;
  // find user mentions
  const userMentions = text.match(/<@U[a-zA-Z0-9]+>/g);
  if (userMentions !== null) {
    userMentions
      .map(match => match.substr(2, match.length - 3))
      .forEach((userId) => {
        let username;
        let modifier;
        if (userId === currentUser.id) {
          username = currentUser.name;
          modifier = 'yellow-fg';
        } else {
          const user = users.find(potentialUser => potentialUser.id === userId);
          username = typeof user === 'undefined' ? UNKNOWN_USER_NAME : user.name;
          modifier = 'underline';
        }

        formattedText = text.replace(
          new RegExp(`<@${userId}>`, 'g'),
          `{${modifier}}@${username}{/${modifier}}`);
      });
  }

  // find special words
  return formattedText.replace(
    /<!channel>/g,
    '{yellow-fg}@channel{/yellow-fg}');
}

module.exports = formatMessage;
