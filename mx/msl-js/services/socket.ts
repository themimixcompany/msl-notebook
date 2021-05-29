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

//WebSocket Actions
const action = {
  "connect": 0,
  "send": 1,
  "relay": 2,
  "disconnect": 3
}

//WebSocket Responses
const response = {
  "open": 0,
  "receive": 1,
  "roundtrip": 2,
  "close": 3
}

//PRIVATE VARIABLES ////////// 

//Active Sockets
let connections = {};

//PRIVATE FUNCTIONS //////////

//MESSAGE SENDING & CALLBACK SETUP //////////

//setupEmptyCallback
//Used to handle the .onmessage that might come from a socket *before* any message is sent. It is an "empty" callback because the message parameter is empty, meaning no message was sent.
const setupEmptyCallback = function (socket: WebSocket, messageNumber?, actionList?) {

  //Remember us as original sender
  socket.sender = socket.key;

  //Get history from socket
  let history = socket.history;

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
  setupMessageCallback(socket, "", true, "", actionList)


}

//setupMessageCallback
//Used to handle the .onmessage event from a socket *after* a message is sent.
const setupMessageCallback = function (socket: WebSocket, message: string, echo: boolean, relay?, actionList?) {

  //Create a closure for actionIndex
  let actionIndex = actionList.length - 1;

  //Get history from socket
  let history = socket.history;

  //Setup for messageNumber 
  let messageNumber;
  if (history) {
    messageNumber = history.length - 1;
  }

  //Create onmessage callback
  socket.onmessage = function (event: Event) {

    //Get received message from event
    const receivedMessage: string = event.data;

    //Debug Info
    mx.debug.echo(false);
    mx.debug.log(`λ ${socket.notifyMessages["localName"]} ${socket.key} ${message} => ${receivedMessage}`);

    //Get original sender from socket;
    let sendingSocketKey = socket.sender;

    //Handle history, if provided

    if (history) {

      //Get Message in History
      let historyItem = history[messageNumber];


      //If no array for this socketKey, add it
      if (!historyItem[socket.key]) {

        //brute force move to bottom

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
        "sentSocketKey": sendingSocketKey,
        "receivedMessage": receivedMessage,
        "receivedSocketKey": socket.key
      }
    }

    //Notify the sender of the received message.
    notify(socket.notifyMessages, "message-received", notifyMessage);

    //Handle temporary listeners setup by additional listen ports
    if (socket["originalNotifyMessages"]) {

      //Reset future messages to notify the original component
      socket.notifyMessages = socket["originalNotifyMessages"];

      //Remove the temporary designation
      delete socket["originalNotifyMessages"];
    }

    //Relay if relay is set, not looping back to original machine, and active in connections
    // if (socket.relayTo && (relay != socket.relayTo) && connections[socket.relayTo]) {
    //   sendSingleMessage(connections[socket.relayTo], receivedMessage, echo, socket.key)
    // }


     //Record a regular or roundtrip message was received
     if (relay == socket.relayTo) {
        recordRoundtrip(actionList,actionIndex,socket.key,relay,message);
     } else {
        recordReceive(actionList, actionIndex, socket.key, receivedMessage)
     }

    //Perform relay if appropriate
    if (socket.relayTo && (relay != socket.relayTo) && connections[socket.relayTo]) {
      console.log("==========");
      console.log("about to relay");

      //Get toSocket
      let toSocket = connections[socket.relayTo];

      //Remember original message listener for this socket
      toSocket.originalNotifyMessages = toSocket.notifyMessages

      //Change listener for this additional socket to be the one that sent the message
      toSocket.mxNotifyMessages(socket.notifyMessages, actionList);

      sendSingleMessage(toSocket, receivedMessage, echo, socket.key, actionList)
    }

    //If this listener received a message on a different wire than sent, re-attach original listener

    //Get names of the sockets
    let listeningKey = socket.key;
    let originalKey = sendingSocketKey;

    //Test if they are different
    if (listeningKey != originalKey) {

      //Re-attach original message listener
      setupEmptyCallback(socket,undefined,actionList);

    }

  };
}

//sendSingleMessage
//Send a single message over a websocket with a per-message callback.
const sendSingleMessage = function (socket: WebSocket, message: string, echo: boolean, relay: string, actionList?) {


  //Get history from socket
  let history = socket.history;

  //Remember us as original sender
  socket.sender = socket.key;

  //Setup for messageNumber
  let messageNumber

  //Handle history
  if (history) {

    //Remember message number
    messageNumber = history.length;

    //Setup for new or existing historyItem
    let historyItem = {}


    //Check if this an outgoing relay message (relay = original sender's socketKey)
    if (relay != "" && relay != "false" && socket.key != relay) {

       //Record this action
       recordRelay(actionList,socket.key,relay,message,socket.notifyMessages);

      historyItem = history[messageNumber - 1]

      //Store this outgoing message under the socketKey
      historyItem[socket.key] = [message]

    } else {

        //Record this action
        recordSend(actionList,socket.key,message,socket.notifyMessages);

      //Store this outgoing message under the socketKey
      historyItem[socket.key] = [message]


      //Add new item to end of history array
      history.push(historyItem)


    }

  }

  //Setup message received callback
  setupMessageCallback(socket, message, echo, relay, actionList);

  //If additional listen port specified, add a listener for it.

  //Look for listen value on port
  let listenPortType = socket.port.listen;

  if (listenPortType) {

    //Get this socket's machineKey
    let machineKey = socket.machineKey;

    // Find port of "listen" type machine
    let listenPort = mx.machine.findInMachine(machineKey, listenPortType);

    // Find listen socket in active connections
    let listenPortKey = `${machineKey}-${listenPort}`;
    let listenSocket = connections[listenPortKey];

    //Setup message received callback on listen port, if open
    if (listenSocket) {

      //Remember original message listener for this socket
      listenSocket.originalNotifyMessages = listenSocket.notifyMessages

      //Remember original "sender" for messages received by this socket
      listenSocket.sender = socket.key;

      //Change listener for this additional socket to be the one that sent the message
      listenSocket.mxNotifyMessages(socket.notifyMessages, actionList);
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

//MX SOCKET FUNCTIONS 

//addMxFunctions
//Add all .mx functions to a socket.
const addMxFunctions = (socket: WebSocket) => {

  //mxSend. Send a message on the socket. 
  socket.mxSend = mxSend;

  //mxNotifyStatusChange. Tell who to notify of connect/disconnect.
  socket.mxNotifyStatusChange = mxNotifyStatusChange;

  //mxNotifyHistory. Tell who to notify of history changes.
  socket.mxNotifyHistory = mxNotifyHistory;

  //mxNotifyMessages. Tell who to notify of messages.
  socket.mxNotifyMessages = mxNotifyMessages;

  //mxClose. Close socket and notify of status change.
  socket.mxClose = mxClose;

}

//PUBLIC FUNCTIONS

//CONNECTION FUNCTIONS //////////

//connectPort
//Connect to a WebSocket on a machine.
const connectPort = function (machineKey: string, portKey, notifyElement: HTMLElement, relayPairs?, history?: {}[], actionList?: {}[]) {


  let portKeyList = portKey;

  //Handle single port (vs array) 
  if (portKey.constructor.name == "String") {
    portKeyList = [portKey];
  }

  //Open all requested ports
  for (let portKeyIndex in portKeyList) {

    //portKey of one port to connect to
    let portKey = portKeyList[portKeyIndex];

    //Create a socket key to track in connections
    let socketKey = `${machineKey}-${portKey}`;

    mx.debug.log("connecting to", socketKey);

    //Record this action
    recordConnect(actionList, socketKey, notifyElement);

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

    //If connection exists, quit. (Early return)
    if (socket) {
      mx.debug.log("already connected to", socketKey)
      return;
    }

    //Open new socket to URL

    mx.debug.log("opening socket", socketKey);

    //Create new socket
    socket = new WebSocket(socketURL);

    //Create history
    socket.history = history;

    //ADD MX FUNCTIONS TO SOCKET //////////
    addMxFunctions(socket);

    //Remember who to notify of status changes
    socket.mxNotifyStatusChange(notifyElement);

    //Remember who to notify of history changes
    socket.mxNotifyHistory(notifyElement);

    //ADD CUSTOM PROPERTIES TO SOCKET //////////

    //Add machine this socket is on.
    socket.machineKey = machineKey;
    socket.machine = mx.machine.list[machineKey];

    //Add port this socket is on.
    socket.portKey = portKey;
    socket.port = mx.machine.ports[portKey];

    //Add this socket's key.
    socket.key = socketKey;

    //Setup open callback
    socket.onopen = function () {

      //Store socket in active connections
      mx.debug.log("connected", socketKey);
      connections[socketKey] = socket;

      //Notify the calling component socket that status has changed
      let { ...connectionsCopy } = connections;
      notify(socket.notifyStatusChange, "status-changed", connectionsCopy);

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
            let [fromSocketKey, toSocketKey] = relayPair;

            //Get the sockets from active connections
            let fromSocket = connections[fromSocketKey]
            let toSocket = connections[toSocketKey]

            //Remember the relay information on each side
            fromSocket.relayTo = toSocketKey;
            toSocket.relayFrom = fromSocketKey;

            //fromSocket.relay = toSocketKey;
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
const connectMachine = function (machineKey, notifyElement: HTMLElement, relayPairs?, history?: {}[], actionList?:{}[]) {
  connectPort(machineKey, mx.machine.machines[machineKey].ports, notifyElement, relayPairs, history, actionList);
}

//connectGroup
//Connect to all machines and ports in a group.
const connectGroup = function (groupKey: string, notifyElement: HTMLElement, history?: {}[], actionList?: {}[]) {

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
    connectMachine(machineKey, notifyElement, groupPorts, history, actionList);
  }

}

//connect
//Connect to a URL
const connect = function (socketURL, notifyElement?: HTMLElement, history?, actionList?) {


  //Create machine and port entries and capture their keys
  let [machineKey, portKey] = create(socketURL, notifyElement);

  //Connect to the new machine and port
  connectPort(machineKey, portKey, notifyElement, [], history, actionList);

}

// //ACTION EXAMPLES

// const actionConnect = {
//   "type": action.connect,
//   "to": "",
//   "notify": {},
//   "response": []
// }

// const actionSend = {
//   "type": action.send,
//   "to": "",
//   "message": "",
//   "notify": {},
//   "response": []
// }

// const actionRelay = {
//   "type": action.relay,
//   "to": "",
//   "from": "",
//   "message": "",
//   "notify": {},
//   "response": []
// }

// const actionDisconnect = {
//   "type": action.disconnect,
//   "to": "",
//   "notify": {},
//   "response": []
// }

// //RESPONSE EXAMPLES

// const responseOpen = {
//   "type": response.open,
//   "from": ""
// }

// const responseReceive = {
//   "type": response.receive,
//   "from": "",
//   "message": ""
// }

// const responseRoundtrip = {
//   "type": response.roundtrip,
//   "from": "",
//   "to": "",
//   "message": ""
// }

// const responseClose = {
//   "type": response.close,
//   "from": ""
// }


//ACTION RECORDING //////////

//recordAction
//Action recording
const recordAction = function (actionList, type, to: string = "", from: string = "", message: string = "", notify?: HTMLElement) {

  let newAction = {
    "type": type,
    "to": to,
    "from": from,
    "message": message,
    "notify": notify
  }

  actionList.push(newAction);

  console.log("newAction");
  console.log(actionList);

}

//recordConnect
const recordConnect = function (actionList, to, notify) {
  recordAction(actionList, action.connect, to, undefined, undefined, notify);
}

//recordSend
const recordSend = function (actionList, to, message, notify) {
  recordAction(actionList, action.send, to, undefined, message, notify);
}

//recordRelay
const recordRelay = function (actionList, to, from, message, notify) {
  recordAction(actionList, action.relay, to, from, message, notify);
}

//RESPONSE RECORDING  //////////

//recordResponse
const recordResponse = function (actionList, actionIndex, type, to, from, message) {
  
  let actionItem:{} = actionList[actionIndex];
  
  //No action  item? Early return.
  if (!actionItem) {
    mx.debug.log("action",actionIndex,"is missing")
    return false;
  }

//Create new response item
let newResponseItem = {
  "type" : type,
  "to" : to,
  "from" : from,
  "message" : message
}

  //No response list? Create it.
  if (!actionItem["response"]) {
    actionItem["response"] = [newResponseItem];
  } else {
    actionItem["response"].push(newResponseItem);
  }


  
  console.log("newResponse");
  console.log(actionList);

}

//recordReceive
const recordReceive = function (actionList, messageNumber, from, message)  {
  recordResponse(actionList, messageNumber, response.receive, undefined, from, message)
}

//recordRoundtrip
const recordRoundtrip = function(actionList, messageNumber, from, to, message) {
  recordResponse(actionList, messageNumber, response.roundtrip, from, to, message);
}

//recordClose
const recordClose = function (actionList,from) {
  recordResponse(actionList,actionList.length - 1,response.close,undefined,from,undefined);
}


//create
//Create machine and port entries from a URL
const create = function (socketURL, notifyElement?: HTMLElement) {

  //Split out machine and port from URL
  let socketURLParts = socketURL.split(":");
  let [machineKey, portNumber] = socketURLParts;

  //Add "port" to portKey (allows for blank default/80)
  const portKey = `port${portNumber ? portNumber : 80}`;

  //Create new machine entry
  let newMachine = {
    "name": machineKey,
    "ip": machineKey,
    "ports": [portKey]
  }

  //Create new port entry
  let newPort = {
    "type": "text",
    "protocol": "ws"
  }

  //Add port number if originally present in URL
  if (portNumber) {
    newPort["port"] = portNumber
  }

  //Add machine to machines list
  mx.machine.machines[machineKey] = newMachine;

  //Add port to port list
  mx.machine.ports[portKey] = newPort;

  //Notify the calling component socket that machine and port lists have changed
  if (notifyElement) {
    notify(notifyElement, "machines-changed", [machineKey, portKey]);
  }

  //Return a machineKey and portKey
  return [machineKey, portKey];

}



//MX FUNCTIONS ON SOCKET ITSELF //////////
//Note: These funtions rely on 'this' having separate scope and so cannot be written w/ arrow syntax.

//mxSend
//Send a message. Call w/ .mxSend function on an active socket from connections.
//In that context, "this" as a parm to sendSingleMessage is the socket itself.
const mxSend = function (message: string, echo: boolean = false, actionList?) {

  //Send the message w/ notification and history.
  sendSingleMessage(this, message, echo, "false", actionList);

}

//mxNotifyStatusChange
//Accessed by .mxNotifyStatusChange function on an active socket.
//Assigns a web component or HTML element to be notified when a socket is opened or closed.
//In that context, "this" is the socket itself.
const mxNotifyStatusChange = function (notifyElement: HTMLElement) {

  //Remember who to notify of status changes
  this.notifyStatusChange = notifyElement;

}

//mxNotifyMessages
//Accessed by .mxNotifyMessages function on an active socket.
//Assigns a web component or HTML element to be notified when a message arrives on a socket.
//In that context, "this" is the socket itself.
const mxNotifyMessages = function (notifyElement: HTMLElement, actionList) {

  //Remember who to notify of messages
  this.notifyMessages = notifyElement;

  //Setup for message callbacks
  setupEmptyCallback(this,undefined,actionList);

}

//mxNotifyHistory
//Accessed by .mxNotifyHistory function on an active socket.
//Assigns a web component or HTML element to be notified when this socket changes the history.
//In that context, "this" is the socket itself.
const mxNotifyHistory = function (notifyElement: HTMLElement) {

  //Remember who to notify of history changes for this socket.
  this.notifyHistory = notifyElement;

}

//mxClose
//Accessed by .mxClose function on an active socket.
//Removes the socket from active connections and notifies the notifyStatusChange element
//In that context, "this" is the socket itself.
const mxClose = function () {

  //Remember who to notify 
  let notifyElement = this.notifyStatusChange;

  //Close socket w/ normal reason code (1000)
  this.close(1000);

  //Remove this socket from active connections
  delete connections[this.key]

  //Notify element of status change
  notify(notifyElement, "status-changed", connections);
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
  create,
  connect,
  connectPort,
  connectMachine,
  connectGroup,
  connections,
  list: connections
};