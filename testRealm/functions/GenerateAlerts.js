//changestream service
exports = async function(changeEvent) {
    var DataWearer;
    var apn = require('apn');
    const fullDocument = changeEvent.fullDocument;
    let enteredTime = new Date();
    let ehours = enteredTime.getHours();
    let eminutes = enteredTime.getMinutes();
    let eseconds = enteredTime.getSeconds();
    let emilliseconds = enteredTime.getMilliseconds();

    console.log(`Entered date and time: ${enteredTime.toLocaleDateString()} ${ehours}:${eminutes}:${eseconds}:${emilliseconds}`);

    //console.log("Entered Time at : " + enteredTime); //Date Log

    if (fullDocument === undefined) {
        console.log("No data available....");
        return;
    } else {
        console.log("Full Document Inserted in Mongo is : " + JSON.stringify(fullDocument))
        let deviceToken = [];
        let buff = new Buffer(fullDocument.data, 'base64');
        let text = buff.toString('ascii');
       // console.log(JSON.parse(text));
        const deviceData = JSON.parse(text);
       // console.log(deviceData.report_name)
        if (deviceData.report_name) {
            var Alert = deviceData.reports[0][deviceData.report_name].Alert ? deviceData.reports[0][deviceData.report_name].Alert : ""; // "01111111";


            if (Alert) {

            } else {
                Alert = deviceData.reports[0][deviceData.report_name].alert ? deviceData.reports[0][deviceData.report_name].alert : "";
            }

            if (Alert == "") {
                Alert = "00000000";
            }
            const HeartRate_Alert = Alert.charAt(1);
            const AmbientTemp_Alert = Alert.charAt(2);
            const AccelFallDetect_Alert = Alert.charAt(3);
            const nonoEdgeFallAnomaly_Alert = Alert.charAt(4);
            const GeoFence_Alert = Alert.charAt(5);
            const deviceID = deviceData.device_id;
            //console.log("DEVICE_ID :", deviceID);

            var deviceIdData;
            var userData;
            var wearerData;
            await getDevicedata(deviceID).then(res => {
                deviceIdData = res
            });
            //console.log("After getDevicedata Response is : ", JSON.stringify(deviceIdData));
            await getUserData(deviceIdData).then(response => {
                userData = response
            });
            //console.log("After getUserData Response is : ", JSON.stringify(userData));
            await getWearerData(deviceIdData).then(response => {
                wearerData = response
                DataWearer = response
            });
            //console.log("After getWearerData Response is : ", JSON.stringify(wearerData));

            for (const uData of userData) {
                console.log(JSON.stringify(uData));
                if (uData.device_token) {
                    if (uData.device_token != '') {
                        deviceToken.push({
                            "token": uData.device_token,
                        });
                    }
                }
            }

            //console.log("DEVICE_TOKEN :" + JSON.stringify(deviceToken));
            const GPGGA_STRING = deviceData.reports[0][deviceData.report_name].GPGGA ? deviceData.reports[0][deviceData.report_name].GPGGA : "";
            let Device_GPGGA = {};
            let alertObj = {};
            let notificationBody = {};
            let payload = {};
            let alertdata = {};
            let deviceCordinates = {};
            let DeviceLatitud = "";
            let DeviceLongitud = "";
            let notification_id = "";
			let geoData = {};
            if (GPGGA_STRING) {
                Device_GPGGA = await decryptGPGGA(GPGGA_STRING);
               // console.log("GPGGA_DATA :", JSON.stringify(Device_GPGGA));
                if (Device_GPGGA.valid == true) {
                    if (Device_GPGGA.loc.geojson && Device_GPGGA.loc.geojson != undefined) { //Removed ?
                        DeviceLatitud = Device_GPGGA.loc.geojson.coordinates[1]; //Removed ?
                        DeviceLongitud = Device_GPGGA.loc.geojson.coordinates[0]; //Removed ?
                        deviceCordinates = {
                            "latitude": DeviceLatitud,
                            "longitute": DeviceLongitud
                        }
                    }
                }
            }
            if (DeviceLatitud && DeviceLongitud) {
                for (const dtokens of deviceToken) {
                    //console.log("Token value : " + JSON.stringify(dtokens));
                    await UpdateWearerData(deviceIdData.wearerId, DeviceLatitud, DeviceLongitud);
                }
            }


            if (Device_GPGGA.valid == true) {
                if (deviceToken.length > 0) {
                    let alert_type = 2;
                    let alertLevel = 0;
                    let lowAlert = 0;
                    let highAlert = 0;
                    let TemplowAlert = 0;
                    let TempalertLevel = 0;
                    let TempHighAlert = 0;
                    let AlertTitle = "";
                    let TempLevel = "";
                    let AlertBody = [];
                    let AlertLevels = [];
                    let MultipleFlag = [];

                    if (AccelFallDetect_Alert == 1) {
                        MultipleFlag.push(1);
                        if (nonoEdgeFallAnomaly_Alert == 1) {
                            AlertLevels.push({
                                "alertLevel": 2,
                                "high": "",
                                "low": ""
                            });
                        }
                        if (nonoEdgeFallAnomaly_Alert == 0) {
                            AlertLevels.push({
                                "alertLevel": 3,
                                "high": "",
                                "low": ""
                            });
                        }
                        AlertTitle = "Fall Detection";
                        AlertBody.push("Fall Detection - Yes");
                        notificationBody.FallDeteted = {
                            "value": "Yes",
                            "alert": "High",
                            "isAlertFor": AccelFallDetect_Alert
                        };

                    } else {
                        //AlertBody.push("Fall Detection - No");
                        notificationBody.FallDeteted = {
                            "value": "No",
                            "alert": "Low",
                            "isAlertFor": AccelFallDetect_Alert
                        };
                    }
                    if (Device_GPGGA.loc.geojson && Device_GPGGA.loc.geojson != undefined && GeoFence_Alert == 1) { //Removed ?
                        var GetGeofenceRecord;

                        
                        await GetGeofenceData(deviceID, DeviceLatitud, DeviceLongitud).then(res => {
                            geoData = res
                        });
                        //console.log("After GetGeofenceData Response is : " + JSON.stringify(geoData));

                        await getGeofenceDataFromDb(geoData, DeviceLatitud, DeviceLongitud).then(res => {
                            GetGeofenceRecord = res
                        });
                        //console.log("After getGeofenceDataFromDb Response is : " + JSON.stringify(GetGeofenceRecord));

                        if (GetGeofenceRecord.length === 0) {
                            //console.log("GetGeofenceRecord is empty!")
                        } else {
                            if (GetGeofenceRecord) {
                                MultipleFlag.push(1);
                                AlertLevels.push({
                                    "alertLevel": 2,
                                    "high": "",
                                    "low": ""
                                });
                                AlertTitle = "Geo Fence Event";
                                notificationBody.GeoFence = {
                                    "value": "Distance greater",
                                    "alert": "",
                                    "isAlertFor": GeoFence_Alert,
                                    "deviceCordinates": deviceCordinates
                                };
                                AlertBody.push("Geofence - Yes");
                            } else {
                                //AlertBody.push("Geofence - No");
                            }
                        }
                    }


                    let AlertLevelFinalString = Math.max.apply(Math, AlertLevels.map(function(o) {
                        return o.alertLevel;
                    }))
                    notificationBody.AlertLevel = AlertLevelFinalString;
                    let AlertLevelBody = '';

                    //console.log("AlertLevelFinalString" + JSON.stringify(AlertLevelFinalString));

                    switch (AlertLevelFinalString) {
                        case 2:
                            AlertLevelBody = "Time sensitive\n";
                            break;
                        case 3:
                            AlertLevelBody = "Take action now\n";
                            break;
                        case 4:
                            AlertLevelBody = "SOS\n\n";
                            break;
                    }

                    const AlertBodyFinalString = AlertBody.join("\n").toString();
                    var getGeofenceName;
                    console.log(AlertBodyFinalString);

                    for (const dtokens of deviceToken) {

                        console.log("dtToken value : ", JSON.stringify(dtokens));

                        let geoFenceName = "Geo Fence - " + "Inactive";

                        const geofenceCollection = context.services.get("mongodb-atlas").db("testRealmSync").collection("geofences");
                        const projection = {
                            "_id": 0
                        };

                        //console.log("Wearer Id: ", geoData.wearerId);
                        const query = {
                            "_id": geoData.wearerId
                        }

                        await geofenceCollection.find(query, projection)
                            .toArray()
                            .then(result => {
                                if (result) {
                                    //console.log("Came inside");
                                    //console.log(`Successfully found document: ${result}.`);
                                    getGeofenceName = result;
                                    //console.log(JSON.stringify(getGeofenceName));

                                    if (getGeofenceName.length === 0) {
                                        //console.log("GetGeofenceRecord is empty!")
                                    } else {


                                        for (const uData_geofencename of getGeofenceName) {
                                            //console.log("geofence - " + uData_geofencename);
                                            //console.log(uData_geofencename.name);
                                            if (uData_geofencename) {
                                                geoFenceName = "Geo Fence - " + uData_geofencename.name;
                                                notificationBody.geofenceDetails = uData_geofencename;
                                            }
                                        }
                                    }

                                    alertObj = {
                                        "title": dtokens.wearerName + " - " + AlertTitle,
                                        "body": AlertLevelBody + geoFenceName + "\n" + AlertBodyFinalString,
                                    };

                                    payload = {
                                        "title": dtokens.wearerName + " - " + AlertTitle,
                                        "message": AlertLevelBody + geoFenceName + "\n" + AlertBodyFinalString,
                                        "alertType": alert_type,
                                        "wearerID": dtokens.wearerId,
                                        "deviceCordinates": deviceCordinates,
                                        "notification_id": notification_id
                                    };

                                    alertdata = {
                                        "color": AlertLevelFinalString,
                                        "false_alert": 0,
                                        "title": AlertTitle,
                                        "body": notificationBody
                                    };



                                    do {
                                        notification_id = saveNOtification(deviceID, geoData.wearerId, AlertLevelFinalString, alertdata, alertObj, payload, dtokens.token);
                                    } while (notification_id == "");

                                    console.log("Notification Id: ", JSON.stringify(notification_id));

                                } else {
                                    console.log("No document matches the provided query.");
                                }
                            })
                            .catch(err => console.error(`Failed to find document: ${err}`));
                    }


                } else {
                    console.log("Device token is not available for device ID", deviceID)
                }
            }


        } else {
            console.log("Report name not available....");
        }
    }
    console.log("Execution Finished");
    const exitPoint = new Date();
    let xhours = exitPoint.getHours();
    let xminutes = exitPoint.getMinutes();
    let xseconds = exitPoint.getSeconds();
    let xmilliseconds = exitPoint.getMilliseconds();

    console.log(`Exit date and time: ${exitPoint.toLocaleDateString()} ${xhours}:${xminutes}:${xseconds}:${xmilliseconds}`);
    //console.log("Exit Point at : ", exitPoint);
};

//getDevicedata
async function getDevicedata(deviceID) {
    const insideGetDevicedata = new Date();
    //console.log("Inside getDevicedata at : ", insideGetDevicedata);
    //console.log("getDevicedata called with deviceID :" + JSON.stringify(deviceID));
    let deviceToken = [];
    const deviceCollection = context.services.get("mongodb-atlas").db("testRealmSync").collection("devices");
    const query = {
        "uniqueId": deviceID
    };
    const projection = {
        "_id": 0
    };

    var device_id_data;
    var res = await deviceCollection.findOne(query, projection)
        .then(result => {
            if (result) {
                //console.log(`Successfully found Device Data: ${JSON.stringify(result)}.`);
                device_id_data = result;
                //console.log(JSON.stringify(device_id_data));
                //console.log(device_id_data.wearerId);
                return device_id_data;
            } else {
                console.log("No document matches the provided query.");
            }
            return device_id_data;
        })
        .catch(err => console.error(`Failed to find document: ${err}`));
    return res;
}

//getUserData

async function getUserData(deviceIdData) {
    const insideGetUserData = new Date();
    //console.log("Inside getUserData at : ", insideGetUserData);
    //console.log("getUserData called with deviceIdData :" + JSON.stringify(deviceIdData));
    if (deviceIdData) {
        const userCollection = context.services.get("mongodb-atlas").db("testRealmSync").collection("users");
        const projection = {
            "_id": 0
        };
        const userquery = ({
            "_id": deviceIdData.wearerId
        }, {
            "device_token": {
                $exists: true
            }
        }, {
            "isLoggedin": true
        });

        var response = await userCollection.find(userquery, projection)
            .toArray()
            .then(resultData => {
                if (resultData) {
                    //console.log(`Successfully found ${resultData.length} documents.`)
                    //console.log(`Successfully found User Data: ${JSON.stringify(resultData)}.`);
                    user_data = resultData;
                    //console.log(JSON.stringify(user_data));
                    return user_data;
                } else {
                    console.log("No document matches the provided query.");
                }
                return user_data;
            })
            .catch(err => console.error(`Failed to find document: ${err}`));

    }
    return response;
}

//getWearerData

async function getWearerData(deviceIdData) {
    const insideGetWearerData = new Date();
    console.log("Inside getWearerData at : ", insideGetWearerData);
    //console.log("getWearerData called with deviceIdData : " + JSON.stringify(deviceIdData));
    let deviceToken = [];
    const deviceCollection = context.services.get("mongodb-atlas").db("testRealmSync").collection("wearers");
    const query = {
        "_id": deviceIdData.wearerId
    };
    const projection = {
        "_id": 0
    };

    var device_id_data;
    var res = await deviceCollection.findOne(query, projection)
        .then(result => {
            if (result) {
                //console.log(`Successfully found Wearer Data: ${JSON.stringify(result)}.`);
                device_id_data = result;
                //console.log("getWearerData Result" + JSON.stringify(device_id_data.wearerId));
                return device_id_data;
            } else {
                console.log("No document matches the provided query.");
            }
            return device_id_data;
        })
        .catch(err => console.error(`Failed to find document: ${err}`));
    return res;
}

//decryptGPGGA

async function decryptGPGGA(gpgga) {
    try {
        const insideDecryptGPGGA = new Date();
        //console.log("Inside decryptGPGGA at : ", insideDecryptGPGGA);
        //console.log("decryptGPGGA Called with gpgga : " + JSON.stringify(gpgga));
        const nmea = require('@drivetech/node-nmea');
        //console.log("Before Conversion gpgga" + JSON.stringify(gpgga));
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


//UpdateWearerData

async function UpdateWearerData(wearerId, DeviceLatitud, DeviceLongitud) {
    const insideUpdateWearerData = new Date();
    //console.log("Inside UpdateWearerData at : ", insideUpdateWearerData);
    //console.log("UpdateWearerData Called");
    //console.log("wearerId from UpdateWearerData method " + wearerId);
    //console.log("DeviceLatitude from UpdateWearerData method " + DeviceLatitud);
    //console.log("DeviceLongitude from UpdateWearerData method " + DeviceLongitud);
    const update = {
        "$set": {
            "latitude": DeviceLatitud,
            "longitude": DeviceLongitud
        }
    };

    const deviceCollection = context.services.get("mongodb-atlas").db("testRealmSync").collection("wearers");
    const options = {
        "upsert": false
    };
    const query = {
        "_id": wearerId
    };


    await deviceCollection.updateOne(query, update, options)
        .then(result => {
            const {
                matchedCount,
                modifiedCount
            } = result;
            if (matchedCount && modifiedCount) {
               // console.log("Successfully updated the item.")
                return true;
            } else {
                console.log("Unable to update the item.")
                return false;
            }
        })
        .catch(err => console.error(`Failed to Update document: ${err}`));
}


//getDistanceInMeters

function getDistanceInMeters(lat1, lon1, lat2, lon2) {
    const insideGetDistanceInMeters = new Date();
    //console.log("Inside getDistanceInMeters at : ", insideGetDistanceInMeters);
    //console.log("getDistanceInMeters Called");
    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d * 1000;
}


//GetGeofenceData


async function GetGeofenceData(deviceID, DeviceLatitud, DeviceLongitud) {
    const insideGetGeofenceData = new Date();
    //console.log("Inside GetGeofenceData at : ", insideGetGeofenceData);
    //console.log("geofence data called");
    //console.log("DeviceID is ", deviceID);
    //console.log("DeviceLatitud is ", DeviceLatitud);
    //console.log("DeviceLongitud is ", DeviceLongitud);
    const deviceCollection = context.services.get("mongodb-atlas").db("testRealmSync").collection("devices");
    const devicequery = {
        "uniqueId": deviceID
    };
    const projection = {
        "_id": 0
    };

    var res = await deviceCollection.findOne(devicequery, projection)
        .then(result => {
            if (result) {
                //console.log(`Successfully found Device Data: ${result}.`);
                //console.log("GetGeofenceData Result" + JSON.stringify(result))
                return result;
            } else {
                console.log("No document matches the provided query.");
            }
            return result;
        })
        .catch(err => console.error(`Failed to find document: ${err}`));
    return res;
}


async function getGeofenceDataFromDb(geoData, DeviceLatitud, DeviceLongitud) {
    const insideGetGeofenceDataFromDb = new Date();
    //console.log("Inside getGeofenceDataFromDb at : ", insideGetGeofenceDataFromDb);
    //console.log("getGeofenceDataFromDb called");
    //console.log("DeviceLatitud is ", DeviceLatitud);
    //console.log("DeviceLongitud is ", DeviceLongitud);
    let current_datetime = new Date();
    let current_date = '';
    let time = '';
    time = current_datetime.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    })
    time = time.split(" ").join("");
    var day = ("0" + current_datetime.getDate()).slice(-2);
    var month = ("0" + (current_datetime.getMonth() + 1)).slice(-2);
    var year = current_datetime.getFullYear();
    current_date = day + "-" + month + "-" + year;

    if (geoData) {
        const geofenceCollection = context.services.get("mongodb-atlas").db("testRealmSync").collection("geofences");
        const projection = {
            "_id": 0
        };

        const geofencequery = {
            "wearerId": geoData.wearerId,
            "_id": {
                $exists: true
            },
            "latitude": {
                $exists: true
            },
            "longitude": {
                $exists: true
            },
            "radiusUnit": {
                $exists: true
            },
            "radius": {
                $exists: true
            },
            "name": {
                $exists: true
            },
            "duration": {
                $elemMatch: {
                    startDate: {
                        $gte: current_datetime
                    },
                    endDate: {
                        $lt: current_datetime
                    },
                    startTime: {
                        $gte: time
                    },
                    endTime: {
                        $lt: time
                    }
                }
            }
        }

        var geofence_data;
        var response = await geofenceCollection.find(geofencequery, projection)
            .toArray()
            .then(resultData => {
                if (resultData) {
                    //console.log(`Successfully found ${resultData.length} documents.`)
                    //console.log(`Successfully found Geofence Data: ${JSON.stringify(resultData)}.`);
                    geofence_data = resultData;

                    for (const uData_geofence of geofence_data) {
                        if (uData_geofence.length != 0) {
                            let geofenceLatitud = (uData_geofence.latitude) ? uData_geofence.latitude : "";
                            let geofenceLongitud = (uData_geofence.longitude) ? uData_geofence.longitude : "";
                            let radius = (uData_geofence.radius) ? uData_geofence.radius : "";
                            let radiusUnit = (uData_geofence.radiusUnit) ? uData_geofence.radiusUnit : "";
                            let duration = (uData_geofence.duration) ? uData_geofence.duration : "";
                            let distanceInMeters = getDistanceInMeters(DeviceLatitud, DeviceLongitud, geofenceLatitud, geofenceLongitud);
                            //console.log("distanceInMeters", JSON.stringify(distanceInMeters));
                            //console.log("Radius", JSON.stringify(radius));
                            if (distanceInMeters > radius) {
                                return (uData_geofence.name) ? uData_geofence.name : "";
                            } else {
                                return false;
                            }
                        }
                    }


                } else {
                    console.log("No document matches the provided query.");
                }
                return geofence_data;
            })
            .catch(err => console.error(`Failed to find document: ${err}`));
        return response;
    }
}

function toRad(Value) {
    return Value * Math.PI / 180;
}

//saveNOtification

async function saveNOtification(device_id, wearerId, alert_type, alertdata, alertObj, payload, token) {
    const insideSaveNOtification = new Date();
    console.log("Inside saveNOtification at : ", insideSaveNOtification);
    //console.log("saveNOtification Called");
    //console.log("Device Id : " + device_id);
    //console.log("Wearer Id : " + wearerId);
    //console.log("Alert Type : " + JSON.stringify(alert_type));
    //console.log("Alert Data : " + JSON.stringify(alertdata));
    let notificationId = '';

    if (device_id && wearerId) {
        let tok = JSON.stringify(token).replace(/,/g, '').replace(/\[/g, '').replace(/\]/g, '').slice(1, -1);
        const notificationsCollection = context.services.get("mongodb-atlas").db("testRealmSync").collection("notifications");
        //console.log("Before New Item",token)
        //console.log("Type Of",typeof(token));
        const newItem = {
            "deviceId": device_id,
            "wearerId": wearerId,
            "alert_type": alert_type,
            "color": alertdata.color,
            "false_alert": alertdata.false_alert,
            "title": alertdata.title,
            "body": alertdata.body,
            "alertObj": alertObj,
            "payload": payload,
            "token": tok,
            "createdAt": new Date()
        };

        await notificationsCollection.insertOne(newItem)
            .then(result => {
                console.log(`Successfully inserted item with _id: ${result.insertedId}`);
                return result.insertedId
            })
            .catch(err => {
                console.error(`Failed to insert item: ${err}`);
                return false
            })
    }
}

//sendAPNPushNotification

async function sendAPNPushNotification(deviceToken, alert, payload) {
    const insideSendAPNPushNotification = new Date();
    console.log("Inside sendAPNPushNotification at : ", insideSendAPNPushNotification);
    console.log("sendAPNPushNotification Called");
    console.log("deviceToken : " + JSON.stringify(deviceToken));
    console.log("Alert : " + JSON.stringify(alert));
    console.log("Payload : " + JSON.stringify(payload));
    var apn = require('apn');

    const {
        BlobServiceClient
    } = require('@azure/storage-blob');

    const blobServiceClient = new BlobServiceClient(
        "https://encryptedfiles.blob.core.windows.net"
    );

    const containerClient = blobServiceClient.getContainerClient("testcontainer");

    const blobClient = await containerClient.getBlobClient("AuthKey_VJ5854JA3K.p8");


    const downloadResponse = await blobClient.download();

    var res = await new Promise((resolve, reject) => {
        const chunks = [];
        downloadResponse.readableStreamBody.on('data', (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        downloadResponse.readableStreamBody.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        downloadResponse.readableStreamBody.on('error', reject);
    });

    console.log("Response From Azure" + JSON.stringify(res));


    var options = {
        token: {
            key: res,
            keyId: "VJ5854JA3K",
            teamId: "L4Y73Q83KU"
        },
        production: true
    };

    var apnProvider = new apn.Provider(options);

    console.log("Apn Provider" + JSON.stringify(apnProvider));

    var note = new apn.Notification();

    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.badge = 3;
    note.sound = "ping.aiff";
    note.alert = alert;
    note.payload = payload,
        note.topic = "com.weartech.mahi";
    let result = await apnProvider.send(note, deviceToken);
    console.log("Response from sendAPNPushNotification : " + JSON.stringify(result));
    return result;
}