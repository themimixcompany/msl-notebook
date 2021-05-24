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
    ol,ul, input, h2, p, .machine, .results { font-family: Inter; font-size: 18pt }
    p {margin-top: 5px; margin-bottom: 5px;}
    .greyBk {background-color:#ccc}
    .gridHeader {background-color:#bbb}
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

  //PORT connect link clicked
  connectPort(machineKey: string, portKey: string) {
    mx.socket.connectPort(machineKey, portKey, this);
    ;
  }

  //MACHINE connect link clicked
  connectMachine(machineKey: string) {
    mx.socket.connectMachine(machineKey, this);
  }

  //GROUP connect link clicked
  connectGroup(groupKey: string) {
    mx.socket.connectGroup(groupKey, this);
  }



  //Create HTML Templates

  templateMachineGrid() {
    return html`
    ${mx.machine.keys.map(machineKey => {


      return html`
      <div class="machine greyBk">

      <a @click=${() => this.connectMachine(machineKey)} title="Connect to all ports on ${machineKey}.">
      <mx-icon class="fas fa-server" color=${mx.machine.hasType(machineKey, "msl") ? mx.machine.list[machineKey].ip == 'localhost' ? '#ec2028' : 'navy' : ''}></mx-icon>
      <span style="font-weight:600">${machineKey}</span>
      </a>
  
      ${mx.machine.list[machineKey].ports.map((portKey: string) => html`
      <p>
      <a @click=${() => this.connectPort(machineKey, portKey)} title="Connect to this port.">
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
      historyItemTemplates = html`
      ${historyItemTemplates}
      ${this.templateHistoryItem(historyIndex)}`;
    }
    
    //Return history item templates
    return html`
        
    <div class="grid2 greyBk results">
    ${historyItemTemplates}
    </div>
    `

  }

  templateHistoryItem(historyIndex) {

    //Remember history item
    let historyItem = this.history[historyIndex];

    //Get first socket in history; this was the originating sender. Used for detecting relay result messages.
    let originalSendingSocket = Object.keys(historyItem)[0];

    let historyItemHeader = html`
    <div class="whiteHeaderText">
    message #${historyIndex * 1 + 1}
    </div>
    <div class="whiteHeaderText">
    to socket
    </div>
    <div class="whiteHeaderText">

    </div>
    <div class="whiteHeaderText">
    from socket
    </div>
    <div class="whiteHeaderText">
    received message
    </div>
  `

    //Setup for collecting all socket info for this item
    let socketTemplates;

    //look at all socket keys on this history item
    for (let socketKey of Object.keys(this.history[historyIndex])) {

      //Add one socket key's template to the history item
      socketTemplates = html`${socketTemplates} ${this.templateSocketItem(socketKey,historyItem[socketKey],originalSendingSocket)}`
    }

    //Return socket templates HTML
    return html`
    ${historyItemHeader}
    ${socketTemplates}
    `
  }


  templateSocketItem(socketKey, messageValues, originalSendingSocket) {

    //Extract sent and received message info
    const [sentMessage,receivedMessage] = messageValues;

    //Setup Colors
    let sentWireColor = mx.socket.list[socketKey].port.type == 'msl' ? mx.socket.list[socketKey].machine.ip == 'localhost' ? '#ec2028' : 'navy' : mx.socket.list[socketKey].port.type == 'admin' ? mx.socket.list[socketKey].machine.ip == 'localhost' ? 'darkOrange' : 'purple' : ''
    let ReceivedWireColor = mx.socket.list[socketKey].port.type == 'msl' ? mx.socket.list[socketKey].machine.ip == 'localhost' ? '#ec2028' : 'navy' : mx.socket.list[socketKey].port.type == 'admin' ? mx.socket.list[socketKey].machine.ip == 'localhost' ? 'darkOrange' : 'purple' : ''

    //Setup Icons
    let sentMessageIcon = socketKey == originalSendingSocket ? 'fas fa-keyboard' : 'fas fa-project-diagram';
    let receivedMessageIcon = sentMessage != "" ? 'fas fa-comment' : 'fas fa-comment-check';

    //Build single result template
    let singleResult = html`
    <div>
      ${sentMessage ? html`<mx-icon class=${sentMessageIcon} color="${sentWireColor}" style="cursor:pointer;"></mx-icon> ${sentMessage}`:""} 
    </div>
    <div>
    ${sentMessage ? html`<mx-icon class="fas fa-router" color="${sentWireColor}"></mx-icon> ${socketKey}`: ""}
    </div>
    <div>
    ${sentMessage ? html`==>` : ""}
    </div>
    <div>
      <mx-icon class= "fas fa-router" color="${ReceivedWireColor}"></mx-icon> ${socketKey}
    </div>
    <div>
      <mx-icon class=${receivedMessageIcon} color="${ReceivedWireColor}"></mx-icon>  ${receivedMessage}
    </div>
`;

//Return HTML
return singleResult;

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

    //Results Header
    templateHistoryHeader() { return html`
    <div class="gridHeader results" style="font-weight:600">
      history
      <mx-icon @click=${this.emptyResults} style="cursor:pointer;" title="Remove this socket's message results." size=".9" class="fas fa-trash"></mx-icon>
      <mx-icon @click=${this.showOrHideResults} style="cursor:pointer;" color=${this.isHidden ? "white" : "currentColor"} title="${this.isHidden ? "Show" : "Hide"} the message results." size=".9" class="fas fa-eye"></mx-icon>
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
      <br>
    </div>
    ${this.templateHistoryHeader()}
    ${this.templateHistory()}
    <br>
    ${this.templateCommunicators()}
   
  `;

  }

}
