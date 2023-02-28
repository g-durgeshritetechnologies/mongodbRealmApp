exports = function({
    query,
    headers,
    body
}, response) {
    const {
        arg1,
        arg2
    } = query;

    try {
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
                const tokenString = token[0].split(" ");
                let finalToken = tokenString[1];
                console.log(finalToken);
                var decoded = jwt.verify(finalToken, '123456789weartech123456789');

                if (body === undefined) {
                    response.setStatusCode(400);
                    response.setBody(JSON.stringify({
                        status: "false",
                        message: "Bad Request.",
                        id: ''
                    }));
                    return;
                }

                let reqData = JSON.parse(body.text());

                const geofence = {};

                geofence.name = reqData.name,
                    geofence.address = reqData.address,
                    geofence.latitude = reqData.latitude,
                    geofence.longitude = reqData.longitude,
                    geofence.radius = reqData.radius,
                    geofence.radiusUnit = reqData.radiusUnit,
                    geofence.duration = reqData.duration,
                    geofence.status = 'active',
                    geofence.wearerId = reqData.wearerId,
                    geofence.createdBy = query.userId,
                    geofence.days = reqData.days,
                    geofence.createdAt = new Date()

                const {
                    insertedId
                } = context.services
                    .get("mongodb-atlas")
                    .db("testRealmSync")
                    .collection("geofences")
                    .insertOne(geofence);

                response.setStatusCode(201);

                response.setBody(JSON.stringify({
                    status: "true",
                    message: "Geofence added successfully",
                    id: insertedId
                }));


            } catch (err) {
                response.setStatusCode(401);
                response.setBody(JSON.stringify({
                    status: "false",
                    message:'Unauthorized!'
                }));
            }
        }

    } catch (error) {
        response.setStatusCode(500);
        response.setBody(JSON.stringify({
            status: "false",
            message: error.message,
            id: ''
        }));
    }
};