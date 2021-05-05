// MSL.js Socket Service
// by The Mimix Company

// Provides access to a websocket for sending and receiving messages with individual (per)

//MSL.js Services
import * as mx from 'msl-js/service-loader'


//SERVICE CONSTANTS


//WebSocket States
const status = {
  "connecting": 0,
  "open": 1,
  "closing": 2,
  "closed": 3
};

//Active Sockets
let connections = {};

//PRIVATE FUNCTIONS

//notify
//Send an event to a web component or HTML element
const notify = function (notifyElement: HTMLElement, eventName: string, payload: any) {

  //create event
  let notifyEvent = new CustomEvent(eventName);

  //attach payload
  notifyEvent.payload = payload;

  //dispatch
  notifyElement.dispatchEvent(notifyEvent);
};

//sendSingleMessage (exposed through .mxSend on the socket)
//Send a single message over a websocket w/ a per-message callback
const sendSingleMessage = function (socket: WebSocket, message: string, notifyElement: HTMLElement, echo: boolean) {

  //Setup message received callback
  socket.onmessage = function (event: Event) {

    const receivedMessage: string = event.data;

    //Debug Info
    mx.debug.echo(false);
    mx.debug.log("PMCS",receivedMessage);

    //Save Received Message in History
    //history[messageNumber][messageReceivePosition] = receivedMessage;

    //Interpret MSL (Check for (@VER), for example)
    //var isValidMSL = mslParser.parse(receivedMessage);

    //Setup Notify Message
    let notifyMessage: string | Object

    //Simple reply; no message echo
    notifyMessage = receivedMessage;

    //Echo? JSON reply; original message & response
    if (echo) {
      notifyMessage = {
        "message": message,
        "response": receivedMessage
      }
    }

    //Notify the sender of the received message.
    notify(notifyElement, "message-received", notifyMessage);

  };

  //Send message
  socket.send(message)

};

//socketMachineKey
//Gets machineKey from socket
const socketMachineKey = (socketKey:string) => connections[socketKey].machineKey; 

//socketPortKey
//Gets portKey from socket
const socketPortKey = (socketKey:string) => connections[socketKey].portKey;

//socketMachine
//Gets machine from socket
const socketMachine = (socketKey:string) => mx.machine.list[socketMachineKey(socketKey)];

//socketPort
//Gets port from socket
const socketPort = (socketKey:string) => mx.machine.ports[socketPortKey(socketKey)];




//PUBLIC FUNCTIONS

//connect
//Connect to a WebSocket on a machine.
const connect = function (machineKey: string, portKey: string, notifyElement: HTMLElement) {

  mx.debug.log("connecting to", machineKey, portKey);

  // //Quit if user is already connected to this machine and type
  // if (USER.sockets[type]) {
  //   if (USER.sockets[type][machineKey]) {
  //     mxDebug("mslWebSocket user already connected to", machineKey, type);
  //     return;
  //   }
  // }

   //Create a socket key to track in connections
   let socketKey = `${machineKey}-${portKey}`;

  //Quit if already connected to this port
  if (connections[socketKey]) {
    mx.debug.log("already connected to", socketKey);
    return connections[socketKey];
  }

  //Find machine & port on master lists
  let connectMachine = mx.machine.list[machineKey];
  let connectPort = mx.machine.ports[portKey];

  //Quit if no matching machine
  if (!connectMachine) {
    mx.debug.log("connect quit, no machine");
    return false;
  }

  //Quit if no matching port
  if (!connectPort) {
    mx.debug.log("connect quit, no port");
    return false;
  }

  //Quit if the port isn't listed for this machine
  if (!connectMachine.ports.includes(portKey)) {
    mx.debug.log("connect quit, no port on this machine");
    return false;
  }

  //Handle port section of URL
  let portString = ""; //assume no portString
  if (connectPort.port) {
    portString = ":" + connectPort.port;
  }

  //Finalize URL
  const socketURL = connectPort.protocol + "://" + connectMachine.ip + portString;
  mx.debug.log("socket url",socketURL);

  //Not connected? Create new WebSocket and store in connections.
  if (!connections[socketKey] || connections[socketKey].readyState == status.closed) {
    mx.debug.log("opening socket", socketKey);

    //Create new socket
    let newSocket = new WebSocket(socketURL);

    //Setup open callback
    newSocket.onopen = function () {
      mx.debug.log("connected", socketKey);
      connections[socketKey] = newSocket;

      //Add getMachine and getPort functions
      //WebSocket.prototype.getMachine = socketMachine(socketKey);
      WebSocket.prototype.port = socketPort(socketKey);
      WebSocket.prototype.machine = socketPort(socketKey);

      //Notify the calling component socket that status has changed
      notify(notifyElement, "status-changed", connections);
    };

    //Setup close callback
    newSocket.onclose = function () {
      mx.debug.log("closed", socketKey);
      delete connections[socketKey];

      //Notify the calling component socket that status has changed
      notify(notifyElement, "status-changed", connections);
    }

    //Add mxSend function 
    WebSocket.prototype.mxSend = function (message: string, componentToNotify: HTMLElement, echo: boolean = false) {
      sendSingleMessage(this, message, componentToNotify, echo);
    }

    //Add machineKey and portKey
    WebSocket.prototype.machineKey = machineKey;
    WebSocket.prototype.portKey = portKey;

  }

  //Return live socket.
  return connections[socketKey];

}


const socketKeys = function (): string[] {
  return Object.keys(connections);
};



//Service Definition

export const socket = {
  connect: connect,
  list: connections,
  keys: socketKeys(),
  machine: socketMachine,
  port: socketPort
};
