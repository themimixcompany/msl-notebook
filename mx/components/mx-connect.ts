// <mx-connect>
// by The Mimix Company

//Lists ports, machines, and groups available in the config .json files and opens connections to them. Keeps a collective list of actions for all connections it opens. Displays communicators for each socket.

//Lit Dependencies
import { html, css, LitElement, TemplateResult, Template } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

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
    .active {color:green}
    a {text-decoration: none; cursor: pointer;}
    a:hover {text-decoration: underline;}
    .whiteHeaderText {color:white;font-weight:500;}
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
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

  // PRIVATE PROPERTIES //////////

  @state() isActionsHidden: boolean = true;
  @state() emptyCommunicator;
  @state() url: string = "";
  @state() communicators;

  // PUBLIC PROPERTIES /////////

  @property() machines: {} = mx.machine.machines;
  @property() connections: {} = {};
  @property() actionList: {}[] = [];
 
  //Key pressed in URL input box? Check for Enter.
  urlKeyDown(event: Event) {

    //Enter key?
    if (event.keyCode == 13) {

      //Get URL from input box
      this.url = (event.target as HTMLInputElement).value;

      //Connect to URL, add it to connection list, and create communicator.
      mx.socket.connect(this.url, this, this.actionList);
    }
  }

  //Machines changed
  machinesChanged(receivedEvent: CustomEvent) {
    mx.debug.log("available machines updated");
    this.machines = mx.machine.machines;

     //Display an empty communicator
     this.emptyCommunicator = this.templateSingleCommunicator(Object.keys(this.connections)[0],[])
  }

  //Status changed
  statusChanged(receivedEvent: CustomEvent) {
    mx.debug.log("active connections updated");
    this.connections = receivedEvent.detail;

      //Display an empty communicator
      this.emptyCommunicator = this.templateSingleCommunicator(Object.keys(this.connections)[0],[])
  }

  //Actions changed
  actionsChanged(receivedEvent: CustomEvent) {
    this.actionList = receivedEvent.detail;

    //Update communicators
    this.communicators = this.templateCommunicators();

     //Display an empty communicator
     this.emptyCommunicator = this.templateSingleCommunicator(Object.keys(this.connections)[0],[])
  }

  //Show or hide actions
  actionsHiddenChanged(receivedEvent: CustomEvent) {
    this.isActionsHidden = !this.isActionsHidden;
    //Update communicators
    this.communicators = this.templateCommunicators();

  }

  //Setup last (empty, current) communicator with values
  communicatorChanged(event: CustomEvent) {

    console.log("communicator changed")

    let { socketKey, message } = event.detail;
    let payload = {
      "socketKey": socketKey,
      "message": message
    }

     //If the requested socket is live...
     if (this.connections[socketKey]) {

      //Retemplate it with new values
      this.emptyCommunicator = this.templateSingleCommunicator(socketKey);
    }

  }

  //PORT connect link clicked
  connectPort(machineKey: string, portKey: string) {
    mx.socket.connectPort(machineKey, portKey, this, [], this.actionList);
    ;
  }

  //MACHINE connect link clicked
  connectMachine(machineKey: string) {
    mx.socket.connectMachine(machineKey, this, [], this.actionList);
  }

  //GROUP connect link clicked
  connectGroup(groupKey: string) {
    mx.socket.connectGroup(groupKey, this, this.actionList);
  }

  //Create HTML Templates

  //Machine grid. Shows all machines.
  templateMachineGrid() {
    return html`
    ${Object.keys(this.machines).map(machineKey => {


      return html`
      <div class="machine greyBk">

      <mx-icon @click=${() => this.connectMachine(machineKey)} title="Connect to all ports on ${machineKey}." class="fas fa-server" color=${mx.machine.hasType(machineKey, "msl") ? mx.machine.list[machineKey].ip == 'localhost' ? '#ec2028' : 'navy' : ''} style="cursor:pointer;"></mx-icon>
      <a @click=${() => this.connectMachine(machineKey)} title="Connect to all ports on ${machineKey}."><span style="font-weight:600">${machineKey}</span></a>
  
      ${mx.machine.list[machineKey].ports.map((portKey: string) => html`
      <p>
        <mx-icon @click=${() => this.connectPort(machineKey, portKey)}  title="Connect to ${portKey} on ${machineKey}." class="fas fa-router" color=${mx.machine.ports[portKey].type == 'msl' ? mx.machine.list[machineKey].ip == 'localhost' ? '#ec2028' : 'navy' : mx.machine.ports[portKey].type == 'admin' ? mx.machine.list[machineKey].ip == 'localhost' ? 'darkOrange' : 'purple' : ''} style="cursor:pointer;"></mx-icon>
        <a @click=${() => this.connectPort(machineKey, portKey)} title="Connect to ${portKey} on ${machineKey}." class=${this.connections[`${machineKey}-${portKey}`] ? "active" : ""} >${portKey}</a>
      </p>
      `)}
  
    </div>
    `})}
    `
  }

  //Template all communicators. Draws one communicator for each action item.
  templateCommunicators() {

    //Setup array to hold all communicator templates.
    let allCommunicators: TemplateResult[] = [];

    //For each send action, add a communicator.
    for (let actionIndex in this.actionList) {

      //Get the action item itself.
      let actionItem = this.actionList[actionIndex];

      //Hide type 0 connect communicators by default.
      let isHidden = this.isActionsHidden;
      if (actionItem["type"] == 0) {
        isHidden = true;
      }

      //Add a disabled communicator w/ its action information.
      allCommunicators.push(this.templateSingleCommunicator(actionItem["to"], [actionItem], true, this.isActionsHidden));

    }

    return allCommunicators;
  }

  //Template one communicator.
  templateSingleCommunicator(socketKey, privateActionList: {}[] = [], isDisabled = false, isHidden = false) {
    return html`
      <div style="height:3px;">&nbsp;</div>
      <mx-communicator 
        .isDisabled=${isDisabled} 
        .isHidden=${isHidden}
        .connections=${this.connections} 
        .socketKey=${socketKey} 
        .actionList=${this.actionList} 
        .privateActionList=${privateActionList} 
        .connector=${this}>
      </mx-communicator> 
  `
  }


  //Groups template. Draws one panel for each group.
  templateGroups() {

    return html`
    ${mx.machine.groupKeys.map(groupKey => {

      return html`
      <div class="machine greyBk">

      <mx-icon @click=${() => this.connectGroup(groupKey)} title="Connect to all machines in the ${groupKey} group." class="fas ${mx.machine.groups[groupKey].ports ? "fa-project-diagram" : mx.machine.groups[groupKey].relay ? "fa-network-wired" : "fa-object-ungroup"}" color="navy" style="cursor:pointer;"></mx-icon>
      <a @click=${() => this.connectGroup(groupKey)} title="Connect to all machines in the ${groupKey} group."><span style="font-weight:600">${groupKey}</span></a>
  
      ${mx.machine.groups[groupKey].machines.map((machineKey: string) => html`
      <p style="background-color:grey">
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


      //Add event listeners for events targeting this component
      this.addEventListener("machines-changed", this.machinesChanged);
      this.addEventListener("status-changed", this.statusChanged);
      this.addEventListener("actions-changed", this.actionsChanged);
      this.addEventListener("communicator-changed", this.communicatorChanged);
      this.addEventListener("actions-hidden", this.actionsHiddenChanged)


      //Remember we ran once
      this.hasRun = true;

    }



    return html`

    <ol>
      <li>Click a <mx-icon class="fas fa-server"></mx-icon> server, <mx-icon class="fas fa-router"></mx-icon> port, or <mx-icon class="fas fa-network-wired"></mx-icon> group to connect.</li>
      <li>When connected, use <mx-icon class="fas fa-keyboard"></mx-icon> communicators to send messages.
      <li>Click a sent message or reply icon to resend it.</li>
    </ol>



    ${this.templateConnectURL()}

    <div class="grid">
      ${this.templateVisualKey()}
      ${this.templateMachineGrid()}
      ${this.templateGroups()}
    </div>

     <br>
    ${this.communicators}
    ${this.emptyCommunicator}

    <br>
   
  
  `;
  }
}
