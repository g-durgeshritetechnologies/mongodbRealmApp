exports = async function (changeEvent) {
    try {
        let payload = {}
        let lattitude;
        let longitude;
        let data = {}
        let wearerData = {}
        let deviceInfoData = {}

        if (changeEvent.fullDocument) {
            const fullDocument = changeEvent.fullDocument;
            console.log("Rapid SOS", JSON.stringify(fullDocument));
            saveRapidSos(fullDocument);
            await getDeviceInfo(fullDocument.deviceId).then(res => {
                data = res
            });
            console.log("DeviceInfoData From Db is : ", JSON.stringify(data));

            data.wearer.forEach((obj) => {
                if (obj.isActive === true) {
                    wearerData = obj;
                }
            })
            if (wearerData) {
                if (fullDocument.lattitude && fullDocument.lattitude) {
                    lattitude = fullDocument.lattitude;
                    longitude = fullDocument.longitude;
                } else {
                    lattitude = data.wearer.latitude;
                    longitude = data.wearer.longitude;
                }
                let age = getAge(wearerData.dob);
                let roleData = {}
                await getRoleInfo().then(res => {
                    roleData = res;
                });
                console.log("RoleData From Db is : ", JSON.stringify(roleData))
                data.mappedUsers.forEach((userObj) => {
                    if (userObj.userRoleId.toString() == roleData._id.toString()) {
                        deviceInfoData = userObj;
                    }
                })
                let userData = {}
                await getUserInfo(deviceInfoData.userId).then(res => {
                    userData = res;
                });
                console.log("UserData From Db is : ", JSON.stringify(userData))
                payload.callflow = "weartech_emergency_v0";
                payload.variables = {
                    "wearer_information": {
                        "wearer_name": wearerData.firstname + " " + wearerData.lastname,
                        "phone_number": wearerData.emergency_contact_number,
                        "age": age.toString(),
                        "gender": wearerData.gender
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
                        "latitude": wearerData.latitude,
                        "longitude": wearerData.longitude
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
        } else {
            console.log("No Data Received by trigger");
            return;
        }
    } catch (error) {
        console.log(JSON.stringify(error));
    }
};

async function saveRapidSos(fullDocument) {
    const timeSeries_RSCollection = context.services.get("mongodb-atlas").db("production_Cluster0").collection("sensorTimeSeries");
    const newItem = {
        "deviceId": fullDocument.deviceId,
        "device_key": fullDocument.device_key,
        "timeStamp": fullDocument.timeStamp,
        "verification": fullDocument.verification,
        "latitude": fullDocument.latitude,
        "longitude": fullDocument.longitude
    };
    await timeSeries_RSCollection.insertOne(newItem).then(result => {
        console.log(`Successfully inserted item with _id: ${
            result.insertedId
        }`);
        context.services.get("mongodb-atlas").db("production_Cluster0").collection("rsSensorData").deleteOne({_id: fullDocument._id});
        console.log(`Successfully deleted item with _id: ${
            fullDocument._id
        }`);
        return result.insertedId;
    }).catch(err => {
        console.error(`Failed to insert item: ${err}`);
        return false;
    })

}
async function getDeviceInfo(deviceId) {
    const deviceCollection = context.services.get("mongodb-atlas").db("production_Cluster0").collection("device_info");
    const devicequery = {
        "deviceId": deviceId
    };
    const projection = {};
    var res = await deviceCollection.findOne(devicequery, projection).then(result => {
        if (result) {
            console.log(`Successfully found Device Data: ${result}.`);
            return result;
        } else {
            console.log("No document matches the provided query.");
        }
        return result;
    }).catch(err => console.error(`Failed to find document: ${err}`));
    return res;
}
async function getRoleInfo() {
    const roleCollection = context.services.get("mongodb-atlas").db("production_Cluster0").collection("roles");
    const rolequery = {
        "rolename": "Primary Guardian"
    };
    const projection = {};
    var res = await roleCollection.findOne(rolequery, projection).then(result => {
        if (result) {
            console.log(`Successfully found Role Data: ${result}.`);
            return result;
        } else {
            console.log("No document matches the provided query.");
        }
        return result;
    }).catch(err => console.error(`Failed to find document: ${err}`));
    return res;
}
async function getUserInfo(id) {
    console.log("ID", id)
    const usersCollection = context.services.get("mongodb-atlas").db("production_Cluster0").collection("users");
    const usersquery = {
        "_id": id
    };
    const projection = {};
    var res = await usersCollection.findOne(usersquery, projection).then(result => {
        if (result) {
            console.log(`Successfully found User Data: ${result}.`);
            return result;
        } else {
            console.log("No document matches the provided query.");
        }
        return result;
    }).catch(err => console.error(`Failed to find document: ${err}`));
    return res;
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
function postDatToRapidSOS(token, sensorPayload) {
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