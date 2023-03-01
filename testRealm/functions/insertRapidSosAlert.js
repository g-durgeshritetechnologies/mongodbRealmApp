exports = async function(changeEvent) {
    const fullDocument = changeEvent.fullDocument;
    let id;
    await insertIntoSensorDataTS(fullDocument).then(response => {
        id = response
    });
    // await insertIntoRapidSos(fullDocument, id).then(response => {
    //     logres = response
    // });
    // console.log(JSON.stringify(logres));

};

async function insertIntoRapidSos(fullDocument, insertedId) {
    try {
        const rapidsosalert = context.services.get("mongodb-atlas").db("production_Cluster0").collection("rapidSOSAlerts ");


        const rapidSosData = {}

        rapidSosData.title = '';

        rapidSosData.deviceId = fullDocument.deviceId;
        rapidSosData.spo2 = fullDocument.data.o;
        rapidSosData.heartrate = fullDocument.data.hr;
        rapidSosData.alertInfo = fullDocument.data.c;
        rapidSosData.isConfirmed = fullDocument.isConfirmed;

        let Device_GPGGA = {};
        let deviceCordinates = {};
        let DeviceLatitud = "";
        let DeviceLongitud = "";
        Device_GPGGA = await ptGPGGA(fullDocument.gpgga);

        if (Device_GPGGA.valid == true) {
            if (Device_GPGGA.loc.geojson && Device_GPGGA.loc.geojson != undefined) {
                DeviceLatitud = Device_GPGGA.loc.geojson.coordinates[1];
                DeviceLongitud = Device_GPGGA.loc.geojson.coordinates[0];
                deviceCordinates = {
                    "latitude": DeviceLatitud,
                    "longitute": DeviceLongitud
                }
            }
        }
        rapidSosData.latitude = Device_GPGGA.deviceCordinates.latitude;
        rapidSosData.longitute = Device_GPGGA.deviceCordinates.longitute;
        rapidSosData.alert = fullDocument.data.a;


        const details = {};
        details.param = "Temperature"
        rapidSosData.details = details;

        await rapidsosalert.insertOne(fullDocument).then(result => {
            console.log(`Successfully inserted item with _id: ${
            result.insertedId
        }`);
            return result.insertedId;
        }).catch(err => {
            console.error(`Failed to insert item: ${err}`);
            return false;
        })
    } catch (error) {
        console.log("Error Occured in Insertion ", error)
    }


    deviceInfo = await getdeviceInfo(fullDocument.deviceId);

    const userTokens = {}
    userTokens.userId = deviceInfo.mappedUsers[0].userId;
    userTokens.notificationTokens = deviceInfo.mappedUsers[0].userNotificationTokens;

    userInfo = await getUserData(userId)
    userTokens.firstname = userInfo.firstName;
    userTokens.lastname = userInfo.lastName

    rapidSosData.userTokens = userTokens;
    rapidSosData.sensordataid = insertedId;


    await rapidsosalert.insertOne(rapidSosData).then(result => {
        console.log(`Successfully inserted item with _id: ${
            result.insertedId
        }`);
        return result.insertedId;
    }).catch(err => {
        console.error(`Failed to insert item: ${err}`);
        return false;
    });

}


async function insertIntoSensorDataTS(fullDocument) {
    try {
        const rapidsosalert = context.services.get("mongodb-atlas").db("production_Cluster0").collection("sensorData ");

        let sensorData = {}

        sensorData.timestamp = fullDocument.time;
        sensorData.deviceId = fullDocument.deviceId;
        sensorData.version = '';
        sensorData.pressure = fullDocument.data.p;
        sensorData.heartrate = fullDocument.data.hr;
        sensorData.gpgga = fullDocument.data.GPGGA;
        sensorData.spo2 = fullDocument.data.o;
        sensorData.alert = fullDocument.data.a;
        sensorData.humidity = fullDocument.data.h;
        sensorData.temp = fullDocument.data.t;
        sensorData.batt = fullDocument.data.b;
        sensorData.accel = fullDocument.data.ac;
        sensorData.gyro = fullDocument.data.g;
        sensorData.alertInfo = fullDocument.data.c;
        sensorData.nodeId - '';
        

        await rapidsosalert.insertOne(sensorData).then(result => {
            console.log(`Successfully inserted item with _id: ${
            result.insertedId
        }`);
            return result.insertedId;
        }).catch(err => {
            console.error(`Failed to insert item: ${err}`);
            return false;
        })
    } catch (error) {
        console.log("Error Occured in Insertion ", error)
    }

}

async function decryptGPGGA(gpgga) {
    try {
        const nmea = require('@drivetech/node-nmea')
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

        var response = await userCollection.find(userquery)
            .toArray()
            .then(resultData => {
                if (resultData) {
                    user_data = resultData
                    return user_data;
                } else {
                    console.log("No document matches the provided query.");
                }

            })
            .catch(err => console.error(`Failed to find document: ${err}`));

    }
    return response;
}

async function getdeviceInfo(deviceIdData) {
    const deviceCollection = context.services.get("mongodb-atlas").db("production_Cluster0").collection("device_info");
    const query = {
        "_id": deviceIdData
    };

    var device_id_data;
    var res = await deviceCollection.findOne(query)
        .then(result => {
            if (result) {
                device_id_data = result;
                return device_id_data;
            } else {
                console.log("No document matches the provided query.");
            }
            return device_id_data;
        })
        .catch(err => console.error(`Failed to find document: ${err}`));
    return res;
}