exports = function({
    query,
    headers,
    body
}, response) {
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
                context.services
                    .get("mongodb-atlas")
                    .db("testRealmSync")
                    .collection("geofences")
                    .deleteOne({
                        // _id: BSON.ObjectId(query._id)
                        name: query.name//M
                    });
                response.setStatusCode(200);

                response.setBody(JSON.stringify({
                    status: "true",
                    message: "Geofence removed successfully",
                    // id: query._id
                    name: query.name//M
                }));
                // console.log(query.name);
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
            message: "Nothing to remove",
            // id: ''
            name: ''//M
        }));
    }
};