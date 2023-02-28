exports = async function onUserCreation(user) {
    const customUserDataCollection = context.services
        .get("mongodb-atlas")
        .db("testRealmSync")
        .collection("userLogin");
    try {
        let facebookId = "";
        let googleId = "";
        console.log("Logs here", JSON.stringify(user));
        if (user.providers[0] == "oauth2-google") {
            googleId = user.user.id;
        }

        if (user.providers[0] == "oauth2-facebook") {
            facebookId = user.user.id;
        }

        await customUserDataCollection.insertOne({
            google_id: googleId,
            facebook_id: facebookId,
            email: user.user.data.email,
            isLoggedin: "true",
            createdAt: user.time,
            logginType: user.providers[0]
        });
        console.log("Entered into Insert function");
    } catch (e) {
        console.error(`Failed to create custom user data document for user:${user.id}`);
        throw e
    }
}