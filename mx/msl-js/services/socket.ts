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

//setupEmptyCallback
//Used to handle the initial .onmessage that might come from a socket *before* any message is sent.
const setupEmptyCallback = function (socket: WebSocket, notifyElement: HTMLElement) {
  //using "" as message reflects that we did not send any message.
  setupMessageCallback(socket, "", notifyElement, true)
}

//setupMessageCallback
//Used to handle the .onmessage event from a socket *after* a message is sent.
const setupMessageCallback = function (socket: WebSocket, message: string, notifyElement: HTMLElement, echo: boolean, sendingSocket: WebSocket = socket) {

  socket.onmessage = function (event: Event) {

    const receivedMessage: string = event.data;

    //Debug Info
    mx.debug.echo(false);
    mx.debug.log(`λ ${notifyElement.localName} ${socket.key} ${message} => ${receivedMessage}`);

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
        "response": receivedMessage,
        "socket": socket,
        "sender": sendingSocket
      }
    }

    //Notify the sender of the received message.
    notify(notifyElement, "message-received", notifyMessage);

    //If this listener received a message on a different wire than sent, re-attach original listener
    
    //Get names of the sockets
    let listeningKey = socket.key;
    let originalKey = sendingSocket.key;

    //Test if they are different
    if (listeningKey != originalKey) {

      //Re-attach original listener
      setupEmptyCallback(socket,socket.creator);

    }

  };
}

//sendSingleMessage (exposed through .mxSend on the socket)
//Send a single message over a websocket w/ a per-message callback
const sendSingleMessage = function (socket: WebSocket, message: string, notifyElement: HTMLElement, echo: boolean) {

  //Setup message received callback
  setupMessageCallback(socket, message, notifyElement, echo);

  //For MSL wires, also listen on admin.
  if (socket.port.type.toLowerCase() == "msl") {

    //Get this socket's machineKey
    let machineKey = socket.machineKey;

    // Find admin port on this machine
    let adminPort = mx.machine.findInMachine(machineKey,"admin");

    // Find admin socket in active connections
    let adminSocketKey = `${machineKey}-${adminPort}`;
    let adminSocket = connections[adminSocketKey];

     //Setup message received callback on admin port
    setupMessageCallback(adminSocket, message, notifyElement, echo, socket);
  }

  //Send message if not blank (Blank sets up receiver w/o sending.)
  if (message != "") {
    socket.send(message)
  }

};

//socketMachineKey
//Gets machineKey from socket
const socketMachineKey = (socketKey: string) => connections[socketKey].machineKey;

//socketPortKey
//Gets portKey from socket
const socketPortKey = (socketKey: string) => connections[socketKey].portKey;

//socketMachine
//Gets machine from socket
const socketMachine = (socketKey: string) => mx.machine.list[socketMachineKey(socketKey)];

//socketPort
//Gets port from socket
const socketPort = (socketKey: string) => mx.machine.ports[socketPortKey(socketKey)];




//PUBLIC FUNCTIONS

//connect
//Connect to a WebSocket on a machine.
const connect = function (machineKey: string, portKey, notifyElement: HTMLElement) {

  let portKeyList = portKey;



  //Handle single port (vs array) 
  if (portKey.constructor.name == "String") {
    portKeyList = [portKey];
  }


  //Open all requested ports
  for (let portKeyIndex in portKeyList) {

    //portKey of one port to connect to
    let portKey = portKeyList[portKeyIndex];

    mx.debug.log("connecting to", machineKey, portKey);

    //Create a socket key to track in connections
    let socketKey = `${machineKey}-${portKey}`;

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
    mx.debug.log("socket url", socketURL);


    //Create new socket or access existing one
    let socket: WebSocket = connections[socketKey];

    //Connect or grab existing connection
    if (socket) {
      mx.debug.log("already connected to", socketKey)
    }
    else {
      mx.debug.log("opening socket", socketKey);
      //Create new socket
      socket = new WebSocket(socketURL);
    };


    //Setup open callback
    socket.onopen = function () {
      mx.debug.log("connected", socketKey);
      connections[socketKey] = socket;

      //Notify the calling component socket that status has changed
      notify(notifyElement, "status-changed", connections);
    };

    //Setup close callback
    socket.onclose = function () {
      mx.debug.log("closed", socketKey);
      delete connections[socketKey];

      //Notify the calling component socket that status has changed
      notify(notifyElement, "status-changed", connections);

    }


    //Add mxSend function 
    WebSocket.prototype.mxSend = mxSend;

    //Add machine and port 
    socket.machineKey = machineKey;
    socket.portKey = portKey;
    socket.machine = mx.machine.list[machineKey];
    socket.port = mx.machine.ports[portKey];
    socket.key = socketKey;

  }


  //Return 
  return true;

}


const mxSend = function (message: string, componentToNotify: HTMLElement, echo: boolean = false) {
  sendSingleMessage(this, message, componentToNotify, echo);
}

const socketKeys = function (): string[] {
  return Object.keys(connections);
};


const connectAll = function (machineKey, notifyElement) {
  connect(machineKey, mx.machine.list[machineKey].ports, notifyElement);
}


const initSocket = function (socket: WebSocket, notifyElement: HTMLElement) {

  //Remember socket creator
  socket.creator = notifyElement;
  setupEmptyCallback(socket, notifyElement);
}

//Service Definition

export const socket = {
  connect: connect,
  connectAll: connectAll,
  init: initSocket,
  list: connections,
  keys: socketKeys()
};
