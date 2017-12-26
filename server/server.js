const request = require('request')
const express = require('express')
const app = express()
const sanitize = require('sanitize-filename')

const fs = require('fs')

app.get('/', (req, res) => { 
  res.send(
    `Get your oauth token here. <a href='/auth'>Auth me</a> ${process.env.REDIRECT_URI}`)
})

app.get('/auth', (req, res) => {
  scopes = ["client"]
  res.send(`<a href="https://slack.com/oauth/authorize?scope=${scopes.join(' ')}&client_id=${process.env.CLIENT_ID}"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>`)
})

app.get('/textmode', (req, res) => {
  var options = {
    uri: 'https://slack.com/api/oauth.access?code=' + req.query.code +
      `&client_id=${process.env.CLIENT_ID}` +
      `&client_secret=${process.env.CLIENT_SECRET}` +
      `&redirect_uri=${process.env.REDIRECT_URI}`,
      method: 'GET'
    }
  request(options, (err, resp, body) => {
    var JSONResponse = JSON.parse(body)
    if (!JSONResponse.ok) { 
      console.log(JSONResponse)
      res.send("Error encountered. <a href='/auth'>Try again</a>: \n" + JSON.stringify(JSONResponse)).status(200).end()
    } else {
      console.log(JSONResponse)
      res.send("JSON Response success. Your token is " + JSONResponse.access_token + 
        " - Check your server localpath for the config file or JSON. (You can close this window.")
      fs.writeFile(`slack-config.${sanitize(JSONResponse.team_name)}.json`,
        JSON.stringify(JSONResponse), (err) => { 
          if (err) { console.log(`Could not save file: ${err}`) }
        }
      )
    }
  })
  
})

console.log("Local server starting..")
app.listen(8080, () => console.log("Listening on port 8080. Open a browser: http://localhost:8080/"))