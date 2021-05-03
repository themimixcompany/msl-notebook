// MSL.js Machine Service
// by The Mimix Company

// Provides a list of machines for websocket connections.

//SERVICE CONSTANTS

//machines
//Available Machines
import machines from "config/machines.json";

//ports
//Port Defintions
import ports from "config/ports.json";

//PRIVATE FUNCTIONS

//isPortType
//Test if a port is of a matching type
const isPortType = function(portKey:string,portType:string) {

  let matchingPort = ports[portKey];

  //False if no such port or not matching type
  if (!matchingPort || matchingPort.type != portType) {
    return false
  }

  //Otherwise true
    return true
}

//isMachineType
//Test if machine has a port of matching type
const isMachineType = function(machineKey:string,portType:string) {

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
const findByType = function(portType:string): string[] {

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

//allPorts
//Return a copy of all ports
const allPorts = function():Object {
  let {...copy} = ports; //copy by destructuring
  return copy;
}

//setValue
//Set a single value on a machine
const setValue = function(machineKey:string,key:string,value:string):boolean {

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
  list: allMachines(),
  ports: allPorts(),
  keys: Object.keys(machines),
  find: findByType,
  set: setValue
};
