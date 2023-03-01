exports = async function(changeEvent) {
    const fullDocument = changeEvent.fullDocument;
    await insertIntoRapidSos(fullDocument);
};

async function insertIntoRapidSos(fullDocument) {
    try {
        const rapidsosalert = context.services.get("mongodb-atlas").db("production_Cluster0").collection("rapidSOSAlerts ");


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
}