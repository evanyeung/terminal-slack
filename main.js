// Dependencies
// Get token from config
const config = require('./.env');
const app = require('./lib/app');

[app.currentTeam] = config;

const components = require('./lib/components');
const slack = require('./slackClient.js');
const handlers = require('./lib/handlers');

// DONE: remove message from channel, when someone deleted it
// DONE: refactor code, added my lib folder, added tests
// DONE: Run 2 and more slack teams

// set the channel list
components.channelList.setItems(['Connecting to Slack...']);
components.screen.render();

Promise.all(
  config.map((token) => {
    return slack.init(token, handlers.slack.testInit);
  })
)
  .then(() => {
    handlers.slack.initInterface();
  });

components.screen.on('keypress', (ch, key) => {
  if (key.full === 'C-n') {
    handlers.slack.nextTeam();
    handlers.slack.renderLists();
  } else if (key.full === 'C-p') {
    handlers.slack.prevTeam();
    handlers.slack.renderLists();
  }
});

