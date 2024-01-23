import { EventEmitter } from 'emitter'
import WebSocket from 'ws';

import { findUser } from "./db/db";
import main from "./NewPoolFinder";
import mainBurn from "./NewBurnFinder";
import mainRugpull from './RugPullFinder';
const eventEmitter = new EventEmitter();

eventEmitter.setMaxListeners(999);

const MAX_CONNECTIONS_PER_USER = 2;
const userConnections = new Map();
const AUTH_HEADER_KEY = 'authorization';
const newPoolSubscriptions = new Map();
const newBurnSubscriptions = new Map();
const rugPullSubscriptions = new Map();

const wss = new WebSocket.Server({
  port: Number(process.env.PORT),
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 999, // Limits zlib concurrency for perf.
    threshold: 1024 // Size (in bytes) below which messages
    // should not be compressed if context takeover is disabled.
  }
});



wss.on('connection', (ws, req) => {
  const authHeader = req.headers[AUTH_HEADER_KEY];
  const path = req.url;

  // Check if the client has the correct authentication token


  const endPoint = path.split('/subscribe/')[1]
  //console.log('Requested Endpoint ' + endPoint);


  if (!authHeader) {
    //console.log('User authHeader not provided. Closing connection.');
    ws.close();
    return;
  }


  findUser(authHeader).then((result: any) => {


    if (!result) {
      //console.log('No Subscription ');
      ws.send('No Subscription found');
      ws.close();
      return;
    };

    const userId = 'shree';//result.userId;
    //console.log(result);
    const userConnectionCount = userConnections.get(userId) || 0;
    if (userConnectionCount < MAX_CONNECTIONS_PER_USER) {
      // Connection is authenticated and within the limit

      // Increment the connection count for the user 
      userConnections.set(userId, userConnectionCount + 1);

      //console.log(`User ${userId} authenticated with ${userConnectionCount + 1} connection(s)`);

      ws.send(' Authenticated for new Pools ' + endPoint);

      // Store the WebSocket session for the user
      if (endPoint == 'newPools')
        newPoolSubscriptions.set(`${userId}_${userConnectionCount}`, ws);
      if (endPoint == 'newBurns')
        newBurnSubscriptions.set(`${userId}_${userConnectionCount}`, ws);
      if (endPoint == 'rugPulls')
        rugPullSubscriptions.set(`${userId}_${userConnectionCount}`, ws);



      // Handle messages from authenticated clients
      ws.on('message', (message) => {
        //console.log(`Received message from authenticated client (user: ${userId}): ${message}`);

        // Sending a message to a specific user (change the userId accordingly)
        const specificUserWebSocket = newPoolSubscriptions.get(`${userId}_1`); // assuming you want to send to the first connection
        if (specificUserWebSocket && specificUserWebSocket.readyState === WebSocket.OPEN) {
          specificUserWebSocket.send(`Private message from server: ${message}`);
        }
      });

      // Handle the connection close event
      ws.on('close', () => {
        // Decrement the connection count for the user when a connection is closed

        userConnections.set(userId, userConnectionCount - 1);

        console.log(`Connection closed for user ${userId}. Remaining connections: ${userConnectionCount - 1}`);
      });
    } else {
      // Connection is authenticated, but the user has reached the connection limit
      ws.send(`User ${userId} has reached the maximum connection limit. Closing connection.`);
      ws.close();
    }
  })
  // Check the number of existing connections for the user



});


eventEmitter.on('newListener', (event: string, listener: any) => {
  console.log(`Added  ${event.toUpperCase()} listener.`);
});


eventEmitter.on('NewPool', async (ammPool: string) => {
  console.log('Recieved NewPool');
  console.log(ammPool);
  newPoolSubscriptions.forEach(conn => {
    const specificUserWebSocket = conn; // assuming you want to send to the first connection
    if (specificUserWebSocket && specificUserWebSocket.readyState === WebSocket.OPEN) {
      specificUserWebSocket.send(ammPool);
    }
  })
});


eventEmitter.on('NewBurn', async (ammPool: string) => {
  console.log('Recieved NewBurn');
  console.log(ammPool);

  newBurnSubscriptions.forEach(conn => {
    const specificUserWebSocket = conn; // assuming you want to send to the first connection
    if (specificUserWebSocket && specificUserWebSocket.readyState === WebSocket.OPEN) {
      specificUserWebSocket.send(ammPool);
    }
  })
});
eventEmitter.on('RugPull', async (ammPool: string) => {
  console.log('Recieved RugPull');
  console.log(ammPool);
  rugPullSubscriptions.forEach(conn => {
    const specificUserWebSocket = conn; // assuming you want to send to the first connection
    if (specificUserWebSocket && specificUserWebSocket.readyState === WebSocket.OPEN) {
      specificUserWebSocket.send(ammPool);
    }
  })
});




eventEmitter.on('Disconnected', (message: string) => {
  console.log('Disconnected -- need to restart ' + message.toUpperCase());
  eventEmitter.removeAllListeners();
});


//main(eventEmitter);
mainBurn(eventEmitter);
//mainRugpull(eventEmitter);