// MSL.js Socket Service
// by The Mimix Company

// Create and manage websockets with per-message callback functions, histories, groups, and relays.

//MSL.js Services
import * as mx from 'msl-js/service-loader'

//SERVICE CONSTANTS //////////

//WebSocket States
const status = {
  "connecting": 0,
  "open": 1,
  "closing": 2,
  "closed": 3
};

//PRIVATE VARIABLES ////////// 

//Active Sockets
let connections = {};

//PRIVATE FUNCTIONS //////////

//MESSAGE SENDING & CALLBACK SETUP //////////

//setupEmptyCallback
//Used to handle the .onmessage that might come from a socket *before* any message is sent. It is an "empty" callback because the message parameter is empty, meaning no message was sent.
const setupEmptyCallback = function (socket: WebSocket, history?: {}[], messageNumber?) {

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

    //If no history item, create empty item
    if (!historyItem) {

      historyItem = {};

      //Save in history if new message
      console.log(history);
      history.push(historyItem);
    }

    //If no entry under the socketKey, create an empty one
    if (!historyItem[socket.key]) {
      historyItem[socket.key] = [""];
    }

    //Create a copy of history for notifyElement (triggers property updates there)
    let [...historyCopy] = history;

    //Notify component of history change;
    notify(socket.notifyHistory, "history-changed", historyCopy);

  }

  //using "" as message reflects that we did not send any message.
  setupMessageCallback(socket, "", true, socket, "", history)


}

//setupMessageCallback
//Used to handle the .onmessage event from a socket *after* a message is sent.
const setupMessageCallback = function (socket: WebSocket, message: string, echo: boolean, sendingSocket: WebSocket = socket, relay?, history?: {}[]) {

  //Setup for messageNumber 
  let messageNumber;
  if (history) {
    messageNumber = history.length - 1;
  }

  socket.onmessage = function (event: Event) {

    const receivedMessage: string = event.data;

    //Debug Info
    mx.debug.echo(false);
    mx.debug.log(`λ ${socket.notifyMessages.localName} ${socket.key} ${message} => ${receivedMessage}`);

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
      notify(socket.notifyHistory, "history-changed", historyCopy);

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

    notify(socket.notifyMessages, "message-received", notifyMessage);

    //Relay if relay is set, not looping back to original machine, and active in connections
    if (relay && (relay != socket.relay) && connections[socket.relay]) {
      sendSingleMessage(connections[socket.relay], receivedMessage, echo, socket.key, history)
    }

    //If this listener received a message on a different wire than sent, re-attach original listener

    //Get names of the sockets
    let listeningKey = socket.key;
    let originalKey = sendingSocket.key;

    //Test if they are different
    if (listeningKey != originalKey) {

      //Re-attach original message listener
      setupEmptyCallback(socket);

    }

  };
}

//sendSingleMessage
//Send a single message over a websocket with a per-message callback.
const sendSingleMessage = function (socket: WebSocket, message: string, echo: boolean, relay: string, history: {}[] = []) {


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
  setupMessageCallback(socket, message, echo, socket, relay, history);

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
      //setupEmptyCallback(adminSocket, history, messageNumber);
      setupMessageCallback(adminSocket, "", echo, socket, relay, history);

    }
  }

  //Send message if not blank (Blank sets up receiver w/o sending.)
  if (message != "") {
    socket.send(message)
  }

};

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

//UTILITY FUNCTIONS FOR DETERMINING MACHINES & SOCKETS //////////

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

//CONNECTION FUNCTIONS //////////

//connectPort
//Connect to a WebSocket on a machine.
const connectPort = function (machineKey: string, portKey, notifyElement: HTMLElement, relayPairs?) {

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


    //Add properties and functions to the new socket

    //Add MX functions

    //mxSend. Send a message on the socket. 
    socket.mxSend = mxSend;

    //mxNotifyStatusChange. Tell who to notify of connect/disconnect.
    socket.mxNotifyStatusChange = mxNotifyStatusChange;

    //mxNotifyHistory. Tell who to notify of history changes.
    socket.mxNotifyHistory = mxNotifyHistory;

    //mxNotifyMessages. Tell who to notify of messages.
    socket.mxNotifyMessages = mxNotifyMessages;

    //Add machine this socket is on.
    socket.machineKey = machineKey;
    socket.machine = mx.machine.list[machineKey];

    //Add port this socket is on.
    socket.portKey = portKey;
    socket.port = mx.machine.ports[portKey];

    //Add this socket's key.
    socket.key = socketKey;

    //Turn off relay by default
    socket.relay = "";

    //Remember who to notify of status changes
    socket.mxNotifyStatusChange(notifyElement);

    //Remember who to notify of history changes
    socket.mxNotifyHistory(notifyElement);


    //Setup open callback
    socket.onopen = function () {

      //Store socket in active connections
      mx.debug.log("connected", socketKey);
      connections[socketKey] = socket;

      //Notify the calling component socket that status has changed
      notify(socket.notifyStatusChange, "status-changed", connections);

      //If this socket was opened as part of a relay group
      if (relayPairs) {

        //Construct a list of ports in the group w/o repeats
        let portArray: string[] = [];

        //Add each port in the group only once
        for (let relayPairIndex in relayPairs) {

          //Remember the pair
          let relayPair = relayPairs[relayPairIndex];

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
          for (let relayPairIndex in relayPairs) {

            //Remember the pair
            let relayPair = relayPairs[relayPairIndex];

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
      notify(socket.notifyStatusChange, "status-changed", connections);
    }

    
  }


  //Return 
  return true;

}


//connectMachine
//Connect to all ports on a machine.
const connectMachine = function (machineKey, notifyElement: HTMLElement, relayPairs?) {
  connectPort(machineKey, mx.machine.list[machineKey].ports, notifyElement, relayPairs);
}

//connectGroup
//Connect to all machines and ports in a group.
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
    connectMachine(machineKey, notifyElement, groupPorts);
  }

}

//socketKeys
//Returns an array of socketKeys for all active connections.
const socketKeys = function (): string[] {
  return Object.keys(connections);
};

//MX FUNCTIONS ON SOCKET ITSELF //////////
//Note: These funtions rely on 'this' having separate scope and so cannot be written w/ arrow syntax.

//mxSend
//Send a message. Call w/ .mxSend function on an active socket from connections.
//In that context, "this" as a parm to sendSingleMessage is the socket itself.
const mxSend = function (message: string, echo: boolean = false, history: {}[] = []) {

  //Send the message w/ notification and history.
  sendSingleMessage(this, message, echo, "false", history);

}

//mxNotifyStatusChange
//Accessed by .mxNotifyStatusChange function on an active socket.
//Assigns a web component or HTML element to be notified when a socket is opened or closed.
//In that context, "this" is the socket itself.
const mxNotifyStatusChange = function(notifyElement: HTMLElement) {

 //Remember who to notify of status changes
 this.notifyStatusChange = notifyElement;

}

//mxNotifyMessages
//Accessed by .mxNotifyMessages function on an active socket.
//Assigns a web component or HTML element to be notified when a message arrives on a socket.
//In that context, "this" is the socket itself.
const mxNotifyMessages = function(notifyElement: HTMLElement, history?: {}[]) {

  //Remember who to notify of messages
  this.notifyMessages = notifyElement;

  //Setup for message callbacks
  setupEmptyCallback(this, history);

}

//mxNotifyHistory
//Accessed by .mxNotifyHistory function on an active socket.
//Assigns a web component or HTML element to be notified when this socket changes the history.
//In that context, "this" is the socket itself.
const mxNotifyHistory = function (notifyElement: HTMLElement) {

  //Remember who to notify of history changes for this socket.
  this.notifyHistory = notifyElement;

}



//SERVICE DEFINITION //////////

//connectPort
//Create a websocket connection to one specific port on a machine.
//mx.socket.ConnectPort(machineKey, portKey, notifyElement, relayPorts) => Connect to portKey on machineKey and notify notifyElement when the connection is open or closed. Keep a list of relayPairs for messages.

//connectMachine
//Create individual websocket connections for every port defined on a machineKey.
//mx.socket..connectMachine(machineKey, notifyElement, relayPorts) => Connect separately to every port on machineKey. Notify notifyElement when the connections are open. Keep a list of relayPairs for messages.

//connectGroup
//Connect the machines and ports in groupKey defined in groups.json.
//mx.socket.connectGroup(groupKey, notifyElement) => Connect to every machine and port defined in the group. Notify notifyElement when connections are open. Create a list of relayPairs from the group's port types or port lists.


//list
//Return a json object with every open websocket under its socketKey.
//mx.socket.list[machineKey-portKey] => live websocket for portKey on machineKey

//keys
//Return an array of all active socketKey names, representing all open sockets.
//mx.socket.keys => array of socketKeys

export const socket = {
  connectPort: connectPort,
  connectMachine: connectMachine,
  connectGroup: connectGroup,
  list: connections,
  keys: socketKeys()
};
