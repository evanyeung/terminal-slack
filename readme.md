# Terminal Slack

A terminal interface for Slack.

![Screenshot of Termianl Slack](screen-shot.png)

## Controls

| Command              | Key Combination     |
| -------------------- | ------------------- |
| Move up              | `up arrow` or `k`   |
| Down up              | `down arrow` or `j` |
| Search               | `/`                 |
| Exit                 | `esc`               |
| Select channels list | `ctrl` + `c`        |
| Select users list    | `ctrl` + `u`        |
| Select writing area  | `ctrl` + `w`        |
| Select message list  | `ctrl` + `l`        |

## Prerequsites

- [Node](https://nodejs.org/en/) v6.0.0 or higher
- A [Slack](https://slack.com/) Account

## Setup

1.  Download this repository:

    ```
    git clone https://github.com/evanyeung/terminal-slack.git
    ```

2.  Enter the directory:

    ```
    cd terminal-slack
    ```

3.  Install the package:

    ```
    npm install
    ```

4.  Create your Legacy Slack API token.

    - Go to the [Slack Legacy Tokens](https://api.slack.com/custom-integrations/legacy-tokens) page
    - Click **Generate Token**

5.  Create a `.env` file (see example at .exenv) and insert the following:

    ```
    SLACK_TOKEN='your-slack-token-here'
    ```

6.  Run the application:

    ```
    npm start
    ```

7.  Terminal Slack should now launch.

## Troubleshooting

- **Terminal Slack opens for a second but then closes again**

  ````
  	This might be due to your `SLACK_TOKEN` not being recognised. Make sure the put your `SLACK_TOKEN`
    inside the `.env` file you created eariler for this very purpose.

  	```
  	SLACK_TOKEN='xoxp-254112160503-252950188691-252375361712-6cbf56aada30951a9d310a5f23d032a0'
  	```
  ````
