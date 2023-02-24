exports = async function(changeEvent) {
  let alert = {};
	let payload = {};
  alert = {"title": 'Matt' + " - " + 'Fall Detection',
					 "body": '2 Fall Detection' + "\n" + 'Time Sensitive',
					};
					payload = {
										"title": 'Matt' + " - " + 'Fall Detection',
										"message": '2 Fall Detection' + "\n" + 'Time Sensitive',
										"alertType": '2',
										"wearerID": '123456',
										"deviceCordinates": 'Latitude',
										"notification_id": '1234'
									};
  const deviceToken = "DAAF137D63A61E6F2F7F133506C8CF08577E456FE59E1478FF433930C94EF9C4";
  await sendAPNPushNotification(deviceToken,alert, payload);
// api();
 console.log("Execution Finished");
 const dateObject = new Date();
console.log("After Execution Finished",dateObject);
};


async function sendAPNPushNotification(deviceToken, alert, payload) {
	console.log("sendAPNPushNotification Called");
	var apns2 = require('apns2');//M
  const dateObject = new Date();
  console.log("BlobRequest",dateObject);
	const {
		BlobServiceClient
	} = require('@azure/storage-blob');

	const blobServiceClient = new BlobServiceClient(
		"https://encryptedfiles.blob.core.windows.net"
	);

	const containerClient = blobServiceClient.getContainerClient("testcontainer");

	// create blob client
	const blobClient = await containerClient.getBlobClient("AuthKey_VJ5854JA3K.p8");

	//blobClient.downloadToFile("/key.p8");

	const downloadResponse = await blobClient.download();
	//console.log(JSON.stringify(downloadResponse));
  const blobResponse = new Date();
  console.log("BlobResponse",blobResponse);
	var res = await new Promise((resolve, reject) => {
		const chunks = [];
		downloadResponse.readableStreamBody.on('data', (data) => {
			chunks.push(data instanceof Buffer ? data : Buffer.from(data));
		});
		downloadResponse.readableStreamBody.on('end', () => {
			resolve(Buffer.concat(chunks));
		});
		downloadResponse.readableStreamBody.on('error', reject);
	});

	console.log(JSON.stringify(res));
	//console.log('Downloaded blob content:', res.toString());

  const beforeApn = new Date();
  console.log("beforeApn",beforeApn);
	var options = {
		token: {
			//cert: "./secret/keyProduction.pem",
			key: res,
			keyId: "VJ5854JA3K",
			teamId: "L4Y73Q83KU"
		},
		production: true
	};

	var apns2Provider = new apns2.Provider(options);//M

	//apnProvider.client.config.token.current = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlZKNTg1NEpBM0sifQ.eyJpYXQiOjE2NzIyMTYyMDQsImlzcyI6Ikw0WTczUTgzS1UifQ.gMVYzcvgZHcGwJLq3jrf8aWtyWiOYLy6Eto9WnyPBo0188qUfFf8G2FjiAk3ucErprxvxeBrqL7T_q4BmQdUEw";
	console.log(JSON.stringify(apns2Provider));
	console.log(JSON.stringify(apns2Provider.client.config.token.current));

	var note = new apns2.Notification();//M

	note.expiry = Math.floor(Date.now() / 1000) + 3600;
	note.badge = 3;
	note.sound = "ping.aiff";
	note.alert = alert;
	note.payload = payload,
  note.topic = "com.weartech.mahi";
	console.log(JSON.stringify(payload));
	console.log(JSON.stringify(deviceToken));
	const tokens = [];
  tokens[0]= deviceToken;
	await apns2Provider.send(note, tokens);//M
	
	const afterApn = new Date();
  console.log("afterApn",afterApn);
	//apnProvider.shutdown();
	//const aftershutdown = new Date();
  //console.log("aftershutdown",aftershutdown);
  
}

function api()
{
  var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
  var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() { 
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open( "GET", aUrl, true );
        anHttpRequest.setRequestHeader("x-api-key","df65g4df64h6d1gh3c21gh4f6ugdfertrty");
        anHttpRequest.setRequestHeader("x-access-token","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2I1Mjg4NDg1YzU0NjQ5ZjU0ZDJmOTIiLCJlbWFpbCI6ImR1cmdlc2hAZGlzcG9zdGFibGUuY29tIiwiaWF0IjoxNjcyODE2NzcyLCJleHAiOjE2NzU0MDg3NzJ9.fnVIqtkZCu3ehlI4J2eI9bCivli0w2zi-IbtEZ9Dd0A");
        anHttpRequest.send( null );
    }
}

const beforeApi = new Date();
console.log("beforeApi",beforeApi);
var client = new HttpClient();
var url = "http://ec2-3-144-134-249.us-east-2.compute.amazonaws.com:8080/api/geofence";
var params = "wearerId=6195d3c8d709bd0e45f21bbd";
client.get(url+"?"+params, function(response) {
    console.log("RES",JSON.stringify(response));
    const afterApi = new Date(); 
    console.log("afterApi",afterApi);
});

}

