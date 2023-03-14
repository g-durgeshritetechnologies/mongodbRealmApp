exports = async function (changeEvent) {
    try {
        const fullDocument = changeEvent.fullDocument;
        let filteredData = {};
        filteredData = await deviceData(fullDocument).then(resultData => {
            if (resultData) {
                return resultData;
            } else {
                console.log("No document matches the provided query.");
            };
        });
        console.log("Filtered Data", JSOn.stringify(filteredData));

    } catch (error) {
        console.log("Some Error in the Try Block: ", JSON.stringify(error));
    }
};

async function deviceData(fulldocument) {
    const deviceInfoCollection = context.services.get("mongodb-atlas").db("production_Cluster0").collection("device_info");

    const devicequery = {
        "deviceId": fulldocument.data.deviceId
    }
    let response = await deviceInfoCollection.findOne(devicequery).then(resultData => {
        if (resultData) {
            let device_data = resultData;
            return device_data;
        } else {
            console.log("No document matches the provided query.");
        }
    }).catch(err => console.error(`Failed to find document: ${err}`));
    console.log("Device Data",JSON.stringify(response));
}
