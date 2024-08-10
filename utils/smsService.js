// const sendSMS = async (phoneNumber, message) => {
//   try {
//     const result = await client.messages.create({
//       from: '+15075650771',
//       to: phoneNumber,
//       body: message
//     });
//     console.log('SMS sent successfully:', result.sid);
//   } catch (error) {
//     console.error('Error sending SMS:', error);
//   }
// };



// require('dotenv').config(); 

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require('twilio')(accountSid, authToken);

// client.messages
//   .create({
//     from: '+15075650771',
//     to: '+237670727061',
//     body: 'Hello, this is a test message!'
//   })
//   .then(message => console.log(message.sid))
//   .catch(error => console.error(error));





  require('dotenv').config();

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);
  
  const sendSMS = async (phoneNumber, confirmationCode) => {
    try {
      const message = await client.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: "+237670727061", 
        body: `Your order confirmation code is: ${confirmationCode}`
      });
      console.log(`SMS sent successfully. SID: ${message.sid}`);
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  };
  
  module.exports = sendSMS;

