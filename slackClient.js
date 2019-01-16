const fs = require('fs');
const request = require('request');
const WebSocket = require('ws');
const app = require('./lib/app');

// const TOKEN = process.env.SLACK_TOKEN;

// if (TOKEN === undefined) {
//   console.log( // eslint-disable-line no-console
//     'Error: SLACK_TOKEN undefined. Please add SLACK_TOKEN to the environment variables.'
//   );
//   process.exit(1);
// }

// makes a request to slack. Adds token to query
function slackRequest(endpoint, query, callback) {
  const qs = query;
  // qs.token = TOKEN;
  // try {
  //   qs.token = app.activeTeamId;
  // } catch (e) {
  //   throw new Error(e);
  // }

  return new Promise((resolve, reject) => {

    request.get({
      url: `https://slack.com/api/${endpoint}`,
      qs,
    }, (error, response, data) => {
      if (error) {
        fs.writeFileSync('error_log.txt', error);
        process.exit(1);
        reject(error);
      }

      if (response.statusCode !== 200) {
        fs.writeFileSync('error_log.txt', `Response Error: ${response.statusCode}`);
        process.exit(1);
      }

      const parsedData = JSON.parse(data);
      if (!parsedData.ok) {
        // can't see console.logs with blessed
        fs.writeFileSync('error_log.txt', `Error: ${parsedData.error}`);
        process.exit(1);
      }

      if (typeof callback === 'function') {
        callback(error, response, data);
      }

      resolve(data);
    });
  });
}

module.exports = {
  /**
   * Init slack instance
   * @param {string} token
   * @param {(token: string; parsedData: object; ws: WebSocket) => void} callback
   */
  async init(token, callback) {
    await slackRequest('rtm.start', { token }, (error, response, data) => {
      const parsedData = JSON.parse(data);
      const ws = new WebSocket(parsedData.url);
      callback(token, parsedData, ws);
    })
      .catch((e) => {
        throw new Error(e);
      });

    return 'done';
  },
  getChannels(token, callback) {
    slackRequest('channels.list', { token }, (error, response, data) => {
      if (callback) {
        callback(error, response, data);
      }
    });
  },
  joinChannel(name, callback) {
    slackRequest('channels.join', {
      name,
    }, (error, response, data) => {
      if (callback) {
        callback(error, response, data);
      }
    });
  },
  getChannelHistory(id, callback) {
    slackRequest('channels.history', {
      channel: id,
    }, (error, response, data) => {
      if (callback) {
        callback(error, response, data);
      }
    });
  },
  markChannel(id, timestamp, callback) {
    slackRequest('channels.mark', {
      channel: id,
      ts: timestamp,
    }, (error, response, data) => {
      if (callback) {
        callback(error, response, data);
      }
    });
  },
  getUsers(token, callback) {
    slackRequest('users.list', { token }, (error, response, data) => {
      if (callback) {
        callback(error, response, data);
      }
    });
  },
  openIm(token, id, callback) {
    slackRequest('im.open', {
      user: id,
      token,
    }, (error, response, data) => {
      if (callback) {
        callback(error, response, data);
      }
    });
  },
  getImHistory(token, id, callback) {
    slackRequest('im.history', {
      channel: id,
      token,
    }, (error, response, data) => {
      if (callback) {
        callback(error, response, data);
      }
    });
  },
  markIm(token, id, timestamp, callback) {
    slackRequest('im.mark', {
      channel: id,
      ts: timestamp,
      token,
    }, (error, response, data) => {
      if (callback) {
        callback(error, response, data);
      }
    });
  },
};
