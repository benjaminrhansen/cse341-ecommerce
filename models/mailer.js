const mailgun = require("mailgun-js");
const DOMAIN = "sandbox7fcf8e2e9a38462d889f7778d04ec215.mailgun.org";
const mg = mailgun({apiKey: process.env.MAILER_API_KEY, domain: DOMAIN});

// You can see a record of this email in your logs: https://app.mailgun.com/app/logs.

// You can send up to 300 emails/day from this sandbox server.
// Next, you should add your own domain so you can send 10000 emails/month for free.

exports.send = (options) => {
    options.from = process.env.MAILER_SERVER_FROM;
    mg.messages().send(options, function (error, body) {
        if (error) {
            console.log(error);
            if (error.statusCode === 400) {
                console.log("Email is probably not on authorized recipient list");
            }
        }
        console.log(body);
    });
}