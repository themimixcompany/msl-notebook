// MSL.js Socket Service
// by The Mimix Company

// Provides access to a websocket for sending and receiving harnessed messages.

//SERVICE CONSTANTS

//All Available Machines
const machines = {
  "test1": {
      "name": "WSS Echo",
      "ip": "echo.websocket.org",
      "type": {
        "text": {
          "name": "wss-echo",
          "protocol": "wss"
        }
      }
    },
    "test2": {
      "name": "WS Kaazing",
      "ip": "demos.kaazing.com/echo",
      "type": {
        "text": {
          "name": "kaazing-demo",
          "protocol": "ws"
        }
      }
    },
    "local": {
      "name": "Local Mimix",
      "ip": "localhost",
      "type": {
        "world": {
          "name": "mx-world",
          "protocol": "http"
        },
        "msl": {
          "name": "mx-msl",
          "protocol": "ws",
          "port": "60000"
        },
        "admin": {
          "name": "mx-admin",
          "protocol": "ws",
          "port": "60500"
        }
      }
    }

}

//SERVICE FUNCTIONS

//List Machines of Type
const listMachines = function(requestedType) {

  //Setup Outgoing List
  let matchingMachines = {};

  //Iterate through Machines
  for (let machineKey in machines) {

    //Test for Requested Type
    if (machines[machineKey].type[requestedType]) {

      //Before Destructing Method
      //matchingMachines[machineKey] = Object.assign({}, machines[machineKey]); //Copy by Value
      //matchingMachines[machineKey].type = machines[machineKey].type[type]; //Obliterate other types

      let { type: machineType, ...oneMatch } = machines[machineKey]; //Copy by Destructuring, Remove type.
      oneMatch.type = machineType[requestedType]; //Put only the requestedType on this machine entry.
      matchingMachines[machineKey] = oneMatch; //Add this machine to outgoing list under its key.
    }
  }

  //Return Matching List
  return matchingMachines;
}

//Service Definition
export const machine = {
  list: listMachines
};
