// MSL.js Socket Service
// by The Mimix Company

// Provides access to a websocket for sending and receiving messages with individual (per message) callbacks.

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
const notify = function (notifyElement, eventName: string, payload: any) {

  //create event
  let notifyEvent = new CustomEvent(eventName);

  //attach payload
  notifyEvent.payload = payload;

  //dispatch
  notifyElement.dispatchEvent(notifyEvent);
};

//MESSAGE SENDING & CALLBACK SETUP

//setupEmptyCallback
//Used to handle the .onmessage that might come from a socket *before* any message is sent.
const setupEmptyCallback = function (socket: WebSocket, notifyElement: HTMLElement, history?: {}[], messageNumber?) {

  //Handle history, if provided
  if (history) {


    //Find position in history or use provided
    if (messageNumber == undefined) {
      if (history.length == 0) {
        messageNumber = 0;
      } else {
        messageNumber = history.length - 1;
      }
    }


    //Get Message in History
    let historyItem = history[messageNumber];

    //If no history, create empty item
    if (!historyItem) {

      historyItem = {};

      //Save in history if new message
      history.push(historyItem);
    }

    //If no entry under the socketKey, create an empty one
    if (!historyItem[socket.key]) {
      historyItem[socket.key] = [""];
    }

    //Create a copy of history for notifyElement (triggers property updates there)
    let [...historyCopy] = history;

    //Notify component of history change;
    notify(notifyElement, "history-changed", historyCopy);

  }

  //using "" as message reflects that we did not send any message.
  setupMessageCallback(socket, "", notifyElement, true, socket, "", history)


}

//setupMessageCallback
//Used to handle the .onmessage event from a socket *after* a message is sent.
const setupMessageCallback = function (socket: WebSocket, message: string, notifyElement: HTMLElement, echo: boolean, sendingSocket: WebSocket = socket, relay: String = "false", history?: {}[]) {

  //Setup for messageNumber 
  let messageNumber;
  if (history) {
    messageNumber = history.length - 1;
  }

  socket.onmessage = function (event: Event) {

    const receivedMessage: string = event.data;

    //Debug Info
    mx.debug.echo(false);
    mx.debug.log(`λ ${notifyElement.localName} ${socket.key} ${message} => ${receivedMessage}`);

    //Handle history, if provided

    if (history) {

      //Get Message in History
      let historyItem = history[messageNumber];


      //If no array for this socketKey, add it
      if (!historyItem[socket.key]) {

        //brute force move to bottom
        let sendingSocketKey = sendingSocket.key;
        let sendingSocketItem = historyItem[sendingSocketKey];
        delete historyItem[sendingSocketKey];
        historyItem[sendingSocketKey] = sendingSocketItem;
        historyItem[socket.key] = [message];
      }

      //Save receiving socket and message
      historyItem[socket.key].push(receivedMessage);

      //Create a copy of history for notifyElement (triggers property updates there)
      let [...historyCopy] = history;

      //Notify component of history change;
      notify(notifyElement.connector, "history-changed", historyCopy);

    }

    //Interpret MSL (Check for (@VER), for example)
    //var isValidMSL = mslParser.parse(receivedMessage);

    //Setup Notify Message
    let notifyMessage: string | Object

    //Simple reply; no message echo
    notifyMessage = receivedMessage;

    //Echo? JSON reply; original message & response
    if (echo) {
      notifyMessage = {
        "sentMessage": message,
        "sentSocketKey": sendingSocket.key,
        "receivedMessage": receivedMessage,
        "receivedSocketKey": socket.key
      }
    }

    //Notify the sender of the received message.
    notify(notifyElement, "message-received", notifyMessage);

    //Relay if relay is set, not looping back to original machine, and active in connections
    if (relay && (relay != socket.relay) && connections[socket.relay]) {
      sendSingleMessage(connections[socket.relay], receivedMessage, notifyElement, echo, socket.key, history)
    }

    //If this listener received a message on a different wire than sent, re-attach original listener

    //Get names of the sockets
    let listeningKey = socket.key;
    let originalKey = sendingSocket.key;

    //Test if they are different
    if (listeningKey != originalKey) {

      //Re-attach original listener
      setupEmptyCallback(socket, socket.creator);

    }

  };
}

//sendSingleMessage (exposed through .mxSend on the socket)
//Send a single message over a websocket w/ a per-message callback
const sendSingleMessage = function (socket: WebSocket, message: string, notifyElement: HTMLElement, echo: boolean, relay: string, history: {}[] = []) {


  //Setup for messageNumber
  let messageNumber

  //Handle history
  if (history) {

    //Remember message number
    messageNumber = history.length;

    //Setup for new or existing historyItem
    let historyItem = {}


    //Check if this is the result of a relayed message (relay = original sender's socketKey)
    if (relay != "" && relay != "false" && socket.key != relay) {

      historyItem = history[messageNumber - 1]
      
      //Store this outgoing message under the socketKey
      historyItem[socket.key] = [message]

    } else {

      //Store this outgoing message under the socketKey
       historyItem[socket.key] = [message]


      //Add new item to end of history array
      history.push(historyItem)

     
    }

  }

  //Setup message received callback
  setupMessageCallback(socket, message, notifyElement, echo, socket, relay, history);

  //For MSL wires, also listen on admin.
  if (socket.port.type.toLowerCase() == "msl") {

    //Get this socket's machineKey
    let machineKey = socket.machineKey;

    // Find admin port on this machine
    let adminPort = mx.machine.findInMachine(machineKey, "admin");

    // Find admin socket in active connections
    let adminSocketKey = `${machineKey}-${adminPort}`;
    let adminSocket = connections[adminSocketKey];

    //Setup message received callback on admin port, if open
    if (adminSocket) {
      //setupEmptyCallback(adminSocket, notifyElement, history, messageNumber);
      setupMessageCallback(adminSocket, "", notifyElement, echo, socket, relay, history);

    }
  }

  //Send message if not blank (Blank sets up receiver w/o sending.)
  if (message != "") {
    socket.send(message)
  }

};

//UTILITY FUNCTIONS FOR DETERMINING MACHINES & SOCKETS

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

//CONNECT THE OUTSIDE
//Connect to a WebSocket on a machine.

const connect = function (machineKey: string, portKey, notifyElement: HTMLElement, groupPorts?) {


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

      //Store socket in active connections
      mx.debug.log("connected", socketKey);
      connections[socketKey] = socket;

      //Notify the calling component socket that status has changed

      notify(notifyElement, "status-changed", connections);

      //If this socket was opened as part of a relay group
      if (groupPorts) {

        //Construct a list of ports in the group w/o repeats
        let portArray: string[] = [];

        //Add each port in the group only once
        for (let relayPairIndex in groupPorts) {

          //Remember the pair
          let relayPair = groupPorts[relayPairIndex];

          //Extract the "from" socketKey and the relaySocketKey
          let [fromSocketKey, relaySocketKey] = relayPair;

          //Push fromSocketKey if new
          if (!portArray.includes(fromSocketKey)) {
            portArray.push(fromSocketKey);
          }

          //Push relaySocketKey if new
          if (!portArray.includes(relaySocketKey)) {
            portArray.push(relaySocketKey);
          }

        }


        //Test if all relay ports are open

        //Assume all open
        let isAllOpen = true;

        //Look through all relay ports
        for (let relayPortIndex in portArray) {

          //Remember port
          let relaySocketKey = portArray[relayPortIndex];

          //Look for port in open connections
          let relaySocket = connections[relaySocketKey]

          //If not open, set isAllOpen false
          if (!relaySocket) {
            isAllOpen = false;
          }

        }

        //If all open, add relays, if any
        if (isAllOpen) {


          //Add each relay in the group
          for (let relayPairIndex in groupPorts) {

            //Remember the pair
            let relayPair = groupPorts[relayPairIndex];

            //Extract the "from" socketKey and the relaySocketKey
            let [fromSocketKey, relaySocketKey] = relayPair;

            //Get the socket from active connections
            let fromSocket = connections[fromSocketKey]

            //Attach the relay
            fromSocket.relay = relaySocketKey;

          }

        }

      }
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

    //Turn off relay by default
    socket.relay = "";


  }


  //Return 
  return true;

}


const mxSend = function (message: string, componentToNotify: HTMLElement, echo: boolean = false, history: {}[] = []) {
  sendSingleMessage(this, message, componentToNotify, echo, "false", history);
}

const socketKeys = function (): string[] {
  return Object.keys(connections);
};


const connectAll = function (machineKey, notifyElement, groupPorts?) {
  connect(machineKey, mx.machine.list[machineKey].ports, notifyElement, groupPorts);
}


const connectGroup = function (groupKey: string, notifyElement: HTMLElement) {

  //Get info about machines and ports in this group
  let group = mx.machine.groups[groupKey];
  let groupMachines: string[] = group.machines;
  let groupPorts = group.ports;
  let groupType = group.type;

  //Setup for relay groups

  //Convert group-type into port list. If present, port list takes precedence.
  if (!groupPorts) {

    //Create a list of ports to relay
    groupPorts = [];

    //Look through all machines in this group
    for (let machineIndex in groupMachines) {

      //Remember the machine
      let machineKey = groupMachines[machineIndex];
      let machine = mx.machine.list[machineKey];

      //Look through all ports on the machine
      for (let portIndex in machine.ports) {

        //Remember the port
        let portKey = machine.ports[portIndex];
        let port = mx.machine.ports[portKey];

        //If relay type, add relays to this port type on all other machines in the group
        if (port.type == groupType) {

          //Look through all machines in this group
          for (let relayMachineIndex in groupMachines) {

            //Remember the relay machine
            let relayMachineKey = groupMachines[relayMachineIndex];

            //Add relay if not the same machine
            if (relayMachineKey != machineKey) {

              //Find the same port type on the relay machine
              let relayPortKey = mx.machine.findInMachine(relayMachineKey, groupType);

              //Construct socket keys
              let socketKey = `${machineKey}-${portKey}`
              let relaySocketKey = `${relayMachineKey}-${relayPortKey}`

              //Add relay pair to list
              let relayPair = [socketKey, relaySocketKey];
              groupPorts.push(relayPair);

            }
          }
        }
      }
    }
  }

  //Connect to all sockets on each of them
  for (let machineIndex in groupMachines) {
    let machineKey = groupMachines[machineIndex]
    connectAll(machineKey, notifyElement, groupPorts);
  }

}

const initSocket = function (socket: WebSocket, notifyElement: HTMLElement, history?: {}[]) {

  //Remember socket creator
  socket.creator = notifyElement;
  setupEmptyCallback(socket, notifyElement, history);
}

//Service Definition

//connect


export const socket = {
  connectPort: connect,
  connectMachine: connectAll,
  connectGroup: connectGroup,
  init: initSocket,
  list: connections,
  keys: socketKeys()
};
