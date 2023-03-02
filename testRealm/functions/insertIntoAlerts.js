exports = async function(changeEvent) {
    const fullDocument = changeEvent.fullDocument;
    let Alert=fullDocument.alert;
    console.log("data",JSON.stringify(fullDocument));
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
        let AlertTitle = [];
        let AlertBody = [];
        let AlertLevels = [];
        let notificationBody = [];
        let alertLevel = 0;
        let GetGeofenceRecord = {};
        let deviceData = {};
        let details=[];
        let activeWearer={};
        
        // activeWearer = deviceData.wearer.forEach(wearer => {
        //     wearer.isActive == "true";
        // });
        

        if (HeartRate_Alert == 1) { 
            AlertTitle.push("Heart Rate alert");
            details.push({
                "param":"Heart Rate",
                "value":fullDocument.heartrate,
                "type":"",
                "message":"Heart Rate is high",
                "level":alertLevel,
                "color":alertLevel,
                "wearerThreshold": ""

            });
          
        }
        if (AmbientTemp_Alert == 1) { 
            AlertTitle.push("AmbientTemp alert");
            details.push({
                "param":"Ambient Rate",
                "value":fullDocument.heartrate,
                "type":"",
                "message":"Heart Rate is high",
                "level":alertLevel,
                "color":alertLevel,
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
            AlertTitle = "Fall Detection";
            AlertBody.push("Fall Detection - Yes");
            notificationBody.FallDeteted = {
                "value": "Yes",
                "alert": "High",
                "isAlertFor": AccelFallDetect_Alert
            };

            details.push({
                "param":"Fall Detection",
                "value":fullDocument.heartrate,
                "type":"",
                "message":"fall detetcion",
                "level":alertLevel,
                "color":alertLevel,
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

            // GetGeofenceRecord = deviceData.geofences.forEach(geofence => {
            //     geofence.status == "active";

            // });
            if (GetGeofenceRecord.length === 0) {} else {
                if (GetGeofenceRecord) {

                    AlertLevels.push({"alertLevel": 2, "high": "", "low": ""});
                    AlertTitle = "Geo Fence Event";
                    notificationBody.GeoFence = {
                        "value": "Distance greater",
                        "alert": "",
                        "isAlertFor": GeoFence_Alert,
                        "deviceCordinates": deviceCordinates
                    };
                    AlertBody.push("Geofence - Yes");
                    details.push({
                        "param":"Heart Rate",
                        "value":fullDocument.heartrate,
                        "type":"",
                        "message":"Heart Rate is high",
                        "level":alertLevel,
                        "color":alertLevel,
                        "wearerThreshold": ""
        
                    });
                } else {}
            }


        }
        if (SpO2_Alert == 1) {
            AlertTitle.push("SpO2 alert");
            details.push({
                "param":"Heart Rate",
                "value":fullDocument.heartrate,
                "type":"",
                "message":"Heart Rate is high",
                "level":alertLevel,
                "color":alertLevel,
                "wearerThreshold": ""

            });
        }
        if (SOS_Alert == 1) {
            AlertTitle.push("SOS alert");
            details.push({
                "param":"Heart Rate",
                "value":fullDocument.heartrate,
                "type":"",
                "message":"Heart Rate is high",
                "level":alertLevel,
                "color":alertLevel,
                "wearerThreshold": ""

            });
        }

        let AlertLevelFinalString = Math.max.apply(Math, AlertLevels.map(function (o) {
            return o.alertLevel;
        }));
        notificationBody.AlertLevel = AlertLevelFinalString;
        let AlertLevelBody = '';

        // console.log("AlertLevelFinalString" + JSON.stringify(AlertLevelFinalString));

        switch (AlertLevelFinalString) {
            case 2: AlertLevelBody = "Time sensitive\n";
                break;
            case 3: AlertLevelBody = "Take action now\n";
                break;
            case 4: AlertLevelBody = "SOS\n\n";
                break;
        }

        const AlertBodyFinalString = AlertBody.join("\n").toString();
        console.log(AlertBodyFinalString);


        if (AlertBodyFinalString.includes("Geofence - Yes") || AlertBodyFinalString.includes("Fall Detection - Yes")) {
            for (const dtokens of fullDocument.userTokens.notificationTokens) {
                console.log(GetGeofenceRecord);
                if (GetGeofenceRecord) {
                    geoFenceName = "Geo Fence - " + GetGeofenceRecord.name;
                    notificationBody.geofenceDetails = GetGeofenceRecord.name;
                }

                alertObj.title=AlertTitle;
                alertObj.version=deviceData.version;
                alertObj.createdAt= new Date(Date.now()).toISOString();
                alertObj.latitude=fullDocument.latitude;
                alertObj.longitute=fullDocument.longitute;
                alertObj.spo2=fullDocument.spo2;
                alertObj.heartrate=fullDocument.heartrate;
                alertObj.details=details;
                alertObj.userTokens=fullDocument.userTokens.notificationTokens;
                alertObj.sensordataid=fullDocument.sensordataid;
                alertObj.devicId=fullDocument.devicId;
                alertObj.wearerId=activeWearer._id;
                alertObj.wearerFirstName=activeWearer.firstname;
                alertObj.wearerLastName=activeWearer.lastname;
                alertObj.confidence=fullDocument.alertInfo;
                alertObj.isStopped=0;

                await saveAlert(alertObj);


                // alertdata = {
                //     "color": AlertLevelFinalString,
                //     "false_alert": 0,
                //     "title": AlertTitle,
                //     "body": notificationBody
                // };

                // alert = {
                //     "title": dtokens.wearerName + " - " + AlertTitle,
                //     "body": AlertLevelBody + geoFenceName + "\n" + AlertBodyFinalString
                // };
                // payload = {
                //     "title": dtokens.wearerName + " - " + AlertTitle,
                //     "message": AlertLevelBody + geoFenceName + "\n" + AlertBodyFinalString,
                //     "alertType": alert_type,
                //     "wearerID": dtokens.wearerId,
                //     "deviceCordinates": deviceCordinates,
                //     "notification_id": notification_id
                // };
                // console.log(payload);
                
            }


        }


    }


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


async function saveAlert(data)
{
    const alert = context.services.get("mongodb-atlas").db("production_Cluster0").collection("alerts");

    await alert.insertOne(data).then(result => {
        console.log(`Successfully inserted item with _id: ${result.insertedId}`);
        return result.insertedId;
    }).catch(err => {
        console.error(`Failed to insert item: ${err}`);
        return false;
    });
} 
