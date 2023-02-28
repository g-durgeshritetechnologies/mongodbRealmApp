exports = function(deviceTokens, alert, payload) {
    var apn = require('apn');
    var options = {
        token: {
            cert: "./secret/keyProduction.pem",
            key: "./secret/AuthKey_VJ5854JA3K.p8",
            keyId: "VJ5854JA3K",
            teamId: "L4Y73Q83KU"
        },
        production: true
    };


    var apnProvider = new apn.Provider(options);

    var note = new apn.Notification();

    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = 3;
    note.sound = "ping.aiff";
    note.alert = alert;
    note.payload = payload,
        note.topic = process.env.APNS_TOPIC;
    let result = apnProvider.send(note, deviceTokens);
    console.log(result)
    return result;
};