// This function is the endpoint's request handler.
exports = function({
    query,
    headers,
    body
}, response) {
    // Data can be extracted from the request as follows:

    // Query params, e.g. '?arg1=hello&arg2=world' => {arg1: "hello", arg2: "world"}
    const {
        arg1,
        arg2
    } = query;

    // Headers, e.g. {"Content-Type": ["application/json"]}
    const contentTypes = headers["Content-Type"];

    // Raw request body (if the client sent one).
    // This is a binary object that can be accessed as a string using .text()
    const reqBody = body;

    try {

        // console.log(JSON.stringify(body));

        const jwt = require("jsonwebtoken");

        const token = headers["Authorization"];

        if (!token) {
            response.setStatusCode(403);
            response.setBody(JSON.stringify({
                status: "false",
                message: "No token provided!"
            }));
        } else {
            try {
                //const bodyin = JSON.parse(body.text());
                if (body === undefined) {
                    response.setStatusCode(400);
                    response.setBody(JSON.stringify({
                        status: "false",
                        message: "Bad Request.",
                        // id: ''
                        name: ''//M
                    }));
                    return;
                }

                let reqData = JSON.parse(body.text());

                const options = {
                    "upsert": true //M
                };

                const query = {
                    //"_id": BSON.ObjectId(reqData._id),
                    "name": reqData.name//M
                };

                const geofence = {};

                geofence.name = reqData.name,
                    geofence.address = reqData.address,
                    geofence.latitude = reqData.latitude,
                    geofence.longitude = reqData.longitude,
                    geofence.radius = reqData.radius,
                    geofence.radiusUnit = reqData.radiusUnit,
                    geofence.duration = reqData.duration,
                    geofence.status = reqData.status,
                    geofence.wearerId = reqData.wearerId,
                    geofence.days = reqData.days

                const {
                    // insertedId
                    insertName//M
                } = context.services
                    .get("mongodb-atlas")
                    .db("testRealmSync")
                    .collection("geofences")
                    .updateOne(query, geofence, options);

                response.setStatusCode(200);

                response.setBody(JSON.stringify({
                    status: "true",
                    message: "Geofence updated successfully",
                    // id: reqData._id
                    name: reqData.name
                }));
            } catch (err) {
                response.setStatusCode(401);
                response.setBody(JSON.stringify({
                    status: "false",
                    message: 'Unauthorized!'
                }));
            }
        }
    } catch (error) {
        response.setStatusCode(500);
        response.setBody(JSON.stringify({
            status: "false",
            message: error.message,
            // id: ''
            name:''//M
        }));
    }

};