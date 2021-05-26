// <mx-connect>
// by The Mimix Company

//Lists ports, machines, and groups available in the config .json files and opens connections to them. Keeps a collective history for all connections it opens. Displays communicators for each socket.

//Lit Dependencies
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

//MSL.js Services
import * as mx from 'msl-js/service-loader'

//<mx-connect>
@customElement('mx-connect')
export class mxConnect extends LitElement {
  static styles = css`
    textarea, h3 { color: #ec2028; font-family: Inter Black; font-size: 18pt }
    ol,ul, input, h2, p, .machine, .results { font-family: Inter; font-size: 18pt }
    p {margin-top: 5px; margin-bottom: 5px;}
    .greyBk {background-color:#ccc}
    .gridHeader {background-color:#bbb}
    .disabled {color:grey}
    a { text-decoration: underline; cursor: pointer; text-decoration:underline}
    .whiteHeaderText {color:white;font-weight:500;}
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .grid2 {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
    }
    .one {
      grid-column: 1;
      grid-row: 1;
    }
    .threeColumns {
      grid-column: 1 / 4;
    },
    .fiveColumns {
      grid-column: 1 / 6;
    }
    .threeRows {
      grid-column: 1;
      grid-row: 1 / 5;
    }
    
    `;

  //Setup for Run Once
  hasRun = false;

  //Define public properties (databinding)
  @property() machines: {} = mx.machine.machines;
  @property() connections: string[] = [];
  @property() history: {}[] = [];
  @property() url: string = "";

  //Key pressed in URL input box? Check for Enter.
  urlKeyDown(event: Event) {

    //Enter key?
    if (event.keyCode == 13) {

      //Get URL from input box
      this.url = (event.target as HTMLInputElement).value;

      //Connect to URL, add it to connection list, and create communicator.
      mx.socket.connect(this.url, this, this.history);
    }
  }

  //Machines changed
  machinesChanged(receivedEvent: Event) {
    mx.debug.log("available machines updated");
    this.machines = mx.machine.machines;
  }

  //Status changed
  statusChanged(receivedEvent: Event) {
    mx.debug.log("active connections updated");
    this.connections = Object.keys(receivedEvent.payload);
  }

  //History changed
  historyChanged(receivedEvent: Event) {
    this.history = receivedEvent.payload;
  }

  //Empty history
  emptyHistory() {
    this.history = [];
  }

  //PORT connect link clicked
  connectPort(machineKey: string, portKey: string) {
    mx.socket.connectPort(machineKey, portKey, this,[],this.history);
    ;
  }

  //MACHINE connect link clicked
  connectMachine(machineKey: string) {
    mx.socket.connectMachine(machineKey, this,[],this.history);
  }

  //GROUP connect link clicked
  connectGroup(groupKey: string) {
    mx.socket.connectGroup(groupKey, this, this.history);
  }

  //Create HTML Templates

  //Machine grid. Shows all machines.
  templateMachineGrid() {
    return html`
    ${Object.keys(this.machines).map(machineKey => {


      return html`
      <div class="machine greyBk">

      <a @click=${() => this.connectMachine(machineKey)} title="Connect to all ports on ${machineKey}.">
      <mx-icon class="fas fa-server" color=${mx.machine.hasType(machineKey, "msl") ? mx.machine.list[machineKey].ip == 'localhost' ? '#ec2028' : 'navy' : ''}></mx-icon>
      <span style="font-weight:600">${machineKey}</span>
      </a>
  
      ${mx.machine.list[machineKey].ports.map((portKey: string) => html`
      <p>
      <a @click=${() => this.connectPort(machineKey, portKey)} title="Connect to this port." class=${this.connections[`${machineKey}-${portKey}`] ? "disabled" : ""} >
      <mx-icon class="fas fa-router" color=${mx.machine.ports[portKey].type == 'msl' ? mx.machine.list[machineKey].ip == 'localhost' ? '#ec2028' : 'navy' : mx.machine.ports[portKey].type == 'admin' ? mx.machine.list[machineKey].ip == 'localhost' ? 'darkOrange' : 'purple' : ''}></mx-icon>
      ${portKey}
      </p>
      `)}
  
    </div>
    `})}
    `
  }

  //Communicators template. Draws one communicator for each socket in active connections
  templateCommunicators() {
    return html`
    <i class="fas fa-server"></i>

    ${this.connections.map(socketKey => html`
      <div class="threeColumns">
        <mx-communicator .socketKey=${socketKey} .history=${this.history} .connector=${this}></mx-communicator>
      </div>
    `)}
    `
  }

  //Groups template. Draws one panel for each group.
  templateGroups() {

    return html`
    ${mx.machine.groupKeys.map(groupKey => {

      return html`
      <div class="machine greyBk">

      <a @click=${() => this.connectGroup(groupKey)} title="Connect to all machines in ${groupKey}.">
      <mx-icon class="fas ${mx.machine.groups[groupKey].ports ? "fa-project-diagram" : mx.machine.groups[groupKey].relay ? "fa-network-wired" : "fa-object-ungroup"}" color="navy"></mx-icon>
      <span style="font-weight:600">${groupKey}</span>
      </a>
  
      ${mx.machine.groups[groupKey].machines.map((machineKey: string) => html`
      <p>
      <mx-icon class="fas fa-server" color=${mx.machine.hasType(machineKey, "msl") ? mx.machine.list[machineKey].ip == 'localhost' ? '#ec2028' : 'navy' : ''}></mx-icon>
      ${machineKey}
      </p>
      `)}
  
    </div>
    `})}
    `
  }

  //Visual key template. Explains icons and colors.
  templateVisualKey() {
    return html`
    <div class="machine greyBk threeRows">
      <mx-icon class="fas fa-key"></mx-icon><span style="font-weight:600">key</span>
      <p><mx-icon class="fas fa-server" color="#ec2028"></mx-icon>local msl engine</p>
      <p><mx-icon class="fas fa-router" color="#ec2028"></mx-icon>local msl port</p>
      <p><mx-icon class="fas fa-router" color="orange"></mx-icon>local admin port</p>
      <p><mx-icon class="fas fa-server" color="navy"></mx-icon>remote msl engine</p>
      <p><mx-icon class="fas fa-router" color="navy"></mx-icon>remote msl port</p>
      <p><mx-icon class="fas fa-router" color="purple"></mx-icon>remote admin port</p>
      <p><mx-icon class="fas fa-server"></mx-icon>websocket server</p>
      <p><mx-icon class="fas fa-router"></mx-icon>websocket text port</p>
      <p><mx-icon class="fas fa-network-wired" color="navy"></mx-icon>type relay group</p>
      <p><mx-icon class="fas fa-project-diagram" color="navy"></mx-icon>port relay group</p>
      <p><mx-icon class="fas fa-object-ungroup" color="navy"></mx-icon>non-relay group</p>
    </div>
    `
  }

  //Connect to URL template. Creates a connection from URL typed in the box.
  templateConnectURL() {
    return html`
    <h3>Connect to a URL <input @keydown=${this.urlKeyDown} placeholder="echo.websocket.org"></h3>
    `;
  }

  //Show this component on screen
  render() {

    //BEFORE TEMPLATE

    //Run Once

    if (!this.hasRun) {

      //Remember we ran once
      this.hasRun = true;

    }


    //Add event listeners for events targeting this component
    this.addEventListener("machines-changed", this.machinesChanged);
    this.addEventListener("status-changed", this.statusChanged);
    this.addEventListener("history-changed", this.historyChanged);

    return html`

    <ol>
    <li>Click a <mx-icon class="fas fa-server"></mx-icon> server, <mx-icon class="fas fa-router"></mx-icon> port, or <mx-icon class="fas fa-network-wired"></mx-icon> group icon to connect.</li>
    <li>Use <mx-icon class="fas fa-keyboard"></mx-icon> communicators to send messages.
    <li>Click a <mx-icon class="fas fa-keyboard"></mx-icon> sent message, <mx-icon class="fas fa-chart-network"></mx-icon> relay, <mx-icon class="fas fa-comment"></mx-icon> reply, or <mx-icon class="fas fa-comment-check"></mx-icon> additional reply icon to resend.</li>
    </ol>



    ${this.templateConnectURL()}

    <div class="grid">
      ${this.templateVisualKey()}
      ${this.templateMachineGrid()}
      ${this.templateGroups()}
    </div>

    <br>
    <mx-history .history=${this.history}></mx-history>
    <br>
    
    ${this.templateCommunicators()}
   
  `;
  }
}
