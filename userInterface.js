var blessed = require('blessed');
var colorPal = require('./themes.js');
var supportsColor = require('supports-color');

// Colors
var colorSupportLevel = supportsColor ? supportsColor.level : 0;
var defaultThemesByColorLevel = {
    3: colorPal.default,
    2: colorPal.default, // Not tested yet
    1: colorPal.tty16Default,
    0: colorPal.tty1Default // Can be "tested" by passing --no-color argument
};

var theme = defaultThemesByColorLevel[colorSupportLevel];
var colors = theme.palette;


// UI
var keyBindings = {};

module.exports = {
  init: function () {
    var screen = blessed.screen({
      autopadding: true,
      smartCSR: true,
      title: 'Slack'
    });

    var container = blessed.box({
      width: '100%',
      height: '100%',
      style: {
        fg: colors.fg,
        bg: colors.bg
      }
    });

    var sideBar = blessed.box({
      width: '30%',
      height: '100%'
    });

    var mainWindow = blessed.box({
      width: '70%',
      height: '100%',
      left: '30%',
      // scrollable: true,
      border: {
        type: 'line'
      },
      style: {
        border: {
          fg: colors.boxBorderFG
        }
      }
    });

    var mainWindowTitle = blessed.text({
      width: '90%',
      tags: true
    });

    var chatWindow = blessed.box({
      width: '90%',
      height: '75%',
      left: '5%',
      top: '10%',
      keys: true,
      vi: true,
      scrollable: true,
      alwaysScroll: true,
      tags: true
    });

    var messageInput = blessed.textbox({
      width: '90%',
      left: '5%',
      top: '85%',
      keys: true,
      vi: true,
      inputOnFocus: true,
      border: {
        type: 'line'
      }
    });

    function searchChannels(searchCallback) {
      var searchBoxTitle = blessed.text({
        width: '90%',
        left: '5%',
        align: 'left',
        content: '{bold}Search{/bold}',
        tags: true
      });
      var searchBox = blessed.textbox({
        width: '90%',
        height: 'shrink',
        left: '5%',
        top: '5%',
        keys: true,
        vi: true,
        inputOnFocus: true,
        border: {
          fg: colors.searchFG,
          type: 'line'
        }
      });
      function removeSearchBox() {
        mainWindow.remove(searchBox);
        mainWindow.remove(searchBoxTitle);
        mainWindow.append(mainWindowTitle);
        mainWindow.append(chatWindow);
        mainWindow.append(messageInput);
        screen.render();
      }
      searchBox.on('keypress', function (ch, key) {
        if (Object.keys(keyBindings).includes(key.full)) {
          searchBox.cancel();
          removeSearchBox();
          var fn = keyBindings[key.full];
          if (fn) {
            fn();
          }
        }
      });
      searchBox.on('submit', function (text) {
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

    var channelsBox = blessed.box({
      width: '100%',
      height: '60%',
      border: {
        type: 'line'
      },
      style: {
        border: {
          fg: colors.boxBorderFG
        }
      }
    });

    var channelsTitle = blessed.text({
      width: '90%',
      left: '5%',
      align: 'center',
      content: '{bold}Channels{/bold}',
      tags: true
    });

    var channelList = blessed.list({
      width: '90%',
      height: '85%',
      left: '5%',
      top: '10%',
      keys: true,
      vi: true,
      search: searchChannels,
      style: {
        selected: {
          bg: colors.listSelectedItemBG,
          fg: colors.listSelectedItemFG
        }
      },
      tags: true
    });

    var usersBox = blessed.box({
      width: '100%',
      height: '40%',
      top: '60%',
      border: {
        type: 'line'
      },
      style: {
        border: {
          fg: colors.boxBorderFG
        }
      }
    });

    var usersTitle = blessed.text({
      width: '90%',
      left: '5%',
      align: 'center',
      content: '{bold}Users{/bold}',
      tags: true
    });

    var userList = blessed.list({
      width: '90%',
      height: '70%',
      left: '5%',
      top: '20%',
      keys: true,
      vi: true,
      search: searchChannels,
      style: {
        selected: {
          bg: colors.listSelectedItemBG,
          fg: colors.listSelectedItemFG
        }
      },
      tags: true
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
      var fn = keyBindings[key.full];
      if (fn) {
        fn();
      }
    }

    userList.on('keypress', callKeyBindings);
    channelList.on('keypress', callKeyBindings);
    chatWindow.on('keypress', callKeyBindings);
    messageInput.on('keypress', function (ch, key) {
      if (Object.keys(keyBindings).includes(key.full)) {
        messageInput.cancel();
        callKeyBindings(ch, key);
      }
    });

    // scrolling in chat window
    chatWindow.on('keypress', function (ch, key) {
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
    var onFocus = function (component) {
      component.style.border = { fg: colors.focusBorder }; // eslint-disable-line no-param-reassign
      screen.render();
    };
    var onBlur = function (component) {
      component.style.border = { fg: colors.boxBorderFG }; // eslint-disable-line no-param-reassign
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
      screen: screen,
      usersBox: usersBox,
      channelsBox: channelsBox,
      usersTitle: usersTitle,
      userList: userList,
      channelsTitle: channelsTitle,
      channelList: channelList,
      mainWindow: mainWindow,
      mainWindowTitle: mainWindowTitle,
      chatWindow: chatWindow,
      messageInput: messageInput
    };
  }
};
