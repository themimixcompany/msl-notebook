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
const setupEmptyCallback = function (socket: WebSocket, messageNumber?, actionList?: {}[]) {

  //Get actionIndex
  let actionIndex = actionList.length - 1;

  //Remember us as original sender
  socket.sender = socket.key;

  //using "" as message reflects that we did not send any message.
  setupMessageCallback(socket, "", true, "", actionList)

}

//setupMessageCallback
//Used to handle the .onmessage event from a socket *after* a message is sent.
const setupMessageCallback = function (socket: WebSocket, message: string, echo: boolean, relay?, actionList?: {}[]) {

  //Create a closure for actionIndex for .onmessage
  let actionIndex = actionList.length - 1;


  //Create onmessage callback
  socket.onmessage = function (event: Event) {

    //Get received message from event
    const receivedMessage: string = event.data;

    //Debug Info
    mx.debug.echo(false);
    mx.debug.log(`λ ${socket.key} ${message} => ${receivedMessage}`);

    //Get original sender from socket;
    let sendingSocketKey = socket.sender;

    //Interpret MSL (Check for (@VER), for example)
    //var isValidMSL = mslParser.parse(receivedMessage);

    //Get who to notify from actionList
    let notifyElement = actionList[actionIndex]["notify"]


    //Relay if relay is set, not looping back to original machine, and active in connections
    // if (socket.relayTo && (relay != socket.relayTo) && connections[socket.relayTo]) {
    //   sendSingleMessage(connections[socket.relayTo], receivedMessage, echo, socket.key)
    // }


    //Record a regular or roundtrip message was received
    if (relay == socket.relayTo) {
      recordRoundtrip(actionList, actionIndex, socket.key, relay, message);
    } else {
      recordReceive(actionList, actionIndex, socket.key, receivedMessage)
    }

    //Create an actionList for message notifications (communicators)
    let messageActionList: {}[] = [];

    //Get all actions which were initiated by this same component
    for (let oneActionIndex in actionList) {
      if (actionList[oneActionIndex]["notify"] == actionList[actionIndex]["notify"]) {
        messageActionList.push(actionList[oneActionIndex]);
      } 
    }

    // //For relay actions, include the original send
    // if (actionList[actionIndex]["type"] == action.relay) {
    //   messageActionList = [actionList[actionIndex - 1], actionList[actionIndex]];
    // } else {
    //   messageActionList = [actionList[actionIndex]];
    // }

    //Notify the requested component of the received message.
    if (notifyElement) {
      notify(notifyElement, "message-received", messageActionList);
    } else {
      notify(actionList[actionIndex]["notify"], "message-received", messageActionList);
    }
    

    //Detect messages from opening
    let isOpeningMessage = false;
    if (actionIndex > 0 ) { 
       if (actionList[actionIndex]["type"] == action.connect) {
         isOpeningMessage = true;
       }
    }

    //Perform relay if appropriate
    if (socket.relayTo && (relay != socket.relayTo) && connections[socket.relayTo]) {

      //Get toSocket
      let toSocket = connections[socket.relayTo];
      //Sent outgoing relay message
      if (!isOpeningMessage) {
      sendSingleMessage(toSocket, receivedMessage, echo, socket.key, notifyElement, actionList)
      }
    }

    //If this listener received a message on a different wire than sent, re-attach original listener

    //Get names of the sockets
    let listeningKey = socket.key;
    let originalKey = sendingSocketKey;

    //Test if they are different
    if (listeningKey != originalKey) {

      //Re-attach original message listener
      //setupEmptyCallback(socket, undefined, actionList);

    }

  };

}

//sendSingleMessage
//Send a single message over a websocket with a per-message callback.
const sendSingleMessage = function (socket: WebSocket, message: string, echo: boolean, relay: string, notifyElement, actionList?: {}[]) {

  //Remember us as original sender
  socket.sender = socket.key;

  //Check if this an outgoing relay message (relay = original sender's socketKey)
  if (relay != "" && relay != "false" && socket.key != relay) {

    //Record this action
    recordRelay(actionList, socket.key, relay, message, notifyElement);

  } else {

    //Record this action
    recordSend(actionList, socket.key, message, notifyElement);

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

      //Remember original "sender" for messages received by this socket
      listenSocket.sender = socket.key;

      //Setup message callback
      setupEmptyCallback(listenSocket, undefined, actionList)

    }
  }


  //Send message if not blank (Blank sets up receiver w/o sending.)
  if (message != "") {
    socket.send(message)
  }

};

//notify
//Send an event to a web component or HTML element
const notify = (notifyElement, eventName: string, payload: any) => {

  //create event
  let eventOptions = {
    "bubbles": true,
    "composed": true,
    "detail": payload
  }
  let notifyEvent = new CustomEvent(eventName, eventOptions);

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

  //Create an interface for custom properties.
  interface mxSocket extends WebSocket {
    mxSend: {},
    mxClose: {}
  }
  
  //Access the socket through the custom interface.
  let thisSocket = socket as mxSocket;

  //mxSend. Send a message on the socket. 
  thisSocket.mxSend = mxSend;

  //mxClose. Close socket and notify of status change.
  thisSocket.mxClose = mxClose;

}

//PUBLIC FUNCTIONS

//CONNECTION FUNCTIONS //////////

//connectPort
//Connect to a WebSocket on a machine.
const connectPort = function (machineKey: string, portKey, notifyElement: HTMLElement, relayPairs?, actionList?: {}[]) {

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

    //Remember this actionIndex
    let actionIndex = actionList.length - 1;

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


    //ADD MX FUNCTIONS TO SOCKET //////////
    addMxFunctions(socket);


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

      //Record this response
      recordOpen(actionList, actionIndex, socket.key);

      //Notify the calling component socket that status has changed
      let { ...connectionsCopy } = connections;
      notify(actionList[actionIndex]["notify"], "status-changed", connectionsCopy);

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

    //Setup for initial message callbacks
    setupEmptyCallback(socket, undefined, actionList);

    //Setup close callback
    // socket.onclose = function () {

    //   mx.debug.log("closed", socketKey);
    //   console.log("closed")
    //   console.log(actionList);

    //   //Get index of actionList item
    //   let actionIndex = actionList.length - 1;

    //   //Get who to notify from actionList item
    //   let actionItem = actionList[actionIndex];

    //   //Record this response
    //   recordClose(actionList, actionIndex, this.key, actionItem["notify"]);

    //   //Remove this socket from active connections
    //   delete connections[this.key]

    //   //Create a copy to force property changes
    //   let { ...connectionsCopy } = connections;

    //   //Notify element of status change
    //   notify(actionItem["notify"], "status-changed", connectionsCopy);
    // }

    //Setup close callback for closures from the other side (not initiated by us).
    socket.onclose = (e) => handleClose(actionList, connections, socket.key);

  }

  //Return 
  return true;
}

const handleClose = function (actionList: {}[], connections, socketKey) {

  mx.debug.log("closed", socketKey);

  //Get index of actionList item
  let actionIndex = actionList.length - 1;

  //Get who to notify from actionList item
  let actionItem = actionList[actionIndex];

  //Record this response
  recordClose(actionList, actionIndex, socketKey, actionItem["notify"]);

  //Remove this socket from active connections
  delete connections[socketKey]

  //Create a copy to force property changes
  let { ...connectionsCopy } = connections;

  //Notify element of status change
  notify(actionItem["notify"], "status-changed", connectionsCopy);
}

//connectMachine
//Connect to all ports on a machine.
const connectMachine = function (machineKey, notifyElement: HTMLElement, relayPairs?, actionList?: {}[]) {
  connectPort(machineKey, mx.machine.machines[machineKey].ports, notifyElement, relayPairs, actionList);
}

//connectGroup
//Connect to all machines and ports in a group.
const connectGroup = function (groupKey: string, notifyElement: HTMLElement, actionList?: {}[]) {

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
    connectMachine(machineKey, notifyElement, groupPorts, actionList);
  }

}

//connect
//Connect to a URL
const connect = function (socketURL, notifyElement?: HTMLElement, actionList?: {}[]) {


  //Create machine and port entries and capture their keys
  let [machineKey, portKey] = create(socketURL, notifyElement);

  //Connect to the new machine and port
  connectPort(machineKey, portKey, notifyElement, [], actionList);

}

// //ACTION EXAMPLES

// connect action
// connect to the socket with the key "to" and notify the element "notify" when open or closed.
// const actionConnect = {
//   "type": action.connect,
//   "to": "",
//   "notify": {},
//   "response": []
// }

// send action
// send the text "message" on socket "to" and notify the element "notify" of any reply messages.
// const actionSend = {
//   "type": action.send,
//   "to": "",
//   "message": "",
//   "notify": {},
//   "response": []
// }

// relay action
// forward the text "message" from the socket "from" to the socket "to" and notify "notify" of any replies.
// const actionRelay = {
//   "type": action.relay,
//   "to": "",
//   "from": "",
//   "message": "",
//   "notify": {},
//   "response": []
// }

// disconnectaction
// disconnect from the socket "to" and notify "notify" when the socket is closed.
// const actionDisconnect = {
//   "type": action.disconnect,
//   "to": "",
//   "notify": {},
//   "response": []
// }

// //RESPONSE EXAMPLES

// open
// the socket "from" responded that it is open.
// const responseOpen = {
//   "type": response.open,
//   "from": ""
// }

// receive
// the socket "from" received the text "message".
// const responseReceive = {
//   "type": response.receive,
//   "from": "",
//   "message": ""
// }

// roundtrip
// the socket "from" received the text "message", a roundtrip response originally from the socket "to".
// const responseRoundtrip = {
//   "type": response.roundtrip,
//   "from": "",
//   "to": "",
//   "message": ""
// }

// close
// the socket "from" responded that it is closed.
// const responseClose = {
//   "type": response.close,
//   "from": ""
// }


//ACTION RECORDING //////////

//recordAction
//Action recording
//Record a new action. Notify of all responses to the action.
const recordAction = function (actionList: {}[], type, to?: string, from?: string, message: string = "", notifyElement?: HTMLElement) {

  //Assign an action number (for display/download)
  let actionNumber = actionList.length + 1

  //Find types for to and from ports if provided and indexed (not added later)
  let toPortType = to && mx.machine.index[to] ? mx.machine.index[to].type : "text";
  let fromPortType = from && mx.machine.index[from] ? mx.machine.index[from].type : "text";

  //Create a new action from the passed parameters.
  let newAction = {
    "number": actionNumber,
    "type": type,
    "to": to,
    "toPortType": toPortType,
    "from": from,
    "fromPortType": fromPortType,
    "message": message,
    "notify": notifyElement
  }

  // //Add port type information for ports used in the response
  // if (to) {
  //   newAction["toPortType"] = mx.machine.index[to].type
  // }
  // if (from) {
  //   newAction["formPortType"] = mx.machine.index[from].type
  // }

  //Add new action to list.
  actionList.push(newAction);

  //Notify component, if requested.
  if (notifyElement) {
    let [...actionsCopy] = actionList;
    notify(notifyElement, "actions-changed", actionsCopy)
  }

}

//recordConnect
const recordConnect = function (actionList: {}[], to, notifyElement?: HTMLElement) {
  recordAction(actionList, action.connect, to, undefined, undefined, notifyElement);
}

//recordSend
const recordSend = function (actionList: {}[], to, message, notifyElement?: HTMLElement) {
  recordAction(actionList, action.send, to, undefined, message, notifyElement);
}

//recordRelay
const recordRelay = function (actionList: {}[], to, from, message, notifyElement?: HTMLElement) {
  recordAction(actionList, action.relay, to, from, message, notifyElement);
}

//recordDisconnect
const recordDisconnect = function (actionList: {}[], to, notifyElement?: HTMLElement) {
  recordAction(actionList, action.disconnect, to, undefined, undefined, notifyElement);
}

//RESPONSE RECORDING  //////////

//recordResponse
//Response recording
//Lookup an action by actionIndex, add a response. Notify the action's component. Notify notifyElement, if provided.
const recordResponse = function (actionList: {}[], actionIndex, type, to, from, message, notifyElement?: HTMLElement) {

  let actionItem: {} = actionList[actionIndex];

  //No action  item? Early return.
  if (!actionItem) {
    mx.debug.log("action", actionIndex, "is missing")
    return false;
  }

    //Find two and from port types
    let toPortType = to && mx.machine.index[to] ? mx.machine.index[to].type : undefined;
    let fromPortType = from && mx.machine.index[from] ? mx.machine.index[from].type : undefined;
  

  //Create new response item
  let newResponse = {
    "type": type,
    "to": to,
    "toPortType": toPortType,
    "from": from,
    "fromPortType": fromPortType,
    "message": message
  }

  //No response list? Create it.
  if (!actionItem["response"]) {
    actionItem["response"] = [newResponse];
  } else {
    actionItem["response"].push(newResponse);
  }

  //Notify component(s) of actionList changes

  //Create a copy to force property updates
  let [...actionsCopy] = actionList;

  //Notify action's component
  notify(actionItem["notify"], "actions-changed", actionsCopy)

  //Notify response component, if provided
  if (notifyElement) {
    notify(notifyElement, "actions-changed", actionsCopy)
  }

}

//recordOpen
const recordOpen = function (actionList: {}[], messageNumber, from, notifyElement?: HTMLElement) {
  recordResponse(actionList, messageNumber, response.open, undefined, from, undefined, notifyElement);
}

//recordReceive
const recordReceive = function (actionList: {}[], messageNumber, from, message, notifyElement?: HTMLElement) {
  recordResponse(actionList, messageNumber, response.receive, undefined, from, message, notifyElement)
}

//recordRoundtrip
const recordRoundtrip = function (actionList: {}[], messageNumber, from, to, message, notifyElement?: HTMLElement) {
  recordResponse(actionList, messageNumber, response.roundtrip, to, from, message, notifyElement);
}

//recordClose
const recordClose = function (actionList: {}[], messageNumber, from, notifyElement?: HTMLElement) {
  recordResponse(actionList, messageNumber, response.close, undefined, from, undefined, notifyElement);
}


//create
//Create machine and port entries from a URL
const create = function (socketURL, notifyElement?: HTMLElement) {

  //Split out machine and port from URL
  let socketURLParts = socketURL.split(":");
  let [machineKey, portNumber] = socketURLParts;

  //Add "port" to portKey (allows for blank default/80)
  const portKey = `port-${portNumber ? portNumber : 80}`;

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
const mxSend = function (message: string, echo: boolean = false, notifyElement, actionList?: {}[]) {

  //Send the message w/ notification.
  sendSingleMessage(this, message, echo, "false", notifyElement, actionList);

}



//mxClose
//Accessed by .mxClose function on an active socket.
//Removes the socket from active connections and notifies the notifyStatusChange element
//In that context, "this" is the socket itself.
const mxClose = function (notifyElement: HTMLElement, actionList?: {}[]) {

  //Record this action
  if (actionList) {
    recordDisconnect(actionList, this.key, notifyElement);
  }

  //Setup close callback for closures from the other side (not initiated by us).
  this.onclose = (e) => handleClose(actionList, connections, this.key);

  //Close socket w/ normal reason code (1000)
  this.close(1000);

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
  notify,
  connections,
  list: connections
};