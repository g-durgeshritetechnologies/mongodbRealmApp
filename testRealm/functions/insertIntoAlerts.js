exports = async function (changeEvent) {

    try {
        if (changeEvent.operationType == "update") {
            if (changeEvent.fullDocument) {
                const fullDocument = changeEvent.fullDocument;
                let deviceData = {};
                let payload = {};
                let userData={};
                if (fullDocument.isConfirmed == "Y") {

                    await getdeviceInfo(fullDocument.deviceId).then(result => {
                        if (result) {
                            deviceData = result;
                        } else {
                            console.log("No document matches the provided query.");
                        }
                    }).catch(err => console.error(`Failed to find document: ${err}`));


                    await getUserInfo(fullDocument.userTokens.userId).then(result => {
                        if (result) {
                            userData = result;
                        } else {
                            console.log("No document matches the provided query.");
                        }
                    }).catch(err => console.error(`Failed to find document: ${err}`));

                    activeWearer = deviceData.wearer.find((wearer) => {
                        return wearer.isActive == true;
                    });
                    console.log("Active Wearer", JSON.stringify(activeWearer));
                    
                    GetGeofenceRecord = deviceData.geofences.find((geofence) => {
                        return geofence.status == "active";
                    });
                    
                    console.log("GeofenceRecord", JSON.stringify(GetGeofenceRecord));

                    let age = getAge(activeWearer.dob);


                    payload.callflow = "weartech_emergency_v0";
                    payload.variables = {
                        "wearer_information": {
                            "wearer_name": activeWearer.firstname + " " + activeWearer.lastname,
                            "phone_number": activeWearer.emergency_contact_number,
                            "age": age.toString(),
                            "gender": activeWearer.gender
                        },
                        "guardian_information": {
                            "guardian_name": userData.firstName + " " + userData.lastName,
                            "guardian_phone": userData.phone
                        },
                        "incident_information": {
                            "incident_type": "Severe Fall Detected",
                            "incident_verification": "Incident Has Been Verified by End User",
                            "additional_notes": "Guardian notified via SMS."
                        },
                        "location": {
                            "latitude": activeWearer.latitude,
                            "longitude": activeWearer.longitude
                        }
                    }
                    console.log("Final Payload : ", JSON.stringify(payload));

                    getToken().then(function (token) {
                        console.log(token);
                        postDatToRapidSOS(token, payload).then(function (response) {
                            console.log("Successfully Posted Data", response);
                        }).catch(function (error) {
                            console.log("Could not Post Data", error);
                        });
                    }).catch(function (error) {
                        console.log("Could not receive token", error);
                    });

                }
            }
        } else {
            var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
            const xhr = new XMLHttpRequest();
            const fullDocument = changeEvent.fullDocument;
            let Alert = fullDocument.alert;
            console.log("data", JSON.stringify(fullDocument));
            if (fullDocument.isConfirmed == "Y") {} else {
                if (fullDocument.alert == "" || fullDocument.alert.length != 8) {
                    fullDocument.alert = "00000000";
                }
                const HeartRate_Alert = Alert.charAt(1);
                const AmbientTemp_Alert = Alert.charAt(2);
                const AccelFallDetect_Alert = Alert.charAt(3);
                const nonoEdgeFallAnomaly_Alert = Alert.charAt(4);
                const GeoFence_Alert = Alert.charAt(5);
                const SpO2_Alert = Alert.charAt(6);
                const SOS_Alert = Alert.charAt(7);
                let alertObj = {};
                let alert_type = 2;
                let AlertTitle = [];
                let AlertBody = [];
                let AlertLevels = [];
                let notificationBody = [];
                let alertLevel = 0;
                let GetGeofenceRecord = {};
                let deviceData = {};
                let details = [];
                let activeWearer = {};
                let deviceCordinates = {}
                deviceCordinates.latitude = fullDocument.latitude;
                deviceCordinates.longitute = fullDocument.longitute;


                if (HeartRate_Alert == 1) {
                    AlertTitle.push("Heart Rate alert");
                    details.push({
                        "param": "Heart Rate",
                        "value": fullDocument.heartrate,
                        "type": "",
                        "message": "Heart Rate is high",
                        "level": alertLevel,
                        "color": alertLevel,
                        "wearerThreshold": ""

                    });

                }
                if (AmbientTemp_Alert == 1) {
                    AlertTitle.push("AmbientTemp alert");
                    details.push({
                        "param": "Ambient Rate",
                        "value": fullDocument.heartrate,
                        "type": "",
                        "message": "Heart Rate is high",
                        "level": alertLevel,
                        "color": alertLevel,
                        "wearerThreshold": ""

                    });
                }

                if (AccelFallDetect_Alert == 1) {

                    if (nonoEdgeFallAnomaly_Alert == 1) {
                        AlertLevels.push({"alertLevel": 2, "high": "", "low": ""});
                    }
                    if (nonoEdgeFallAnomaly_Alert == 0) {
                        AlertLevels.push({"alertLevel": 3, "high": "", "low": ""});
                    }
                    AlertTitle.push("Fall Detection");
                    AlertBody.push("Fall Detection - Yes");
                    notificationBody.FallDeteted = {
                        "value": "Yes",
                        "alert": "High",
                        "isAlertFor": AccelFallDetect_Alert
                    };

                    details.push({
                        "param": "Fall Detection",
                        "value": fullDocument.heartrate,
                        "type": "",
                        "message": "fall detetcion",
                        "level": alertLevel,
                        "color": alertLevel,
                        "wearerThreshold": ""

                    });

                } else {
                    notificationBody.FallDeteted = {
                        "value": "No",
                        "alert": "Low",
                        "isAlertFor": AccelFallDetect_Alert
                    };
                }

                if (GeoFence_Alert == 1) {

                    await getdeviceInfo(fullDocument.deviceId).then(result => {
                        if (result) {
                            deviceData = result;
                        } else {
                            console.log("No document matches the provided query.");
                        }

                    }).catch(err => console.error(`Failed to find document: ${err}`));

                    activeWearer = deviceData.wearer.find((wearer) => {
                        return wearer.isActive == true;
                    });
                    console.log("Active Wearer", JSON.stringify(activeWearer));

                    GetGeofenceRecord = deviceData.geofences.find((geofence) => {
                        return geofence.status == "active";
                    });

                    console.log("GetGeofenceRecord", JSON.stringify(GetGeofenceRecord));
                    if (GetGeofenceRecord.length === 0) {} else {
                        if (GetGeofenceRecord) {

                            AlertLevels.push({"alertLevel": 2, "high": "", "low": ""});
                            AlertTitle.push("Geo Fence Event");
                            notificationBody.GeoFence = {
                                "value": "Distance greater",
                                "alert": "",
                                "isAlertFor": GeoFence_Alert,
                                "deviceCordinates": deviceCordinates
                            };
                            console.log("Code Reached here 1");
                            AlertBody.push("Geofence - Yes");
                            details.push({
                                "param": "Heart Rate",
                                "value": fullDocument.heartrate,
                                "type": "",
                                "message": "Heart Rate is high",
                                "level": alertLevel,
                                "color": alertLevel,
                                "wearerThreshold": ""

                            });
                            console.log("Code Reached here 2");
                        } else {}
                    }


                }
                if (SpO2_Alert == 1) {
                    console.log("Code Reached here 3");
                    AlertTitle.push("SpO2 alert");
                    details.push({
                        "param": "Heart Rate",
                        "value": fullDocument.heartrate,
                        "type": "",
                        "message": "Heart Rate is high",
                        "level": alertLevel,
                        "color": alertLevel,
                        "wearerThreshold": ""

                    });
                }
                if (SOS_Alert == 1) {
                    console.log("Code Reached here 4");
                    AlertTitle.push("SOS alert");
                    details.push({
                        "param": "Heart Rate",
                        "value": fullDocument.heartrate,
                        "type": "",
                        "message": "Heart Rate is high",
                        "level": alertLevel,
                        "color": alertLevel,
                        "wearerThreshold": ""

                    });
                }

                let AlertLevelFinalString = Math.max.apply(Math, AlertLevels.map(function (o) {
                    return o.alertLevel;
                }));
                notificationBody.AlertLevel = AlertLevelFinalString;
                let AlertLevelBody = '';


                switch (AlertLevelFinalString) {
                    case 2: AlertLevelBody = "Time sensitive\n";
                        break;
                    case 3: AlertLevelBody = "Take action now\n";
                        break;
                    case 4: AlertLevelBody = "SOS\n\n";
                        break;
                }

                const AlertBodyFinalString = AlertBody.join("\n").toString();
                console.log("ALertBodyFinalString", JSON.stringify(AlertBodyFinalString));


                if (AlertBodyFinalString.includes("Geofence - Yes") || AlertBodyFinalString.includes("Fall Detection - Yes")) {
                    for (const dtokens of fullDocument.userTokens.notificationTokens) {
                        console.log("GeofenceRecord inside", JSON.stringify(GetGeofenceRecord));
                        if (GetGeofenceRecord) {
                            geoFenceName = "Geo Fence - " + GetGeofenceRecord.name;
                            notificationBody.geofenceDetails = GetGeofenceRecord.name;
                        }

                        alertObj.title = AlertTitle;
                        alertObj.version = deviceData.version;
                        alertObj.createdAt = new Date(Date.now()).toISOString();
                        alertObj.latitude = fullDocument.latitude;
                        alertObj.longitute = fullDocument.longitute;
                        alertObj.spo2 = fullDocument.spo2;
                        alertObj.heartrate = fullDocument.heartrate;
                        alertObj.details = details;
                        alertObj.userTokens = fullDocument.userTokens.notificationTokens;
                        alertObj.sensordataid = fullDocument.sensordataid;
                        alertObj.deviceId = fullDocument.deviceId;
                        alertObj.wearerId = activeWearer._id;
                        alertObj.wearerFirstName = activeWearer.firstname;
                        alertObj.wearerLastName = activeWearer.lastname;
                        alertObj.confidence = fullDocument.alertInfo;
                        alertObj.isStopped = 0;

                        console.log("AlertObject", JSON.stringify(alertObj));
                        let alertid = await saveAlert(alertObj);
                        // let alertid = await saveAlert(alertObj).then(result => {
                        //     console.log("Result",JSON.stringify(result));
                        //     if (result) {
                        //         alertid  = result;
                        //     } else {
                        //         console.log("No document matches the provided query.");
                        //     };
                        // });

                        alertdata = {
                            "color": AlertLevelFinalString,
                            "false_alert": 0,
                            "title": AlertTitle,
                            "body": notificationBody
                        };

                        alert = {
                            "title": alertObj.wearerFirstName + " " + alertObj.wearerLastName + " - " + AlertTitle,
                            "body": AlertLevelBody + geoFenceName + "\n" + AlertBodyFinalString
                        };
                        payload = {
                            "title": alertObj.wearerFirstName + " " + alertObj.wearerLastName + " - " + AlertTitle,
                            "message": AlertLevelBody + geoFenceName + "\n" + AlertBodyFinalString,
                            "alertType": alert_type,
                            "wearerID": alertObj.wearerId,
                            "deviceCordinates": deviceCordinates,
                            "alert_id": alertid
                        };

                        console.log("Payload", JSON.stringify(payload));
                        console.log("AlertData", JSON.stringify(alertdata));
                        console.log("Alert", JSON.stringify(alert));


                        await sleep(25);

                        sendNotifications(alert, payload, xhr, dtokens);

                    }


                }


            }
        }
    } catch (error) {
        console.log(JSON.stringify(error));
    }

}


async function getdeviceInfo(userId) {
    const userCollection = context.services.get("mongodb-atlas").db("production_Cluster0").collection("device_info");
    const query = {
        "_id": userId
    };

    var user_id_data;
    var res = await userCollection.findOne(query).then(result => {
        if (result) {
            user_id_data = result;

            return user_id_data;
        } else {
            console.log("No document matches the provided query.");
        }

    }).catch(err => console.error(`Failed to find document: ${err}`));
    return res;
}

async function getUserInfo(deviceIdData) {
    const deviceCollection = context.services.get("mongodb-atlas").db("production_Cluster0").collection("users");
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


async function saveAlert(data) {
    const alert = context.services.get("mongodb-atlas").db("production_Cluster0").collection("alerts");

    await alert.insertOne(data).then(result => {
        console.log(`Successfully inserted item with _id: ${
            result.insertedId
        }`);
        return result.insertedId;
    }).catch(err => {
        console.error(`Failed to insert item: ${err}`);
        return false;
    });
}

function sendNotifications(alert, payload, xhr, token) {

    let body = {};
    let aps = {};
    let triggerData = {};

    var url = "http://4.227.137.1:5000/api/trigger";
    xhr.open('POST', url, true);
    xhr.timeout = 5000;
    xhr.setRequestHeader('Content-Type', 'application/json');


    body.alert = alert;
    body.payload = payload;
    body.sound = "chime.aiff";
    console.log("Body Data", JSON.stringify(body));
    triggerData.aps = body;

    triggerData.token = token;
    console.log("Trigger Data", JSON.stringify(triggerData));

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            return JSON.parse(xhr.readyState);


        } else if (xhr.readyState == 3) {} else if (xhr.readyState == 2) {
            console.log("Final State :", JSON.stringify(xhr.readyState));
        }

    };

    xhr.send(JSON.stringify(triggerData));
    console.log(xhr.readyState);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function postDatToRapidSOS(token, payload) {
    return new Promise(function (resolve, reject) {
        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        const xhr = new XMLHttpRequest();
        const url = "https://api-sandbox.rapidsos.com/v1/rem/trigger";
        const json = JSON.stringify(sensorPayload);
        xhr.open("POST", url);
        xhr.setRequestHeader("Authorization", `Bearer ${
            token.toString()
        }`);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                console.log(xhr.status);
                console.log(xhr.responseText);
            }
        };
        xhr.send(json);
    });
}

function getAge(dateOfBirth) {
    var dob = new Date(dateOfBirth);
    var month_diff = Date.now() - dob.getTime();
    var age_dt = new Date(month_diff);
    var year = age_dt.getUTCFullYear();
    var age = Math.abs(year - 1970);
    return age;
}

function getToken() {
    return new Promise(function (resolve, reject) {
        try {
            var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
            const xhr = new XMLHttpRequest();
            var url = "https://api-sandbox.rapidsos.com/oauth/token";
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send("grant_type=client_credentials&client_id=ZSeFLQDjoMTRNPOrXD75xtoWNvllB4SZ&client_secret=sqdKIFwdDWtC6OXn");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        let token = JSON.parse(xhr.responseText).access_token;
                        resolve(token);
                    } else {
                        reject(xhr.status);
                    }
                }
            };
        } catch (error) {
            reject(error);
        }
    });
}