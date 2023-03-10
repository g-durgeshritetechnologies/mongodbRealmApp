exports = async function (changeEvent) {
    const fullDocument = changeEvent.fullDocument;
    await insertIntoSensorDataTS(fullDocument).then(response => {});
};

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
        let configdata = getconfigData();
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

 function getconfigData() {
    const configCollection = context.services.get("mongodb-atlas").db("production_Cluster0").collection("default_configurations");

    const configquery = {}
    var response =  configCollection.findOne(configquery).then(resultData => {
        if (resultData) {
            let config_data = resultData;
            return config_data;
        } else {
            console.log("No document matches the provided query.");
        }
    }).catch(err => console.error(`Failed to find document: ${err}`));
    return response;
}
