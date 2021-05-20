//Lit Dependencies
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

//MSL.js Services
import * as mx from 'msl-js/service-loader'

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
    }
    .one {
      grid-column: 1;
      grid-row: 1;
    }
    .gridHeader, .threeColumns {
      grid-column: 1 / 4;
    }
    .threeRows {
      grid-column: 1;
      grid-row: 1 / 5;
    }
    
    `;

  //Define public properties (databinding)
  @property() connections: string[] = [];
  @property() history: {}[] = [];

  //Status changed
  statusChanged(receivedEvent: Event) {
    mx.debug.log("active connections updated");
    this.connections = Object.keys(receivedEvent.payload);
  }

  //History changed
  historyChanged(receivedEvent: Event) {
    this.history = receivedEvent.payload;
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
    mx.socket.connectGroup(groupKey, this);
  }



  //Create HTML Templates

  templateMachineGrid() {
    return html`
    ${mx.machine.keys.map(machineKey => {


      return html`
      <div class="machine greyBk">

      <a @click=${() => this.connectAllSockets(machineKey)} title="Connect to all ports on ${machineKey}.">
      <mx-icon class="fas fa-server" color=${mx.machine.hasType(machineKey, "msl") ? mx.machine.list[machineKey].ip == 'localhost' ? '#ec2028' : 'navy' : ''}></mx-icon>
      <span style="font-weight:600">${machineKey}</span>
      </a>
  
      ${mx.machine.list[machineKey].ports.map((portKey: string) => html`
      <p>
      <a @click=${() => this.connectSocket(machineKey, portKey)} title="Connect to this port.">
      <mx-icon class="fas fa-router" color=${mx.machine.ports[portKey].type == 'msl' ? mx.machine.list[machineKey].ip == 'localhost' ? '#ec2028' : 'navy' : mx.machine.ports[portKey].type == 'admin' ? mx.machine.list[machineKey].ip == 'localhost' ? 'darkOrange' : 'purple' : ''}></mx-icon>
      ${portKey}
      </p>
      `)}
  
    </div>
    `})}
    `
  }

  templateCommunicators() {
    return html`
    <i class="fas fa-server"></i>

    ${this.connections.map(socketKey => html`
      <div class="threeColumns">
        <mx-communicator socket=${socketKey} .history=${this.history} .connector=${this}></mx-communicator>
      </div>
    `)}
    `
  }

  templateGroups() {

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
      <mx-icon class="fas fa-server" color=${mx.machine.hasType(machineKey, "msl") ? mx.machine.list[machineKey].ip == 'localhost' ? '#ec2028' : 'navy' : ''}></mx-icon>
      ${machineKey}
      </p>
      `)}
  
    </div>
    `})}
    `
  }

  templateHistory() {

   

    //Setup for historyIndex
    let historyLength = this.history.length

    //Only draw if history exists (early return)
    if (historyLength < 1) {
      return;
    }


    //Setup for collecting all items from history array
    let historyItemTemplates;

    //look at all history items
    for (let historyIndex in this.history) {
      
      //Add the template for this history item to the outgoing HTML
      historyItemTemplates = html`${historyItemTemplates} ${this.templateHistoryItem(historyIndex)}`;
    }
    
    //Return history item templates
    return html`
    ${historyItemTemplates}
    `

  }

  templateHistoryItem(historyIndex) {

    //Remember history item
    let historyItem = this.history[historyIndex];

    //Setup for collecting all socket info for this item
    let socketTemplates;

    //look at all socket keys on this history item
    for (let socketKey of Object.keys(this.history[historyIndex])) {

      //Add one socket key's template to the history item
      socketTemplates = html`${socketTemplates} ${this.templateSocketItem(socketKey,historyItem[socketKey])}`
    }

    //Return socket templates HTML
    return html`
    Message ${historyIndex}
    ${socketTemplates}
    `
  }


  templateSocketItem(socketKey, messageValues) {

    //Extract sent and received messages from history item
    let [message,receivedMessage] = messageValues;

    return html`
    <div style="grid-column: 1 / 4">
    ${socketKey}: sent ${message} received ${receivedMessage}
    </div>
    `
  }

  templateVisualKey() {

    return html`
  <div class="machine greyBk threeRows">
  
  <mx-icon class="fas fa-key"></mx-icon>
  <span style="font-weight:600">key</span>

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


  //Show this component on screen
  render() {

    //BEFORE TEMPLATE

    //Add event listeners for events targeting this component
    this.addEventListener("status-changed", this.statusChanged);
    this.addEventListener("history-changed", this.historyChanged);


    return html`

    <p>Click a server, port, or group to connect. Then send a message.</p>
    <p>Click a message icon to send it again.</p>
    <br>

    <div class="grid">
     ${this.templateVisualKey()}
      ${this.templateMachineGrid()}
      ${this.templateGroups()}
      ${this.templateHistory()}
      ${this.templateCommunicators()}
    </div>
    
    <br>
  `;

  }

}
