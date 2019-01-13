/*
 * Slack callbacks, components and message handlers
*/

// Dependencies
const fs = require('fs');
const notifier = require('node-notifier');
const path = require('path');
const components = require('./components');
const helpers = require('./helpers');
const { SCROLL_PER_MESSAGE, UNKNOWN_USER_NAME } = require('./constants');
const app = require('./app');
const slack = require('../slackClient');
const config = require('../.env');

// handlers Container
const handlers = {
  slack: {
    initInterface() {
      // initialize these event handlers here as they allow functionality
      // that relies on websockets

      // event handler when message is submitted
      components.messageInput.on('submit', (text) => {
        if (!text || !text.length) {
          components.messageInput.focus();
          return;
        }

        const id = helpers.getNextId();
        components.messageInput.clearValue();
        components.messageInput.focus();
        components.chatWindow.scrollTo(components.chatWindow.getLines().length * SCROLL_PER_MESSAGE);
        components.chatWindow.insertBottom(
          `{bold}${app.currentUser.name}{/bold}: ${text} (pending - ${id})`
        );
        components.chatWindow.scroll(SCROLL_PER_MESSAGE);

        components.screen.render();
        app.team[app.currentTeam].ws.send(JSON.stringify({
          id,
          type: 'message',
          channel: app.currentChannelId,
          text,
        }));
      });

      // if (token === app.currentTeam) {
      // // set the channel list to the channels returned from slack
      // TODO: Test user list select
      components.userList.on('select', handlers.components.userListOnSelect);
      components.channelList.on('select', handlers.components.channelListOnSelect);

      handlers.slack.renderLists();

      // don't update focus until ws is connected
      // focus on the channel list
      components.channelList.select(0);
      components.channelList.focus();
      // re render screen
      components.screen.render();
      // }
    },
    testInit(token, data, ws) {
      if (typeof app.team[token] !== 'object' || app.team[token] == null) {
        app.team[token] = {};
      }

      app.team[token].team = data.team;
      app.team[token].id = token;
      app.team[token].ws = ws;
      app.team[token].self = data.self;

      if (token === app.currentTeam) {
        app.currentUser = data.self;
      }

      ws.on('message', (message /* , flags */) => {
        const parsedMessage = JSON.parse(message);
        if ('reply_to' in parsedMessage) {
          handlers.message.sentConfirmation(parsedMessage);
        } else if (parsedMessage.type === 'message') {
          handlers.message.newMessage(parsedMessage);
        }
      });
    },
    renderLists() {
      const token = app.currentTeam;

      app.currentUser = app.team[app.currentTeam].self;

      // set the user list to the users returned from slack
      // called here to check against currentUser
      slack.getUsers(token, (error, response, userData) => {
        if (error || response.statusCode !== 200) {
          console.log( // eslint-disable-line no-console
            'Error: ', error, response || response.statusCode
          );
          return;
        }

        const parsedUserData = JSON.parse(userData);
        app.team[token].users = parsedUserData.members.filter(user => !user.deleted);

        // If is active team, render list
        if (app.currentTeam === token) {
          handlers.components.renderUsersList(app.team[token].users);
        }
      });

      slack.getChannels(token, (channelErr, response, responseData) => {
        if (channelErr || response.statusCode !== 200) {
          console.log( // eslint-disable-line no-console
            'Error: ', channelErr, response && response.statusCode
          );
          return;
        }

        const channelData = JSON.parse(responseData);
        app.team[token].channels = channelData.channels.filter(channel => !channel.is_archived);

        // If is active team, render list
        if (app.currentTeam === token) {
          handlers.components.renderChannelsList(app.team[token].channels);
        }
        // components.channelList.setItems(
        //   app.channels.map(slackChannel => slackChannel.name)
        // );
        // components.screen.render();
      });

      // don't update focus until ws is connected
      // focus on the channel list
      components.channelList.select(0);
      components.channelList.focus();
      // re render screen
      components.screen.render();
      // }
    },
    nextTeam() {
      const teamLength = Object.keys(app.team).length;
      let currentTeamIndex = config.indexOf(app.currentTeam);


      if (currentTeamIndex > -1) {
        // eslint-disable-next-line no-plusplus
        currentTeamIndex++;
        if (currentTeamIndex >= teamLength) {
          currentTeamIndex = 0;
        }
      } else {
        currentTeamIndex = 0;
      }

      components.loggerText.insertBottom(JSON.stringify(app.team[config[currentTeamIndex]].team.name, null, 4));
      components.loggerText.scroll(SCROLL_PER_MESSAGE);
      components.screen.render();

      app.currentTeam = config[currentTeamIndex];
    },
    prevTeam() {
      const teamLength = Object.keys(app.team).length;
      let currentTeamIndex = config.indexOf(app.currentTeam);
      if (currentTeamIndex > -1) {
        // eslint-disable-next-line no-plusplus
        currentTeamIndex--;
        if (currentTeamIndex < 0) {
          currentTeamIndex = teamLength - 1;
        }
      } else {
        currentTeamIndex = 0;
      }
      app.currentTeam = config[currentTeamIndex];
    },
  },
  components: {
    userListOnSelect: (data) => {
      const username = data.content;
      const token = app.currentTeam;

      // get user's id
      try {
        const userId = app.team[token].users.find(potentialUser => potentialUser.name === username).id;

        slack.openIm(token, userId, (error, response, imData) => {
          if (error) {
            throw error;
          }

          const parsedImData = JSON.parse(imData);
          app.currentChannelId = parsedImData.channel.id;

          // a channel was selected
          components.mainWindowTitle.setContent(`{bold}${username}: ${userId} / ${JSON.stringify(parsedImData.channel)}:${parsedImData.channel.id}{/bold}`);
          components.chatWindow.setContent('Getting messages...');
          components.screen.render();

          // load im history
          slack.getImHistory(token, app.currentChannelId, (histError, histResponse, imHistoryData) => {
            if (histError) {
              throw histError;
            }
            handlers.message.updateMessage(JSON.parse(imHistoryData), slack.markIm);
          });
        });
      } catch (e) {
        throw new Error(e);
      }
    },
    channelListOnSelect: (data) => {
      const channelName = data.content;
      const token = app.currentTeam;

      // a channel was selected
      components.mainWindowTitle.setContent(`{bold}${channelName}{/bold}`);
      components.chatWindow.setContent('Getting messages...');
      components.screen.render();

      // join the selected channel
      slack.joinChannel(token, channelName, (error, response, channelData) => {
        const parsedChannelData = JSON.parse(channelData);
        app.currentChannelId = parsedChannelData.channel.id;

        // get the previous messages of the channel and display them
        slack.getChannelHistory(app.currentChannelId, (histError, histResponse, channelHistoryData) => {
          handlers.message.updateMessage(JSON.parse(channelHistoryData), slack.markChannel);
        });
      });
    },
    renderUsersList(list) {
      components.userList.setItems(list.map(slackUser => slackUser.name));
      components.screen.render();
    },
    renderChannelsList(list) {
      components.channelList.setItems(
        list.map(slackChannel => slackChannel.name)
      );
      components.screen.render();
    },
  },
  message: {
    // +
    // handles the reply to say that a message was successfully sent
    sentConfirmation(message) {
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
    },
    // +
    // formats channel and user mentions readably
    formatMessageMentions(text) {
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
            if (userId === app.currentUser.id) {
              username = app.currentUser.name;
              modifier = 'yellow-fg';
            } else {
              const user = app.users.find(potentialUser => potentialUser.id === userId);
              username = typeof user === 'undefined' ? UNKNOWN_USER_NAME : user.name;
              modifier = 'underline';
            }

            formattedText = text.replace(
              new RegExp(`<@${userId}>`, 'g'),
              `{${modifier}}@${username}{/${modifier}}`
            );
          });
      }

      // find special words
      return formattedText.replace(
        /<!channel>/g,
        '{yellow-fg}@channel{/yellow-fg}'
      );
    },
    // +
    newMessage(message) {
      const token = app.currentTeam;
      // components.loggerText.insertBottom(JSON.stringify(message, null, 4));
      // components.loggerText.scroll(SCROLL_PER_MESSAGE);
      // components.screen.render();

      let username;
      let author;
      let text;
      let title = `Terminal Slack ${app.team[token].team.name}`;
      let isDelete = false; // check if is deleted message
      // if (message.user === currentUser.id) {
      //   username = currentUser.name;
      // } else {
      if (message.subtype === 'message_deleted') {
        const deletedMessage = message.previous_message;
        author = app.team[token].users.find(user => deletedMessage.user === user.id);
        username = (author && author.name) || UNKNOWN_USER_NAME;
        // eslint-disable-next-line prefer-destructuring
        text = deletedMessage.text;
        title += ' deleted message';
        isDelete = true;
      } else {
        author = app.team[token].users.find(user => message.user === user.id);
        username = (author && author.name) || UNKNOWN_USER_NAME;
        // eslint-disable-next-line prefer-destructuring
        text = message.text;
      }

      // Show notify only when author is not You
      // if (author.id !== app.currentUser) {
      notifier.notify({
        icon: path.join(__dirname, 'Slack_Mark_Black_Web.png'),
        message: `${username}: ${text}`,
        sound: true,
        title,
      });
      // }

      // Show message only when channel and team is active
      if (message.channel !== app.currentChannelId ||
        typeof text === 'undefined' || token !== app.currentTeam) {
        return;
      }

      const formatedText = handlers.message.formatMessageMentions(text);

      if (isDelete) {
        let deleteLineIndex = null;
        // Find last message match, if we have view message with same conttent
        // To fix this need to add 'ts' from message object and hide it
        components.chatWindow.getLines().forEach((item, index) => {
          if (item.length > 0) {
            const [, comparedText] = item.split(':');

            components.loggerText.insertBottom(`Compared line: ${item} - ${formatedText}`);
            components.loggerText.scroll(SCROLL_PER_MESSAGE);

            if (typeof comparedText === 'string' && comparedText.trim() === formatedText) {
              deleteLineIndex = index;
            }
          }
        });

        components.loggerText.insertBottom(`Deleted line: ${deleteLineIndex}`);
        components.loggerText.scroll(SCROLL_PER_MESSAGE);

        if (typeof deleteLineIndex === 'number') {
          // components.chatWindow.deleteBottom();
          components.chatWindow.deleteLine(deleteLineIndex);
          // components.chatWindow.scroll(-SCROLL_PER_MESSAGE);
        }
      } else {
        components.chatWindow.insertBottom(
          `{bold}${username}{/bold}: ${formatedText}`
        );
        components.chatWindow.scroll(SCROLL_PER_MESSAGE);
      }
      components.screen.render();
    },
    updateMessage(data, markFn) {
      components.chatWindow.deleteTop(); // remove loading message

      // filter and map the messages before displaying them
      data.messages
        .filter(item => !item.hidden)
        .filter(item => item.type === 'message')
        // Some messages related to message threading don't have text. This feature
        // isn't supported by terminal-slack right now so we filter them out
        .filter(item => typeof item.text !== 'undefined')
        .map((message) => {
          const len = app.users.length;
          let username;
          let i;

          // get the author
          if (message.user === app.currentUser.id) {
            username = app.currentUser.name;
          } else {
            for (i = 0; i < len; i += 1) {
              if (message.user === app.users[i].id) {
                username = app.users[i].name;
                break;
              }
            }
          }
          return { text: message.text, username: username || UNKNOWN_USER_NAME };
        })
        // Added - dont show unknown user
        .filter(message => message.username !== UNKNOWN_USER_NAME)
        .forEach((message) => {
          // add messages to window
          components.chatWindow.unshiftLine(
            `{bold}${message.username}{/bold}: ${handlers.message.formatMessageMentions(message.text)}`
          );
        });

      // mark the most recently read message
      if (data.messages.length) {
        markFn(app.currentTeam, app.currentChannelId, data.messages[0].ts);
      }

      // reset messageInput and give focus
      components.messageInput.clearValue();
      components.chatWindow.scrollTo(components.chatWindow.getLines().length * SCROLL_PER_MESSAGE);
      components.messageInput.focus();
      components.screen.render();
    },
  },
};

// Export module
module.exports = handlers;
