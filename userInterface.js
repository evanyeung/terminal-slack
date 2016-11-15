const blessed = require('blessed');

const keyBindings = {};

module.exports = {
  init() {
    const screen = blessed.screen({
      autopadding: true,
      smartCSR: true,
      title: 'Slack',
    });

    const container = blessed.box({
      width: '100%',
      height: '100%',
      style: {
        fg: '#bbb',
        bg: '#1d1f21',
      },
    });

    const sideBar = blessed.box({
      width: '30%',
      height: '100%',
    });

    const mainWindow = blessed.box({
      width: '70%',
      height: '100%',
      left: '30%',
      // scrollable: true,
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: '#888',
        },
      },
    });

    const mainWindowTitle = blessed.text({
      width: '90%',
      tags: true,
    });

    const chatWindow = blessed.box({
      width: '90%',
      height: '75%',
      left: '5%',
      top: '10%',
      keys: true,
      vi: true,
      scrollable: true,
      alwaysScroll: true,
      tags: true,
    });

    const messageInput = blessed.textbox({
      width: '90%',
      left: '5%',
      top: '85%',
      keys: true,
      vi: true,
      inputOnFocus: true,
      border: {
        type: 'line',
      },
    });

    function searchChannels(searchCallback) {
      const searchBoxTitle = blessed.text({
        width: '90%',
        left: '5%',
        align: 'left',
        content: '{bold}Search{/bold}',
        tags: true,
      });
      const searchBox = blessed.textbox({
        width: '90%',
        height: 'shrink',
        left: '5%',
        top: '5%',
        keys: true,
        vi: true,
        inputOnFocus: true,
        border: {
          fg: '#cc6666',
          type: 'line',
        },
      });
      function removeSearchBox() {
        mainWindow.remove(searchBox);
        mainWindow.remove(searchBoxTitle);
        mainWindow.append(mainWindowTitle);
        mainWindow.append(chatWindow);
        mainWindow.append(messageInput);
        screen.render();
      }
      searchBox.on('keypress', (ch, key) => {
        if (Object.keys(keyBindings).includes(key.full)) {
          searchBox.cancel();
          removeSearchBox();
          const fn = keyBindings[key.full];
          if (fn) {
            fn();
          }
        }
      });
      searchBox.on('submit', (text) => {
        removeSearchBox();
        searchCallback(text);
      });
      mainWindow.remove(mainWindowTitle);
      mainWindow.remove(chatWindow);
      mainWindow.remove(messageInput);
      mainWindow.append(searchBoxTitle);
      mainWindow.append(searchBox);
      searchBox.focus();
      screen.render();
    }

    const channelsBox = blessed.box({
      width: '100%',
      height: '60%',
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: '#888',
        },
      },
    });

    const channelsTitle = blessed.text({
      width: '90%',
      left: '5%',
      align: 'center',
      content: '{bold}Channels{/bold}',
      tags: true,
    });

    const channelList = blessed.list({
      width: '90%',
      height: '85%',
      left: '5%',
      top: '10%',
      keys: true,
      vi: true,
      search: searchChannels,
      style: {
        selected: {
          bg: '#373b41',
          fg: '#c5c8c6',
        },
      },
      tags: true,
    });

    const usersBox = blessed.box({
      width: '100%',
      height: '40%',
      top: '60%',
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: '#888',
        },
      },
    });

    const usersTitle = blessed.text({
      width: '90%',
      left: '5%',
      align: 'center',
      content: '{bold}Users{/bold}',
      tags: true,
    });

    const userList = blessed.list({
      width: '90%',
      height: '70%',
      left: '5%',
      top: '20%',
      keys: true,
      vi: true,
      search: searchChannels,
      style: {
        selected: {
          bg: '#373b41',
          fg: '#c5c8c6',
        },
      },
      tags: true,
    });

    channelsBox.append(channelsTitle);
    channelsBox.append(channelList);
    usersBox.append(usersTitle);
    usersBox.append(userList);
    sideBar.append(channelsBox);
    sideBar.append(usersBox);
    mainWindow.append(mainWindowTitle);
    mainWindow.append(chatWindow);
    mainWindow.append(messageInput);
    container.append(sideBar);
    container.append(mainWindow);
    screen.append(container);

    keyBindings.escape = process.exit.bind(null, 0);            // esc to exit
    keyBindings['C-c'] = channelList.focus.bind(channelList);   // ctrl-c for channels
    keyBindings['C-u'] = userList.focus.bind(userList);         // ctrl-u for users
    keyBindings['C-w'] = messageInput.focus.bind(messageInput); // ctrl-w for write
    keyBindings['C-l'] = chatWindow.focus.bind(chatWindow);     // ctrl-l for message list

    function callKeyBindings(ch, key) {
      const fn = keyBindings[key.full];
      if (fn) {
        fn();
      }
    }

    userList.on('keypress', callKeyBindings);
    channelList.on('keypress', callKeyBindings);
    chatWindow.on('keypress', callKeyBindings);
    messageInput.on('keypress', (ch, key) => {
      if (Object.keys(keyBindings).includes(key.full)) {
        messageInput.cancel();
        callKeyBindings(ch, key);
      }
    });

    // scrolling in chat window
    chatWindow.on('keypress', (ch, key) => {
      if (key.name === 'up') {
        chatWindow.scroll(-1);
        screen.render();
        return;
      }
      if (key.name === 'down') {
        chatWindow.scroll(1);
        screen.render();
        return;
      }
    });

    // event handlers for focus and blur of inputs
    const onFocus = (component) => {
      component.style.border = { fg: '#cc6666' }; // eslint-disable-line no-param-reassign
      screen.render();
    };
    const onBlur = (component) => {
      component.style.border = { fg: '#888' }; // eslint-disable-line no-param-reassign
      screen.render();
    };
    userList.on('focus', onFocus.bind(null, usersBox));
    userList.on('blur', onBlur.bind(null, usersBox));
    channelList.on('focus', onFocus.bind(null, channelsBox));
    channelList.on('blur', onBlur.bind(null, channelsBox));
    messageInput.on('focus', onFocus.bind(null, messageInput));
    messageInput.on('blur', onBlur.bind(null, messageInput));
    chatWindow.on('focus', onFocus.bind(null, mainWindow));
    chatWindow.on('blur', onBlur.bind(null, mainWindow));

    return {
      screen,
      usersBox,
      channelsBox,
      usersTitle,
      userList,
      channelsTitle,
      channelList,
      mainWindow,
      mainWindowTitle,
      chatWindow,
      messageInput,
    };
  },
};
