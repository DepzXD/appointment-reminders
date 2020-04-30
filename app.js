const express = require('express')
const bodyParser = require('body-parser')
const Twilio = require('twilio')
var cron = require('node-cron')

require('dotenv').config()

const app = express()
let items = []

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', function (req, res) {
  res.render('index', { newItems: items })
})

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhoneNumber = process.env.TWILIO_NUMBER
const client = new Twilio(accountSid, authToken)

// Use this method to send sms
function sendNotifications(item) {
  const options = {
    body: `${item.message}`,
    from: `${twilioPhoneNumber}`,
    to: `${item.number}`
  }
  client.messages
    .create(options, function (err, response) {
      if (err) {
        console.error(err)
      } else {
        console.log(`Message sent to ${item.number}`)
      }
    })

}
// use this method for Callling 
function sendCalls(item) {
  const options = {
    twiml: `<Response><Say>${items.message}</Say></Response>`,
    from: `${twilioPhoneNumber}`,
    to: `${item.number}`
  }
  client.calls
    .create(options, function (err, response) {
      if (err) {
        console.error(err)
      } else {
        console.log(`call sent to ${item.number}`)
      }
    })

}

cron.schedule('* * * * * *', () => {
  if (items.length != 0) {
    let date = new Date().toLocaleString('en-US')

    for (let i = 0; i < items.length; i++) {
      let dateTime = new Date(items[i].dateTime).toLocaleString('en-US')
      if (date == dateTime) {
        sendNotifications(items[i])
        // sendCalls(items[i])
        items.splice(i, 1)
      }
    }
  }
})


app.post('/', function (req, res) {
  let item = {
    message: req.body.message,
    number: req.body.number,
    dateTime: req.body.dateTime
  }

  items.push(item)
  res.redirect('/')

})
app.listen(3000, () => console.log('listening on port 3000'))