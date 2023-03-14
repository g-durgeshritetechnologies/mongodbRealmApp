exports = async function (changeEvent) {
    try {
        const fullDocument = changeEvent.fullDocument;
        await checkData(fullDocument);

    } catch (error) {
        console.log("Some Error in the Try Block: ", JSON.stringify(error));
    }
};


async function checkData(fulldocument) {
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

  console.log("Device Info",JSON.stringify(response));
}
