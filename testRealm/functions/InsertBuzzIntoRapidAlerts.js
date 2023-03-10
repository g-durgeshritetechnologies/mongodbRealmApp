'use esversion: 8';

exports = async function (changeEvent) {
    const fullDocument = changeEvent.fullDocument;


    await insertIntoSensorDataTS(fullDocument).then(response => {
        //console.log("Response", JSON.stringify(response));
        //let insertedId = response;
        //insertIntoRapidSos(fullDocument, insertedId)
    });


};

async function insertIntoRapidSos(fullDocument, insertedId) {
    try {
        const rapidsosalert = context.services.get("mongodb-atlas").db("production_Cluster0").collection("rapidSOSAlerts");

        let rapidSosData = {};

        rapidSosData.title = '';
        rapidSosData.deviceId = fullDocument.deviceId;
        rapidSosData.spo2 = fullDocument.data.o;
        rapidSosData.heartrate = fullDocument.data.hr;
        rapidSosData.alertInfo = fullDocument.data.c;
        rapidSosData.isConfirmed = fullDocument.isConfirmed;
        console.log(JSON.stringify(fullDocument));


        let deviceInfo = {};
        let Device_GPGGA = {};
        let deviceCordinates = {};
        let DeviceLatitude = "";
        let DeviceLongitude = "";
        let gpggaData = fullDocument.data.GPGGA;
        Device_GPGGA = await decryptGPGGA(gpggaData);

        if (Device_GPGGA.valid == true) {
            if (Device_GPGGA.loc.geojson && Device_GPGGA.loc.geojson != undefined) {
                DeviceLatitude = Device_GPGGA.loc.geojson.coordinates[1];
                DeviceLongitude = Device_GPGGA.loc.geojson.coordinates[0];
                deviceCordinates = {
                    "latitude": DeviceLatitude,
                    "longitute": DeviceLongitude
                };
            }
        }
        rapidSosData.latitude = deviceCordinates.latitude;
        rapidSosData.longitute = deviceCordinates.longitute;
        rapidSosData.alert = fullDocument.data.a;
        const details = {};
        details.param = "Temperature";
        rapidSosData.details = details;

        await getdeviceInfo(fullDocument.deviceId).then(response => {
            deviceInfo = response;

        });
        const userTokens = {};
        const userInfo = {};
        userTokens.userId = deviceInfo.mappedUsers[0].userId;
        userTokens.notificationTokens = deviceInfo.mappedUsers[0].userNotificationTokens;

        await getUserData(userTokens.userId).then(response => {

            console.log("FirstName & LastName", JSON.stringify(response.firstName), JSON.stringify(response.lastName));
            userTokens.firstname = response.firstName;
            userTokens.lastname = response.lastName;
            console.log("userTokens", JSON.stringify(userTokens))
        });


        rapidSosData.userTokens = userTokens;
        rapidSosData.sensordataid = insertedId;


        rapidsosalert.insertOne(rapidSosData).then(result => {
            console.log(`Successfully inserted item with _id: ${
                result.insertedId
            }`);
            return result.insertedId;
        }).catch(err => {
            console.error(`Failed to insert item: ${err}`);
            return false;
        });
    } catch (error) {
        console.log("Error Occured in Insertion ", error);
    }


}


async function insertIntoSensorDataTS(fullDocument) {
    try {
        const sensorDataCollection = context.services.get("mongodb-atlas").db("production_Cluster0").collection("sensorData");

        let sensorData = {};
        sensorData.timestamp = fullDocument.data.timestamp;
        sensorData.deviceId = fullDocument.data.deviceId;
        sensorData.alert = fullDocument.data.a;
        sensorData.temperature = fullDocument.data.data.t;
        sensorData.humidity = fullDocument.data.data.h;
        sensorData.pressure = fullDocument.data.data.p;
        sensorData.nodeId = fullDocument.nodeId;
        sensorData.spo2 = fullDocument.data.o;
        sensorData.heartrate = fullDocument.data.hr;
        sensorData.gpgga = fullDocument.data.GPGGA;
        sensorData.accel = fullDocument.data.data.ac;
        sensorData.gyro = fullDocument.data.data.gy;
        sensorData.battery = fullDocument.data.b;
        sensorData.version = "";
        let configdata = await getconfigData();
        console.log("Fulldocument",JSON.stringify(fullDocument));
        console.log("Fulldocument => Data",JSON.stringify(fullDocument.data));
        console.log("Fulldocument => A",JSON.stringify(fullDocument.data.a));
        sensorData.alertInfo = [
            {
                "alertName": configdata.AlertBit0Name,
                "alertbitNo": parseInt(fullDocument.data.a[0]),
                "confidence": fullDocument.data.c[0],
                "Level": fullDocument.data.l[0]
            },
            {
                "alertName": configdata.AlertBit1Name,
                "alertbitNo": parseInt(fullDocument.data.a[1]),
                "confidence": fullDocument.data.c[1],
                "Level": fullDocument.data.l[1]
            },
            {
                "alertName": configdata.AlertBit2Name,
                "alertbitNo": parseInt(fullDocument.data.a[2]),
                "confidence": fullDocument.data.c[2],
                "Level": fullDocument.data.l[2]
            },
            {
                "alertName": configdata.AlertBit3Name,
                "alertbitNo": parseInt(fullDocument.data.a[3]),
                "confidence": fullDocument.data.c[3],
                "Level": fullDocument.data.l[3]
            },
            {
                "alertName": configdata.AlertBit4Name,
                "alertbitNo": parseInt(fullDocument.data.a[4]),
                "confidence": fullDocument.data.c[4],
                "Level": fullDocument.data.l[4]
            }, {
                "alertName": configdata.AlertBit5Name,
                "alertbitNo": parseInt(fullDocument.data.a[5]),
                "confidence": fullDocument.data.c[5],
                "Level": fullDocument.data.l[5]
            }, {
                "alertName": configdata.AlertBit6Name,
                "alertbitNo": parseInt(fullDocument.data.a[6]),
                "confidence": fullDocument.data.c[6],
                "Level": fullDocument.data.l[6]
            }, {
                "alertName": configdata.AlertBit7Name,
                "alertbitNo": parseInt(fullDocument.data.a[7]),
                "confidence": fullDocument.data.c[7],
                "Level": fullDocument.data.l[7]
            }
        ];

        console.log("Data", JSON.stringify(sensorData));

        await sensorDataCollection.insertOne(sensorData).then(result => {
            console.log(`Successfully inserted item with _id: ${
                result.insertedId
            }`);
            return result.insertedId;
        }).catch(err => {
            console.error(`Failed to insert item: ${err}`);
            return false;
        });
    } catch (error) {
        console.log("Error Occured in Insertion ", error);
    }
}

async function getconfigData() {
    const configCollection = context.services.get("mongodb-atlas").db("production_Cluster0").collection("default_configurations");

    const configquery = {}
    var response =  await configCollection.findOne(configquery).then(resultData => {
        if (resultData) {
            let config_data = resultData;
            return config_data;
        } else {
            console.log("No document matches the provided query.");
        }
    }).catch(err => console.error(`Failed to find document: ${err}`));
    return response;
}

async function decryptGPGGA(gpgga) {
    try {
        console.log(JSON.stringify(gpgga));
        const nmea = require('@drivetech/node-nmea');
        gpgga = gpgga.replace(/\r\n/g, '');
        let data = nmea.parse(gpgga);
        if (data.valid === false) {
            gpgga = gpgga.split(",");
            gpgga.splice(gpgga.length - 2, 0, "M");
            gpgga = gpgga.join();
            gpgga = gpgga.replace(/\s/g, '');
            console.log("Converted gpgga string is -" + JSON.stringify(gpgga));
            data = nmea.parse(gpgga);
        }
        return data;
    } catch (error) {
        console.log("Getting an error---------------------", error);
    }
}


async function getUserData(userId) {

    if (userId) {
        const userCollection = context.services.get("mongodb-atlas").db("production_Cluster0").collection("users");

        const userquery = {
            "_id": userId
        }

        var response = await userCollection.findOne(userquery).then(resultData => {
            if (resultData) {
                let user_data = resultData;
                console.log("User Data from Users", user_data);
                return user_data;
            } else {
                console.log("No document matches the provided query.");
            }

        }).catch(err => console.error(`Failed to find document: ${err}`));

    }
    return response;
}

async function getdeviceInfo(deviceIdData) {
    const deviceCollection = context.services.get("mongodb-atlas").db("production_Cluster0").collection("device_info");
    const query = {
        "deviceId": deviceIdData
    };

    var device_id_data;
    var res = await deviceCollection.findOne(query).then(result => {
        if (result) {
            device_id_data = result;

            return device_id_data;
        } else {
            console.log("No document matches the provided query.");
        }

    }).catch(err => console.error(`Failed to find document: ${err}`));
    return res;
}
