Before Destructing Method
matchingMachines[machineKey] = Object.assign({}, machines[machineKey]); //Copy by Value
matchingMachines[machineKey].type = machines[machineKey].type[type]; //Obliterate other types

let { type: machineType, ...oneMatch } = machines[machineKey]; //Copy by Destructuring, Remove type.
oneMatch.type = machineType[requestedType]; //Put only the requestedType on this machine entry.
matchingMachines[machineKey] = oneMatch; //Add this machine to outgoing list under its key.
