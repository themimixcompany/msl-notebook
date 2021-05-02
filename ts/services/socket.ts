// MSL.js Socket Service
// by The Mimix Company

// Provides access to a websocket for sending and receiving harnessed messages.

//MSL.js Services
import * as mx from '/ts/services/machine.ts'

//SERVICE CONSTANTS

//WebSocket States
const status = {
  "connecting": 0,
  "open": 1,
  "closing": 2,
  "closed": 3
};

//Active Sockets
let activeSockets = {};

//PUBLIC FUNCTIONS

//connect
//Connect to a WebSocket on a machine.
const connect = function(machineKey, portKey) {

  console.log("connecting", machineKey, portKey);

      // //Quit if user is already connected to this machine and type
      // if (USER.sockets[type]) {
      //   if (USER.sockets[type][machineKey]) {
      //     mxDebug("mslWebSocket user already connected to", machineKey, type);
      //     return;
      //   }
      // }

      //Get machine & port
      let thisMachine = mx.machine.list[machineKey];
      let thisPort = mx.machine.ports[portKey];

      //Quit if no matching machine
      if (!thisMachine) {
        console.log("quit, no machine");
        return false;
      }

      //Quit if the port isn't listed for this machine
      if (thisMachine.ports.indexOf(portKey) == -1) {
        console.log("quit, no port");
        return false;
      }

      //Handle ports
      let portString = ""; //assume no portString
      if (thisPort.port) {
        portString = ":" + thisPort.port;
      }

      //Finalize URL
      var socketURL = thisPort.protocol + "://" + thisMachine.ip + portString;
      console.log(socketURL);

      //Create a key to track in activeSockets
      let socketKey = `${machineKey}-${portKey}`;

      //Never connected? Create new WebSocket and store in activeSockets.
        if (!activeSockets[socketKey]) {
          console.log("connected",socketKey);
          activeSockets[socketKey] = new WebSocket(socketURL);
    }

      //Previously closed? Reconnect.
      if (activeSockets[socketKey].readyState == status.closed) {
        console.log("reconnect",socketKey);
        activeSockets[socketKey] = new WebSocket(socketURL); //previously closed; reopen
      };

      //Return live socket.
      return activeSockets[socketKey];
    }


//Service Definition

export const socket = {
 connect: connect,
 list: activeSockets
};
