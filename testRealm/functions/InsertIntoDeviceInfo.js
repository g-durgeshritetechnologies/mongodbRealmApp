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
    let encryptedpwd = "";
    const devicequery = {
        "deviceId": fulldocument.data.deviceId
    }
    console.log("CODE REACHED HERE 1 ");
    let response = await deviceInfoCollection.filter(devicequery).then(resultData => {
        if (resultData) {
            let device_data = resultData;
            console.log("DEVICE DATA", JSON.stringify(device_data));
            return device_data;
        } else {
            console.log("No document matches the provided query.");
        }
    }).catch(err => console.error(`Failed to find document: ${err}`));
    console.log("Response Data", JSON.stringify(response));


    await Encrypt(fulldocument.data.mqttPwd).then(response => {
        return encryptedpwd = response;
    });
    console.log("PWD", JSON.stringify(encryptedpwd));
    const options = {
        "upsert": true
    };

    const updateDoc = {
        $set: {
            "mqttPwd": encryptedpwd
        }
    };
    console.log("CODE REACHED HERE 2 ");
    const updatequery = context.services.get("mongodb-atlas").db("production_Cluster0").collection("device_info").updateOne(devicequery, updateDoc, options);


}

async function Encrypt(phrase) {
    const crypto = require('crypto');
    const enc_key = "bf3c199c2470cb477d907b1e0917c17b";
    const iv = "5183666c72eec9e4";
    let cipher = crypto.createCipheriv('aes-256-cbc', enc_key, iv);
    let encrypted = cipher.update(phrase, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}
