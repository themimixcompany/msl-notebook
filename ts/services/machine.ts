// MSL.js Machine Service
// by The Mimix Company

// Provides a list of machines for websocket connections.

//SERVICE CONSTANTS

//Available Machines
const machines = {
  "test1": {
      "name": "WSS Echo",
      "ip": "echo.websocket.org",
      "ports" : ["ws-text"]
    },
  "test2": {
      "name": "WS Kaazing",
      "ip": "demos.kaazing.com/echo",
      "ports" : ["ws-text"]
    },
  "local": {
      "name": "Local Mimix",
      "ip": "localhost",
      "ports" : ["mx-world","mx-msl","mx-admin"]
    }

}

//Port Defintions
const ports = {
  "mx-world": {
    "type": "world",
    "protocol": "http"
  },
  "mx-msl": {
    "type": "msl",
    "protocol": "ws",
    "port": "60000"
  },
  "mx-admin": {
    "type": "admin",
    "protocol": "ws",
    "port": "60500"
  },
  "ws-text": {
    "type": "text",
    "protocol": "ws"
  },
  "wss-text": {
    "type": "text",
    "protocol": "wss"
  }
}

//PRIVATE FUNCTIONS

//Test if a port is of a matching type
const isPortType = function(portKey,portType) {

  let matchingPort = ports[portKey];

  //False if no such port or not matching type
  if (!matchingPort || matchingPort.type != portType) {
    return false
  }

  //Otherwise true
    return true
}


//Test if machine has a port of matching type
const isMachineType = function(machineKey,portType) {

  //Look for a port that matches.
  for (let onePort of machines[machineKey].ports) {
    if (isPortType(onePort,portType)) {
      return true;
    }
  }

  //Return false; no match.
  return false;
  }



//PUBLIC FUNCTIONS

//findByType
//List Machines with a Given Port Type
const findByType = function(portType): Array {

  //Setup Outgoing List
  let matchingList = [];

  //Iterate through Machines
  for (let machineKey in machines) {

    //Add to List if Requested Type
    if (isMachineType(machineKey,portType)) {
      matchingList.push(machineKey);
    }
  }

  //Return Matching List
  return matchingList;
}

//allMachines
//Return a copy of all machines
const allMachines = function():Object {
  let {...copy} = machines; //copy by destructuring
  return copy;
}

//setValue
//Set a single value on a machine
const setValue = function(machineKey,key,value):boolean {

  //Quit if no matching key
  if (!machines[machineKey] || !machines[machineKey][key]) {

    return false;
  }

  //Set new value
  machines[machineKey][key] = value;
  //Return success
  return true;

}


//Service Definition
export const machine = {
  find: findByType,
  all: allMachines,
  set: setValue
};
