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
        sensorData.accel = fullDocument.data.data.acc;
        sensorData.gyro = fullDocument.data.data.gy;
        sensorData.battery = fullDocument.data.b;
        sensorData.version = "";
        sensorData.alertInfo=[
            {
                "alertName":"HeartRate",
                "alertbitNo":fullDocument.data.a[i],
                "confidence":fullDocument.data.c[1],
                "Level":fullDocument.data.l[1]
                
            },
            {

            },
            {

            },
            {

            },
            {

            },
            {

            },
            {

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
