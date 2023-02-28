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
        console.log(JSON.stringify(body));
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

                const deviceData = {};

                deviceData.id = reqData.id;
                deviceData.device_id = reqData.device_id;
                deviceData.alert = reqData.alert;
                deviceData.product_type = reqData.product_type;
                deviceData.created = reqData.created
                deviceData.origin_request_id = reqData.origin_request_id;
                deviceData.data = reqData.data;
                deviceData.dataSize = reqData.dataSize;

                const {
                    insertedId
                } = context.services
                    .get("mongodb-atlas")
                    .db("testRealmSync")
                    .collection("jsonmessages")
                    .insertOne(deviceData);

                response.setStatusCode(201);

                response.setBody(JSON.stringify({
                    status: "true",
                    message: "DeviceData added successfully",
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