exports = function(changeEvent) {
  /*
    A Database Trigger will always call a function with a changeEvent.
    Documentation on ChangeEvents: https://www.mongodb.com/docs/manual/reference/change-events

    Access the _id of the changed document:
    const docId = changeEvent.documentKey._id;

    Access the latest version of the changed document
    (with Full Document enabled for Insert, Update, and Replace operations):
    const fullDocument = changeEvent.fullDocument;

    const updateDescription = changeEvent.updateDescription;

    See which fields were changed (if any):
    if (updateDescription) {
      const updatedFields = updateDescription.updatedFields; // A document containing updated fields
    }

    See which fields were removed (if any):
    if (updateDescription) {
      const removedFields = updateDescription.removedFields; // An array of removed fields
    }

    Functions run by Triggers are run as System users and have full access to Services, Functions, and MongoDB Data.

    Access a mongodb service:
    const collection = context.services.get("mongodb-atlas").db("testRealmSync").collection("testRealm");
    const doc = collection.findOne({ name: "mongodb" });

    Note: In Atlas Triggers, the service name is defaulted to the cluster name.

    Call other named functions if they are defined in your application:
    const result = context.functions.execute("function_name", arg1, arg2);

    Access the default http client and execute a GET request:
    const response = context.http.get({ url: <URL> })

    Learn more about http client here: https://www.mongodb.com/docs/atlas/app-services/functions/context/#context-http
  */
  
  const fullDocument = changeEvent.fullDocument;
  if (fullDocument === undefined) { return; }
  const collection = context.services.get("mongodb-atlas").db("testRealmSync").collection("User");
  console.log(JSON.stringify(fullDocument))
  for (const value of fullDocument.data) {
    console.log(JSON.stringify(value))
    collection.insertOne(value)
  }
  //collection.insertOne(fullDocument);
  return;
};
