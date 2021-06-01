// MSL.js Machine Service
// by The Mimix Company

// Provides a list of machines for websocket connections.

//STATIC IMPORTS

//groups
//Groups of Machines
import groups from "msl-js/config/groups.json";

//machines
//Available Machines
import machines from "msl-js/config/machines.json";

//ports
//Port Defintions
import ports from "msl-js/config/ports.json";

//PRIVATE FUNCTIONS

//findTypeInMachine
const findTypeInMachine = function(machineKey:string,portType:string) {

  let machinePorts = machines[machineKey].ports

  //Test each port to see if it is of portType
  for (let onePortIndex in machinePorts) {
    let portKey = machinePorts[onePortIndex];
    if (isPortType(portKey,portType)){
      return portKey;
    }
  }

  //No matches.
  return false;
}

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


//hasType
const hasType = function(machineKey:string,portType:string) {
  let hasPort = machines[machineKey].ports.map(portKey => ports[portKey].type == portType)
  return hasPort.includes(true);
}

//index
const index = function() {

  //Construct a socketKey index
  let socketKeyIndex = {}

  //Loop through all machines and keys, indexing each item
  for (let machineKey in machines) {
    for (let portKey in ports) {
      let socketKey = `${machineKey}-${portKey}`
      socketKeyIndex[socketKey] = {
        "machineKey" : machineKey,
        "portKey" : portKey,
        "type": ports[portKey].type
      }
    }
  }
  
  return socketKeyIndex;

}

//Service Definition

//groups
//returns all groups from groups.json.
//mx.machine.groups[groupKey] => one group

//list
//returns all machines from machines.json.
//mx.machine.list[machineKey] => one machine

//ports
//returns all ports from ports.json.
//mx.machine.ports[portKey] => one port

//keys
//returns all machineKeys in machines.json.
//mx.machine.keys => array of machineKeys

//groupKeys
//returns all groupKeys in groups.json.
//mx.machine.groupKeys => array of groupKeys

//find
//returns a list of machineKeys having portType
//mx.machine.find(portType) => array of machineKeys where machine has port of portType

//findInMachine
//returns portKey of first port on machine having portType
//mx.machine.findInMachine(machineKey, portType) => portKey of matching port

//set
//set a value on a machine, overriding machines.json
//mx.machine.set(machineKey, key, value) => sets value at key on machineKey

//hasType
//returns true if machine machineKey has a port of portType
//mx.machine.hasType(machineKey, portType) => true if machine has a port of portType


export const machine = {
  groups,
  machines,
  ports,
  hasType,
  index: index(),
  list: machines,
  find: findByType,
  findInMachine: findTypeInMachine,
  groupKeys: Object.keys(groups),
};
