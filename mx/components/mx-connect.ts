//Lit Dependencies
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

//MSL.js Services
import * as mx from 'msl-js/service-loader'
import { machine } from 'msl-js/service-loader';
import { mxDebug } from './mx-debug';


//<mx-connect>
//Opens connections to WebSockets
@customElement('mx-connect')
export class mxConnect extends LitElement {
  static styles = css`
    textarea { color: #ec2028; font-family: Inter Black; font-size: 18pt }
    ol,ul, input, h2, p, .machine { font-family: Inter; font-size: 18pt }
    p {margin-top: 5px; margin-bottom: 5px;}
    .greyBk {background-color:#ccc}
    .gridHeader {background-color:#bbb}
    a { text-decoration: underline; cursor: pointer; text-decoration:underline}
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      grid-auto-rows: minmax(100px, auto);
    }
    .one {
      grid-column: 1;
      grid-row: 1;
    }
    .gridHeader, .threeColumns {
      grid-column: 1 / 4;
    }
    
    
    `;

  //Define public properties (databinding)
  @property() connections: string[] = [];


  //Status changed
  statusChanged(receivedEvent: Event) {
    mx.debug.log("active connections updated");
    this.connections = Object.keys(receivedEvent.payload);
  }

  //Socket connect link clicked
  connectSocket(machineKey: string, portKey: string) {
    mx.socket.connect(machineKey, portKey, this);
    ;
  }

  //Server connect link clicked
  connectAllSockets(machineKey: string, groupKey?, groupPorts?) {
    mx.socket.connectAll(machineKey, this, groupKey, groupPorts);
  }

  //Group connect link clicked
  connectAllMachines(groupKey: string) {

    //Find all machines in this group
    let group = machine.groups[groupKey];
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
      this.connectAllSockets(machineKey, groupKey, groupPorts);
    }

  }


  groupOpened(event: Event) {

    //Handle relays

    //Set all relay-type sockets in this group to relay to every other relay-type socket in this group
    let groupKey = event.payload;
    let group = mx.machine.groups[groupKey];
    let groupMachines = group.machines;
    let isRelay = group.relay;
    let groupType = group.type;
    let groupPorts = group.ports;

    //Quit if no relays to handle
    if (!isRelay) {
      return false;
    }

    



    //Attach relays to ports

    //Go through all relay pairs
    for (let relayPairIndex in groupPorts) {

      //Remember the pair
      let relayPair = groupPorts[relayPairIndex]

      //Extract the "from" and "to" sockets
      let [socketKey, relaySocketKey] = relayPair;

      //Get socket
      let socket = mx.socket.list[socketKey];

      //Add relay
      socket.relay = relaySocketKey;

    }
}





//Create HTML Templates

machineGrid() {
  return html`
    ${mx.machine.keys.map(machineKey => {


    return html`
      <div class="machine greyBk">

      <a @click=${() => this.connectAllSockets(machineKey)} title="Connect to all ports on ${machineKey}.">
      <mx-icon class="fas fa-server" color=${mx.machine.hasType(machineKey, "msl") ? 'navy' : ''}></mx-icon>
      <span style="font-weight:600">${machineKey}</span>
      </a>
  
      ${mx.machine.list[machineKey].ports.map((portKey: string) => html`
      <p>
      <a @click=${() => this.connectSocket(machineKey, portKey)} title="Connect to this port.">
      <mx-icon class="fas fa-router" color=${mx.machine.ports[portKey].type == 'msl' ? 'navy' : mx.machine.ports[portKey].type == 'admin' ? 'purple' : ''}></mx-icon>
      ${portKey}
      </p>
      `)}
  
    </div>
    `})}
    `
}

communicators() {
  return html`
    <i class="fas fa-server"></i>

    ${this.connections.map(socketKey => html`
      <div class="threeColumns">
        <mx-communicator socket=${socketKey}></mx-communicator>
      </div>
    `)}
    `
}

groups() {

  return html`
    ${mx.machine.groupKeys.map(groupKey => {


    return html`
      <div class="machine greyBk">

      <a @click=${() => this.connectAllMachines(groupKey)} title="Connect to all machines in ${groupKey}.">
      <mx-icon class="fas ${mx.machine.groups[groupKey].ports ? "fa-project-diagram" : mx.machine.groups[groupKey].relay ? "fa-network-wired" : "fa-object-ungroup"}" color="navy"></mx-icon>
      <span style="font-weight:600">${groupKey}</span>
      </a>
  
      ${mx.machine.groups[groupKey].machines.map((machineKey: string) => html`
      <p>
      <mx-icon class="fas fa-server" color=${mx.machine.hasType(machineKey, "msl") ? 'navy' : ''}></mx-icon>
      ${machineKey}
      </p>
      `)}
  
    </div>
    `})}
    `
}




//Show this component on screen
render() {

  //BEFORE TEMPLATE

  //Add event listeners for events targeting this component
  this.addEventListener("status-changed", this.statusChanged);
  this.addEventListener("all open", this.groupOpened);

  return html`

    <p>Click a server or port to connect. Then send a message.</p>
    <p>Click a message to send it again.</p>
    <br>

    <div class="grid">
      ${this.machineGrid()}
      ${this.groups()}
      ${this.communicators()}
    </div>
    
    <br>
  `;

}

}
