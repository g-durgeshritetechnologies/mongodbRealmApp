exports = function(device_id, wearerId, alert_type, alertdata) {
    let notificationId = '';
    console.log("save Notification Called");

    if (device_id && wearerId) {

        const notificationsCollection = context.services.get("mongodb-atlas").db("testRealmSync").collection("notifications");
        const query = {
            "uniqueId": deviceID
        };
        const projection = {
            "_id": 0
        };

        const newItem = {
            "deviceId": device_id,
            "wearerId": wearerId,
            "alert_type": alert_type,
            "color": alertdata.color,
            "false_alert": alertdata.false_alert,
            "title": alertdata.title,
            "body": alertdata.body,
            "createdAt": new Date()
        };
        notificationsCollection.insertOne(newItem)
            .then(result => {
                console.log(`Successfully inserted item with _id: ${result.insertedId}`);
                return result.insertedId
            })
            .catch(err => {
                console.error(`Failed to insert item: ${err}`);
                return false
            })
    }
};