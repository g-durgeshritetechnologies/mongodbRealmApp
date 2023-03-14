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
    console.log("Response Data", JSON.stringify(response));

    let encryptedpwd = "";
    console.log("PWD", JSON.stringify(fulldocument.data.mqttPwd))
    await Encrypt(fulldocument.data.mqttPwd).then(response => {
        console.log("REsponse", JSON.stringify(response));
        return encryptedpwd = response;
    });

    const options = {
        "upsert": true
    };

    const updateDoc = {
        $set: {
            "configuration.mqttPwd": encryptedpwd
        }
    };
    console.log("CODE REACHED HERE 2 ");
    const updatequery = context.services.get("mongodb-atlas").db("production_Cluster0").collection("device_info");

    let updatedatabase = await updatequery.updateOne(devicequery, updateDoc, options).then(resultData => {
        if (resultData) {
            return resultData
        } else {
            console.log("No document matches the provided query.");
        }
    }).catch(err => console.error(`Failed to find document: ${err}`));


    let versionarray = response.configurations.versionSettings;
    console.log("Array", JSON.stringify(versionarray));


}

async function Encrypt(phrase) {
    const crypto = require('crypto');
    const enc_key = "bf3c199c2470cb477d907b1e0917c17b";
    const iv = "5183666c72eec9e4";
    let cipher = crypto.createCipheriv('aes-256-cbc', enc_key, iv);
    let encrypted = cipher.update(phrase, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    console.log("KEy inside Function", JSON.stringify(encrypted));
    return encrypted;
}
