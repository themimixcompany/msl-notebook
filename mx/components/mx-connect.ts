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
    ol,ul, input, h2, p, .machine, div { font-family: Inter; font-size: 18pt }
    p {margin-top: 5px; margin-bottom: 5px;}
    .elide {text-overflow: ellipsis; overflow: hidden; white-space: nowrap}
    .greyBk {background-color:#ccc; padding:5px;}
    .darkGreyBk {background-color:#aaa; padding:5px;}
    .veryDarkGreyBk {background-color:#606060; padding:5px;}
    .gridHeader {background-color:#bbb; font-family: Inter; font-size: 20pt }
    a { text-decoration: none; cursor: pointer;}
    a:hover {text-decoration: underline}
    .whiteHeaderText {color:white;font-weight:500;}
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .grid-fixed-rows {
      display: grid;
      grid-template-columns: 100px 175px 1fr 250px 250px 80px;
      grid-auto-rows: 28pt;
      gap: 3px;
    }
    .grid2 {
        display: grid;
        grid-template-columns: 100px 175px 1fr 250px 250px 80px;
        gap: 3px;
      }
    `;

  //Setup for Run Once
  hasRun = false;

  // PRIVATE PROPERTIES //////////

  

  @state() isActionsHidden: boolean = true;
  @state() emptyCommunicator;
  @state() url: string = "";
  @state() communicators;

  //Type Colors
  localMslColor = "#F65314";
  localAdminColor = "#FFBB00";
  remoteMslColor = "#00A1F1";
  remoteAdminColor = "#7CBB00";

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

      <div class="greyBk" style="font-weight:900">
      <mx-icon class="fas fa-plug" color=${mx.machine.hasType(machineKey, "msl") ? mx.machine.list[machineKey].ip == 'localhost' ? this.localMslColor : this.remoteMslColor : ''} style="cursor:pointer;"></mx-icon>
      </div>

      <div class="greyBk elide">
        <mx-icon @click=${() => this.connectMachine(machineKey)} title="Connect to all ports on ${machineKey}." class="fas fa-server" color=${mx.machine.hasType(machineKey, "msl") ? mx.machine.list[machineKey].ip == 'localhost' ? this.localMslColor : this.remoteMslColor : ''} style="cursor:pointer;"></mx-icon>
        <a @click=${() => this.connectMachine(machineKey)} title="Connect to all ports on ${machineKey}."><span style="font-weight:600">${machineKey}</span></a>
      </div>

      <div style="grid-column: 3/span 3; display: grid; gap: 3px; grid-template-columns: repeat(${mx.machine.list[machineKey].ports.length},1fr); grid-auto-rows: 28pt;">

        ${mx.machine.list[machineKey].ports.map((portKey: string) => html`
        <div class="greyBk">
          <mx-icon @click=${() => this.connectPort(machineKey, portKey)}  title="Connect to ${portKey} on ${machineKey}." class="fas fa-router" color=${mx.machine.ports[portKey].type == 'msl' ? mx.machine.list[machineKey].ip == 'localhost' ? this.localMslColor : this.remoteMslColor : mx.machine.ports[portKey].type == 'admin' ? mx.machine.list[machineKey].ip == 'localhost' ? this.localAdminColor : this.remoteAdminColor : ''} style="cursor:pointer;"></mx-icon>
          <a @click=${() => this.connectPort(machineKey, portKey)} title="Connect to ${portKey} on ${machineKey}." class=${this.connections[`${machineKey}-${portKey}`] ? "active" : ""} >${portKey}</a>
        </div>
        `)}
      </div>

      <div class="greyBk" style="text-align:right">
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
      <mx-icon class="fas ${mx.machine.groups[groupKey].ports ? "fa-project-diagram" : mx.machine.groups[groupKey].relay ? "fa-network-wired" : "fa-object-ungroup"}" style="cursor:pointer;"></mx-icon>
      </div>

      <div class="machine greyBk elide">
        <mx-icon @click=${() => this.connectGroup(groupKey)} title="Connect to all machines in the ${groupKey} group." class="fas ${mx.machine.groups[groupKey].ports ? "fa-project-diagram" : mx.machine.groups[groupKey].relay ? "fa-network-wired" : "fa-object-ungroup"}" style="cursor:pointer;"></mx-icon>
        <a @click=${() => this.connectGroup(groupKey)} title="Connect to all machines in the ${groupKey} group.">
        <span style="font-weight:600">${groupKey}</span></a>
      </div>

      <div style="grid-column: 3/span 3; display: grid; gap: 3px; grid-template-columns: repeat(${mx.machine.groups[groupKey].machines.length},1fr); grid-auto-rows: 28pt;">
        ${mx.machine.groups[groupKey].machines.map((machineKey: string) => html`
        <div class="machine greyBk">
          <mx-icon class="fas fa-server" color=${mx.machine.hasType(machineKey, "msl") ? mx.machine.list[machineKey].ip == 'localhost' ? this.localMslColor : this.localAdminColor : ''}></mx-icon>
          ${machineKey}
        </div>
        `)}
      </div>

      <div class="machine greyBk">
       
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
    <div class="greyBk" style="font-weight:900">
      <mx-icon class="fas fa-arrow-alt-right"></mx-icon>
      <mx-icon class="fas fa-plug"></mx-icon>
    </div>
    
    <div class="greyBk" style="font-weight:600">
    <mx-icon class="fas fa-lightbulb"></mx-icon> new
    </div> 

    <div class="greyBk"  style="grid-column: 3/ span 4;padding-left:0px;padding-top:0px;padding-right:6px;">
    <input @keydown=${this.urlKeyDown} placeholder="echo.websocket.org" style="width:100%">
    </div>

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

    let machineListHeader = html`
    <div class="whiteHeaderText darkGreyBk">
     <mx-icon class="fas fa-list-ul"></mx-icon>
    </div>

    <div class="whiteHeaderText darkGreyBk">
        <div>
            <mx-icon title="Available machines." class="fas fa-server"></mx-icon> machines
        </div
        <div>
            
        </div>
    </div>

    <div class="whiteHeaderText darkGreyBk" style="grid-column: 3/span 3">
    <mx-icon title="Ports available on the machine." class="fas fa-router"></mx-icon> ports
    </div>


        <div class="whiteHeaderText darkGreyBk elide" style="text-align:right;">
        ${true ? html`
            <mx-icon @click=${() => this.showOrHide() } style="cursor:pointer;" color=${this.isHidden ? "currentColor" : "lightGrey"} title="${this.isHidden ? "Show" : "Hide"} all actions and responses."  class=${this.isHidden ? "fas fa-eye" : "fas fa-eye-slash"}></mx-icon>
            ` : ""}
            <mx-icon class="fas fa-plus-square" style="cursor:pointer;opacity:0"></mx-icon>
        </div>

    `

    let groupListHeader = html`
    <div class="whiteHeaderText darkGreyBk">
     <mx-icon class="fas fa-list-ul"></mx-icon>
    </div>

    <div class="whiteHeaderText darkGreyBk">
        <div>
            <mx-icon title="Available groups." class="fas fa-server"></mx-icon> groups
        </div
        <div>
            
        </div>
    </div>

    <div class="whiteHeaderText darkGreyBk" style="grid-column: 3/span 3">
    <mx-icon title="Ports available on the machine." class="fas fa-router"></mx-icon> machines
    </div>


        <div class="whiteHeaderText darkGreyBk elide" style="text-align:right;">
        ${true ? html`
            <mx-icon @click=${() => this.showOrHide() } style="cursor:pointer;" color=${this.isHidden ? "currentColor" : "lightGrey"} title="${this.isHidden ? "Show" : "Hide"} all actions and responses."  class=${this.isHidden ? "fas fa-eye" : "fas fa-eye-slash"}></mx-icon>
            ` : ""}
            <mx-icon class="fas fa-plus-square" style="cursor:pointer;opacity:0"></mx-icon>
        </div>

    `

    return html`

    <ol>
      <li>Click a <mx-icon class="fas fa-server"></mx-icon> server, <mx-icon class="fas fa-router"></mx-icon> port, or <mx-icon class="fas fa-network-wired"></mx-icon> group to connect.</li>
      <li>When connected, use the <mx-icon class="fas fa-keyboard"></mx-icon> communicator to send messages.
      <li>Click a sent message or reply icon to resend it.</li>
    </ol>



    

    <div class="grid-fixed-rows">
      ${groupListHeader}
      ${this.templateGroups()}
    </div>

    <div class="grid-fixed-rows" style="margin-top:3px;">
    ${machineListHeader}
    ${this.templateMachineGrid()}
    ${this.templateConnectURL()}
    </div>

    <br>
    ${this.communicators}
    ${this.emptyCommunicator}

    <br>
   
  
  `;
  }
}
