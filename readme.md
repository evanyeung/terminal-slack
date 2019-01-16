# Terminal Slack
A terminal interface for Slack.

### Updated: 
```
1. Run the few teams
2. Show notification when someone remove a message
3. Remove message from active channel
```

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
| Move next team | `ctrl` + `n` |
| Move previous team | `ctrl` + `p` |
 
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
	
4. Create your Legacy Slack API token.

	- Go to the [Slack Legacy Tokens](https://api.slack.com/custom-integrations/legacy-tokens) page
	- Click **Generate Token**

5. Install your token on .env.js (rename example.env.js to .env.js)

6. Run the application: 

	```
	node main.js
	```
	
7. Terminal Slack should now launch.

<!-- ## Troubleshooting
 - **Terminal Slack opens for a second but then closes again** -->
