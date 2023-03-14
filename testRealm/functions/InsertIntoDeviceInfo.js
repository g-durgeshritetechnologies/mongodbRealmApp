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
    let responsedocument = await deviceInfoCollection.findOne(devicequery).then(resultData => {
        if (resultData) {
            let device_data = resultData;
            return device_data;
        } else {
            console.log("No document matches the provided query.");
        }
    }).catch(err => console.error(`Failed to find document: ${err}`));


    let encryptedpwd = "";

    await Encrypt(fulldocument.data.mqttPwd).then(response => {

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

    const updatequery = context.services.get("mongodb-atlas").db("production_Cluster0").collection("device_info");

    let updatedatabase = await updatequery.updateOne(devicequery, updateDoc, options).then(resultData => {
        if (resultData) {
            let data = resultData;
            return data;
        } else {
            console.log("No document matches the provided query.");
        }
    }).catch(err => console.error(`Failed to find document: ${err}`));


    let versionarray = [];
    versionarray = responsedocument.configuration.versionSettings;
    console.log("Array", JSON.stringify(versionarray));

    let vinfoarray = [];
    vinfoarray = fulldocument.data.vinfo;
    console.log("Array Vinfo", JSON.stringify(vinfoarray));

    for (let i = 0; i < vinfoarray.length; i++) {
        for (let j = 0; j < versionarray.length; j++) {
            if (vinfoarray[i].p == versionarray[j].param) {
                
            } else {
                let obj = {}
                obj.param = vinfoarray[i].p;
                obj.value = vinfoarray[i].v;
                versionarray.push(obj);
            }
        }
    }
    const arrayupdate = {
        $set: {
            "configuration.versionSettings": versionarray
        }
    };

    let versionupdated = await updatequery.updateOne(devicequery, arrayupdate, options).then(resultData => {
        if (resultData) {
            let arraydata = resultData;
            return arraydata;
        } else {
            console.log("No document matches the provided query.");
        }
    }).catch(err => console.error(`Failed to find document: ${err}`));

    console.log("Updated Array", JSON.stringify(versionarray));

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
