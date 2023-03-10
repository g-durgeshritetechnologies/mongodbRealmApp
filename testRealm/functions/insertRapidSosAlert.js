'use esversion: 8';

exports = async function (changeEvent) {
    const fullDocument = changeEvent.fullDocument;
     await insertIntoSensorDataTS(fullDocument)
};

async function insertIntoRapidSos(fullDocument, insertedId) {
    try {
        const rapidsosalert = context.services.get("mongodb-atlas").db("production_Cluster0").collection("rapidSOSAlerts");
        let rapidSosData = {};


        titles = [
            "CapSense",
            "HeartRate",
            "AmbientTemp",
            "AccelerometerFallDetection",
            "InferenceFallDetection",
            "GeoFence",
            "MahiFence",
            "AlertSOS"
        ]
        let titleArray = [];
        let bits = fullDocument.data.a;
        const bitsSplit = bits.split("");
        for (let i = 0; i <= bitsSplit.length; i++) {
            if (bitsSplit[i] == 1) {
                titleArray.push(titles[i]);
            }
        }
        rapidSosData.title = titleArray.join();

        rapidSosData.version = "";
        rapidSosData.createdAt = new Date();
        let deviceInfo = {};
        let Device_GPGGA = {};
        let deviceCordinates = {};
        let DeviceLatitude = "";
        let DeviceLongitude = "";
        let gpggaData = fullDocument.data.GPGGA;
        await decryptGPGGA(gpggaData).then(response => {
            return Device_GPGGA = response;
        });

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
        rapidSosData.spo2 = fullDocument.data.o;
        rapidSosData.heartrate = fullDocument.data.hr;
        let configdata = await getconfigData();
        rapidSosData.details = [
            {
                "param": configdata.AlertBit0Name,
                "value": parseInt(fullDocument.data.a[0]),
                "type": (fullDocument.data.a[0] == 1 ? "High" : "Low"),
                "message": (fullDocument.data.a[0] == 1 ? "CapSense is High" : "CapSense is Low"),
                "level": fullDocument.data.l[0],
                "color": (fullDocument.data.l[0] == 1 ? "yellow" : (fullDocument.data.l[0] == 2 ? "orange" : (fullDocument.data.l[0] == 3 ? "red" : ""))),
                "wearerThreshold": "",
                "confidence": fullDocument.data.c[0]
            },
            {
                "param": configdata.AlertBit1Name,
                "value": parseInt(fullDocument.data.a[1]),
                "type": (fullDocument.data.a[1] == 1 ? "High" : "Low"),
                "message": (fullDocument.data.a[1] == 1 ? "Heart Rate is High" : "Heart Rate is Low"),
                "level": fullDocument.data.l[1],
                "color": (fullDocument.data.l[1] == 1 ? "yellow" : (fullDocument.data.l[1] == 2 ? "orange" : (fullDocument.data.l[1] == 3 ? "red" : ""))),
                "wearerThreshold": "",
                "confidence": fullDocument.data.c[1]
            },
            {
                "param": configdata.AlertBit2Name,
                "value": parseInt(fullDocument.data.a[2]),
                "type": (fullDocument.data.a[2] == 1 ? "High" : "Low"),
                "message": (fullDocument.data.a[2] == 1 ? "AmbientTemp is High" : "AmbientTemp is Low"),
                "level": fullDocument.data.l[2],
                "color": (fullDocument.data.l[2] == 1 ? "yellow" : (fullDocument.data.l[2] == 2 ? "orange" : (fullDocument.data.l[2] == 3 ? "red" : ""))),
                "wearerThreshold": "",
                "confidence": fullDocument.data.c[2]
            },
            {
                "param": configdata.AlertBit3Name,
                "value": parseInt(fullDocument.data.a[3]),
                "type": (fullDocument.data.a[3] == 1 ? "High" : "Low"),
                "message": (fullDocument.data.a[3] == 1 ? "AccelerometerFallDetection is High" : "AccelerometerFallDetection is Low"),
                "level": fullDocument.data.l[3],
                "color": (fullDocument.data.l[3] == 1 ? "yellow" : (fullDocument.data.l[3] == 2 ? "orange" : (fullDocument.data.l[3] == 3 ? "red" : ""))),
                "wearerThreshold": "",
                "confidence": fullDocument.data.c[3]
            }, {
                "param": configdata.AlertBit4Name,
                "value": parseInt(fullDocument.data.a[4]),
                "type": (fullDocument.data.a[4] == 1 ? "High" : "Low"),
                "message": (fullDocument.data.a[4] == 1 ? "InferenceFallDetection is High" : "InferenceFallDetection is Low"),
                "level": fullDocument.data.l[4],
                "color": (fullDocument.data.l[4] == 1 ? "yellow" : (fullDocument.data.l[4] == 2 ? "orange" : (fullDocument.data.l[4] == 3 ? "red" : ""))),
                "wearerThreshold": "",
                "confidence": fullDocument.data.c[4]
            }, {
                "param": configdata.AlertBit5Name,
                "value": parseInt(fullDocument.data.a[5]),
                "type": (fullDocument.data.a[5] == 1 ? "High" : "Low"),
                "message": (fullDocument.data.a[5] == 1 ? "GeoFence is High" : "GeoFence is Low"),
                "level": fullDocument.data.l[5],
                "color": (fullDocument.data.l[5] == 1 ? "yellow" : (fullDocument.data.l[5] == 2 ? "orange" : (fullDocument.data.l[5] == 3 ? "red" : ""))),
                "wearerThreshold": "",
                "confidence": fullDocument.data.c[5]
            }, {
                "param": configdata.AlertBit6Name,
                "value": parseInt(fullDocument.data.a[6]),
                "type": (fullDocument.data.a[6] == 1 ? "High" : "Low"),
                "message": (fullDocument.data.a[6] == 1 ? "MahiFence is High" : "MahiFence is Low"),
                "level": fullDocument.data.l[6],
                "color": (fullDocument.data.l[6] == 1 ? "yellow" : (fullDocument.data.l[6] == 2 ? "orange" : (fullDocument.data.l[6] == 3 ? "red" : ""))),
                "wearerThreshold": "",
                "confidence": fullDocument.data.c[6]
            }, {
                "param": configdata.AlertBit7Name,
                "value": parseInt(fullDocument.data.a[7]),
                "type": (fullDocument.data.a[7] == 1 ? "High" : "Low"),
                "message": (fullDocument.data.a[7] == 1 ? "AlertSOS is High" : "AlertSOS is Low"),
                "level": fullDocument.data.l[7],
                "color": (fullDocument.data.l[7] == 1 ? "yellow" : (fullDocument.data.l[7] == 2 ? "orange" : (fullDocument.data.l[7] == 3 ? "red" : ""))),
                "wearerThreshold": "",
                "confidence": fullDocument.data.c[7]
            }
        ];
        await getdeviceInfo(fullDocument.data.deviceId).then(response => {
            deviceInfo = response;
        });
        const userTokens = {};
        userTokens.userId = deviceInfo.mappedUsers[0].userId;
        userTokens.notificationTokens = deviceInfo.mappedUsers[0].userNotificationTokens;
        await getUserData(userTokens.userId).then(response => {
            userTokens.firstname = response.firstName;
            userTokens.lastname = response.lastName;
        });
        rapidSosData.userTokens = userTokens;
        rapidSosData.sensordataid = insertedId;
        rapidSosData.deviceId = fullDocument.data.deviceId;
        let object = {};
        object = deviceInfo.wearer.filter(element => {
            let active = element.isActive == true;
            return active;
        });
        rapidSosData.wearerId = object[0]._id;
        rapidSosData.wearerFirstName = object[0].firstName;
        rapidSosData.wearerLastName = object[0].lastName;
        rapidSosData.isConfirmed = fullDocument.data.isConfirmed;
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
        console.log("Some Error : ", JSON.stringify(error));
    }
}


async function insertIntoSensorDataTS(fullDocument) {
    try {
        const sensorDataCollection = context.services.get("mongodb-atlas").db("production_Cluster0").collection("sensorData");

        let sensorData = {};
        let configdata = {};
        

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

        await getconfigData().then(response => {
            return configdata = response;
        });
        sensorData.alertInfo = [
            {
                "param": configdata.AlertBit0Name,
                "alertbitNo": parseInt(fullDocument.data.a[0]),
                "confidence": fullDocument.data.c[0],
                "Level": fullDocument.data.l[0]
            },
            {
                "param": configdata.AlertBit1Name,
                "alertbitNo": parseInt(fullDocument.data.a[1]),
                "confidence": fullDocument.data.c[1],
                "Level": fullDocument.data.l[1]
            },
            {
                "param": configdata.AlertBit2Name,
                "alertbitNo": parseInt(fullDocument.data.a[2]),
                "confidence": fullDocument.data.c[2],
                "Level": fullDocument.data.l[2]
            },
            {
                "param": configdata.AlertBit3Name,
                "alertbitNo": parseInt(fullDocument.data.a[3]),
                "confidence": fullDocument.data.c[3],
                "Level": fullDocument.data.l[3]
            }, {
                "param": configdata.AlertBit4Name,
                "alertbitNo": parseInt(fullDocument.data.a[4]),
                "confidence": fullDocument.data.c[4],
                "Level": fullDocument.data.l[4]
            }, {
                "param": configdata.AlertBit5Name,
                "alertbitNo": parseInt(fullDocument.data.a[5]),
                "confidence": fullDocument.data.c[5],
                "Level": fullDocument.data.l[5]
            }, {
                "param": configdata.AlertBit6Name,
                "alertbitNo": parseInt(fullDocument.data.a[6]),
                "confidence": fullDocument.data.c[6],
                "Level": fullDocument.data.l[6]
            }, {
                "param": configdata.AlertBit7Name,
                "alertbitNo": parseInt(fullDocument.data.a[7]),
                "confidence": fullDocument.data.c[7],
                "Level": fullDocument.data.l[7]
            }
        ];

        await sensorDataCollection.insertOne(sensorData).then(result => {
            console.log(`Successfully inserted item with _id: ${
                result.insertedId
            }`);
            do {
                if (result.insertedId) {
                    insertIntoRapidSos(fullDocument, result.insertedId)
                }
            } while (result.insertedId == "");
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
    var response = await configCollection.findOne(configquery).then(resultData => {
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

        const nmea = require('@drivetech/node-nmea');
        gpgga = gpgga.replace(/\r\n/g, '');
        let data = nmea.parse(gpgga);
        if (data.valid === false) {
            gpgga = gpgga.split(",");
            gpgga.splice(gpgga.length - 2, 0, "M");
            gpgga = gpgga.join();
            gpgga = gpgga.replace(/\s/g, '');
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
