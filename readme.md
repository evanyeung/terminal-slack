# Terminal Slack
A terminal interface for Slack.

![Screenshot of Termianl Slack](screen-shot.png)

## Controls
| Command | Key Combination |
| ------- | --------------- |
| Move up | `up arrow` or `k` |
| Down up | `down arrow` or `j` |
| Search | `/` |
| Exit | `esc` |
| Select channels list | `ctrl` + `c` |
| Select users list | `ctrl` + `u` |
| Select writing area | `ctrl` + `w` |
| Select message list | `ctrl` + `l` |
 
## Prerequsites
 - [Node](https://nodejs.org/en/) v6.0.0 or higher
 - A [Slack](https://slack.com/) Account

## Setup
1. Download this repository:

	```
	git clone https://github.com/evanyeung/terminal-slack.git
	```

2. Enter the directory:

	```
	cd terminal-slack
	```

3. Install the package:

	```
	npm install
	```
	
4. Create your Slack OAUth token. You'll need to make an app to hand out this token since you shouldn't trust anyone on the internet to generate one:

  - Make yourself a new slack app at https://api.slack.com/apps call it something like 'my textmode'
  - Set redirect url: `http://localhost:8080/textmode`
  - Set scope: `channels:history` (doesn't actually matter, but needs at least one)
  - Save the *client ID*, and *client secret*
  - Add the slack app to your (a) workspace.
	- Install and run the local server replacing values as saved above:
	```
	  cd server
	  npm install
	  CLIENT_ID=your-client-id CLIENT_SECRET=your-client-scret REDIRECT_URI=http://localhost:8080/textmode node server.js
  ```
	- Open http://localhost:8080/auth
	- Follow the link, auth to slack.
	- Your token is now pasted to screen and saved in ./slack-config.{workspace}.json
  - On success, close browser window .
	- Stop the server (ctrl-c)
	- `cp slack-config.{workspace}.json ../config.json`
	- Done! 

5. Run the application: 

	```
	node main.js
	```
	
7. Terminal Slack should now launch.

## Troubleshooting
 - **Terminal Slack opens for a second but then closes again**

 	Make sure you have a fresh token by following oauth instructions above.