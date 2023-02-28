exports = function(changeEvent) {
  try {
      if(changeEvent.operationType == "replace" || changeEvent.operationType == "update")
      {
        if (changeEvent.fullDocument) {
          
            console.log("Entered InsertAuditRecord() with Data : ", JSON.stringify(changeEvent));
            const fullDocument = changeEvent.fullDocument;
            console.log("Modified Record is ", JSON.stringify(fullDocument));
            
            savePreviousRecord(changeEvent);

        } else {
            console.log("No Data Received by trigger");
            return;
        }
      }
      else
      {
            console.log("Entered InsertAuditRecord() with Data : ", JSON.stringify(changeEvent));
            
            savePreviousRecord(changeEvent);

      }
    } catch (error) {
        console.log(JSON.stringify(error));
    }
};



async function savePreviousRecord(changeEvent){
  try
  {
    const audit_collection = context.services.get("mongodb-atlas").db("production_Cluster0").collection("audit_roles");
    
    const newData = {
      "fullDocumentBeforeChange":changeEvent.fullDocumentBeforeChange,
      "timeStamp": new Date(Date.now()).toISOString(),
      "updateDescription":changeEvent.updateDescription,
      "operationType":changeEvent.operationType
    }  
    
    await audit_collection.insertOne(newData).then(result => {
        console.log(`Successfully inserted item with _id: ${
            result.insertedId
        }`);
        return result.insertedId;
    }).catch(err => {
        console.error(`Failed to insert item: ${err}`);
        return false;
    })
  }
  catch(error){
    console.log("Error Occured in savePreviousRecord ", error)
  }
}

