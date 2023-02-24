// This function is the endpoint's request handler.
exports = async function({
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
        // console.log(JSON.stringify(name));

        const jwt = require("jsonwebtoken");

        const token = headers["Authorization"];

        const projection = {
            "_id": 0
        };

        if (!token) {
            response.setStatusCode(403);
            response.setBody(JSON.stringify({
                status: "false",
                message: "No token provided!"
            }));
        } else {
            try {
                let condition = {}
                // console.log(req.query);
                if (query) {
                    if (query.user_id) {
                        condition.createdBy = query.user_id;
                    }
                    if (query._id) {
                        condition._id = query._id;
                    }

                    if (query.wearerId) {
                        condition.wearerId = BSON.ObjectId(query.wearerId);
                    }
                    if(query.name){
                      condition.name = query.name;
                    }
                }

                var resultData = await context.services
                    .get("mongodb-atlas")
                    .db("testRealmSync")
                    .collection("geofences")
                    .find(condition, projection).toArray();

                response.setStatusCode(200);

                response.setBody(JSON.stringify({
                    status: "true",
                    message: "Get geofence successfully",
                    data: resultData,
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
            data: []
        }));
    }
};