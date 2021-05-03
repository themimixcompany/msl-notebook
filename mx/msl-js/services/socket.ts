// MSL.js Socket Service
// by The Mimix Company

// Provides access to a websocket for sending and receiving harnessed messages.

//MSL.js Services
import {machine} from 'msl-js/services/machine'


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

//PRIVATE FUNCTIONS

//notify
//Send an event to a web component or HTML element
const notify = function(eventTarget:HTMLElement, name:string, payload:any) {

  //create event
  let notifyEvent = new CustomEvent(name);

  //attach payload
  notifyEvent.payload = payload;

  //dispatch
  eventTarget.dispatchEvent(notifyEvent);
};

//PUBLIC FUNCTIONS

//connect
//Connect to a WebSocket on a machine.
const connect = function(machineKey:string, portKey:string, componentToNotify:HTMLElement) {

  console.log("connecting to", machineKey, portKey);

      // //Quit if user is already connected to this machine and type
      // if (USER.sockets[type]) {
      //   if (USER.sockets[type][machineKey]) {
      //     mxDebug("mslWebSocket user already connected to", machineKey, type);
      //     return;
      //   }
      // }

      //Get machine & port
      let thisMachine = machine.list[machineKey];
      let thisPort = machine.ports[portKey];

      //Quit if no matching machine
      if (!thisMachine) {
        console.log("quit, no machine");
        return false;
      }

      //Quit if no matching port
      if (!thisPort) {
        console.log("quit, no port");
        return false;
      }

      //Quit if the port isn't listed for this machine
      if (!thisMachine.ports.includes(portKey)) {
        console.log("quit, no port on this machine");
        return false;
      }

      //Handle ports
      let portString = ""; //assume no portString
      if (thisPort.port) {
        portString = ":" + thisPort.port;
      }

      //Finalize URL
      const socketURL = thisPort.protocol + "://" + thisMachine.ip + portString;
      console.log(socketURL);

      //Create a key to track in activeSockets
      let socketKey = `${machineKey}-${portKey}`;

      //Not connected? Create new WebSocket and store in activeSockets.
        if (!activeSockets[socketKey] || activeSockets[socketKey].readyState == status.closed) {
          console.log("opening socket",socketKey);

          //Create new socket
          let newSocket = new WebSocket(socketURL);

          //Setup open callback
          newSocket.onopen = function() {
                console.log("connected",socketKey);
                activeSockets[socketKey] = newSocket;

                //Let other components know status has changed
                notify(componentToNotify,"status-changed",activeSockets);
               };

          //Setup close callback
          newSocket.onclose = function() {
              console.log("closed",socketKey);
              delete activeSockets[socketKey];

              //Let other components know status has changed
              notify(componentToNotify,"status-changed",activeSockets);

          }

    }

      //Previously closed? Reconnect.
      if (activeSockets[socketKey] && activeSockets[socketKey].readyState == status.closed) {
        console.log("reconnect",socketKey);
        activeSockets[socketKey] = new WebSocket(socketURL); //previously closed; reopen
      };

      //Return live socket.
      return activeSockets[socketKey];

    }


const socketKeys = function ():string[] {
  return Object.keys(activeSockets);
}

//Service Definition

export const socket = {
 connect: connect,
 list: activeSockets,
 keys: socketKeys()
};
