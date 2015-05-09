var blessed = require('blessed');

module.exports = {

    init: function() {
        var screen = blessed.screen({
            autopadding: true,
            smartCSR: true
        });

        screen.title = 'Slack';

        var container = blessed.box({
            width: '100%',
            height: '100%',
            style: {
                fg: '#bbb',
                bg: '#1d1f21'
            }
        });

        var sideBar = blessed.box({
            width: '30%',
            height: '100%',
            border: {
                type: 'line'
            },
            style: {
                border: {
                    fg: '#888'
                }
            }

        });

        var sideBarTitle = blessed.text({
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
            style: {
                selected: {
                    bg: '#373b41',
                    fg: '#c5c8c6'
                }
            },
            tags: true
        });

        var mainWindow = blessed.box({
            width: '70%',
            height: '100%',
            left: '30%',
            //scrollable: true,
            border: {
                type: 'line'
            },
            style: {
                border: {
                    fg: '#888'
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
            //scrollable: true,
            tags: true
        });

        var messageInput = blessed.textbox({
            width: '90%',
            left: '5%',
            top: '85%',
            keys: true,
            inputOnFocus: true,
            border: {
                type: 'line'
            }
        });

        sideBar.append(sideBarTitle);
        sideBar.append(channelList);
        mainWindow.append(mainWindowTitle);
        mainWindow.append(chatWindow);
        mainWindow.append(messageInput);
        container.append(sideBar);
        container.append(mainWindow);
        screen.append(container);

        // Quit on Escape or Control-C.
        screen.key(["escape", "C-c"], function(ch, key) {
            return process.exit(0);
        });

        // event handlers for focus and blur of inputs
        channelList.on('focus', function() {
            sideBar.style.border = {'fg': '#cc6666'};
            screen.render();
        });
        channelList.on('blur', function() {
            sideBar.style.border = {'fg': '#888'};
            screen.render();
        });
        messageInput.on('focus', function() {
            messageInput.style.border = {'fg': '#cc6666'};
            screen.render();
        });
        messageInput.on('blur', function() {
            messageInput.style.border = {'fg': '#888'};
            screen.render();
        });

        return {
            screen: screen,
            sideBar: sideBar,
            sideBarTitle: sideBarTitle,
            channelList: channelList,
            mainWindow: mainWindow,
            mainWindowTitle: mainWindowTitle,
            chatWindow: chatWindow,
            messageInput: messageInput
        };
    }

};
