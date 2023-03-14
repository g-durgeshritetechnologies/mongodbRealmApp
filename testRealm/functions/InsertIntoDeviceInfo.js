exports = async function (changeEvent) {
    try {
        const fullDocument = changeEvent.fullDocument;
        await deviceData(fullDocument);
    } catch (error) {
        console.log("Some Error in the Try Block: ", JSON.stringify(error));
    }
};

async function deviceData(fulldocument) {
    const deviceInfoCollection = context.services.get("mongodb-atlas").db("production_Cluster0").collection("device_info");

    const devicequery = {
        "deviceId": fulldocument.data.deviceId
    }
    let response = await deviceInfoCollection.findOne(devicequery).then(resultData => {
        if (resultData) {
            let device_data = resultData;
            return device_data;
        } else {
            console.log("No document matches the provided query.");
        }
    }).catch(err => console.error(`Failed to find document: ${err}`));

    // let encryptedpwd = "";
    // await Encrypt(fulldocument.mqttPwd).then(response => {
    //     return encryptedpwd = response;
    // });


    // console.log("Encrypted password", JSON.stringify(encryptedpwd));


}


async function Encrypt(phrase) {
    const crypto = require('crypto');
    // const ENC_KEY = crypto.randomBytes(16).toString('hex');
    // const IV = crypto.randomBytes(8).toString('hex');
    const enc_key = "bf3c199c2470cb477d907b1e0917c17b"; // set random encryption key
    const iv = "5183666c72eec9e4";
    // set random initialisation vector
    // ENC_KEY and IV can be generated as crypto.randomBytes(32).toString('hex');


    let encrypted_key = encrypt(phrase);
    // let original_phrase = decrypt(encrypted_key);

    var encrypt = ((val) => {
        let cipher = crypto.createCipheriv('aes-256-cbc', enc_key, iv);
        let encrypted = cipher.update(val, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    });

    // var decrypt = ((encrypted) => {
    // let decipher = crypto.createDecipheriv('aes-256-cbc', enc_key, iv);
    // let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    // return (decrypted + decipher.final('utf8'));
    // });
    console.log("KEy inside Function", JSON.stringify(encrypted_key));
    return encrypted_key;

}
