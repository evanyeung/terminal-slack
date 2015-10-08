Terminal Slack
==============

A terminal interface for Slack.

##Controls
 - Ctrl-c - select channels list
    - Use the arrow keys and enter to select a channel
 - Ctrl-w - select writing area
    - Use enter to send a message
 - Ctrl-l - select message list
    - Use the arrow keys to scroll
 - Escape - exit
 
##Setup
This app is built on Node, which can be installed from https://nodejs.org/. It uses the Slack API token which can be found at https://api.slack.com/web and must be added to your environment variables. To do this, copy it and run the command `$export SLACK_TOKEN='[your token here]'` (or add it to your environment variables in an equivalent fashion). Run the app with `$node main.js`.

![Alt text](screen-shot.png?raw=true "Terminal Slack")
