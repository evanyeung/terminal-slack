Terminal Slack
==============

A terminal interface for Slack.

## Controls
 - Ctrl-c - select channels list
    - Use the arrow keys (or j/k) and enter to select a channel
    - Use '/' to search for a channel (enter to submit search)
 - Ctrl-u - select users list
    - Use the arrow keys (or j/k) and enter to select a channel
    - Use '/' to search for a user (enter to submit search)
 - Ctrl-w - select writing area
    - Use enter to send a message
 - Ctrl-l - select message list
    - Use the arrow keys to scroll
 - Escape - exit
 
## Setup

Download and enter the directory with 

 `$ git clone https://github.com/evanyeung/terminal-slack.git && cd terminal-slack`
 
Make sure you have node and npm installed (can be installed from https://nodejs.org/). Note: This project requires Node *v6.0.0 or higher*.

 `$ node -v`
 
Install Dependencies

 `$ npm install`

To connect to Slack, the app uses a legacy Slack API token. 

Get your Token in https://api.slack.com/custom-integrations/legacy-tokens and must be added to your environment variables. To do this, copy it and run the command: 

 `$ export SLACK_TOKEN='[your token here]'` 
 
Run the app 

 `$ node main.js`.

![Alt text](screen-shot.png?raw=true "Terminal Slack")
