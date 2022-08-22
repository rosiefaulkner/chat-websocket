///////////////////////////////////////////////
///////////// IMPORTS + VARIABLES /////////////
///////////////////////////////////////////////

const http = require("http");
const CONSTANTS = require("./utils/constants.js");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

// Define constants
const { PORT, CLIENT } = CONSTANTS;

///////////////////////////////////////////////
///////////// HTTP SERVER LOGIC ///////////////
///////////////////////////////////////////////

// Create the HTTP server
const server = http.createServer((req, res) => {
  // get the file path from req.url, or '/public/index.html' if req.url is '/'
  const filePath = req.url === "/" ? "/public/index.html" : req.url;

  // determine the contentType by the file extension
  const extname = path.extname(filePath);
  let contentType = "text/html";
  if (extname === ".js") contentType = "text/javascript";
  else if (extname === ".css") contentType = "text/css";

  // pipe the proper file to the res object
  res.writeHead(200, { "Content-Type": contentType });
  fs.createReadStream(`${__dirname}/${filePath}`, "utf8").pipe(res);
});

///////////////////////////////////////////////
////////////////// WS LOGIC ///////////////////
///////////////////////////////////////////////

// Create the WebSocket Server using the HTTP server
const wsServer = new WebSocket.Server({ server });

// Respond to connection events
wsServer.on("connection", (socket) => {
  console.log("New connection!");
  socket.on("message", (data) => {
    broadcast(data, socket);
  });
});

///////////////////////////////////////////////
////////////// HELPER FUNCTIONS ///////////////
///////////////////////////////////////////////

// Broadcast messages received to all other clients
function broadcast(data, socketToOmit) {
  // Implement the broadcast pattern. Exclude the emitting socket
  // Iterate over all clients connected to wsServer
  wsServer.clients.forEach((connectedClient) => {
    // check if the connection is open AND is not the emitting socket.
    if (
      connectedClient.readyState === WebSocket.OPEN &&
      connectedClient !== socketToOmit
    ) {
      // if so, send the broadcast message
      connectedClient.send(data);
    }
  });
}

// Start the server listening on localhost:8080
server.listen(PORT, () => {
  console.log(`Listening on: http://localhost:${server.address().port}`);
});
