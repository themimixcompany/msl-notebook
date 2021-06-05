// <mx-connect>
// by The Mimix Company

//Lists ports, machines, and groups available in the config .json files and opens connections to them. Keeps a collective list of actions for all connections it opens. Displays communicators for each socket.

//Lit Dependencies
import { mxElement } from 'global/mx-styles';
import { html, css, LitElement, TemplateResult, Template } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

//MSL.js Services
import * as mx from 'msl-js/service-loader'
import { machine } from 'msl-js/service-loader';

//<mx-connect>
@customElement('mx-connect')
export class mxConnect extends mxElement {
  
  //CSS PROPERTIES //////////

    //Use shared styles
    static get styles() {
      return [
        super.styles,
        css``
      ];
    }

  //Setup for Run Once
  hasRun = false;

  // PRIVATE PROPERTIES //////////

  @state() isActionsHidden: boolean = true;
  @state() emptyCommunicator;
  @state() url: string = "";
  @state() communicators;
  @state() isGroupsHidden = false;
  @state() isMachinesHidden = false;

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
    this.emptyCommunicator = this.templateSingleCommunicator(Object.keys(this.connections)[0], [])
  }

  //Status changed
  statusChanged(receivedEvent: CustomEvent) {
    mx.debug.log("active connections updated");
    this.connections = receivedEvent.detail;

    //Display an empty communicator
    this.emptyCommunicator = this.templateSingleCommunicator(Object.keys(this.connections)[0], [])
  }

  //Actions changed
  actionsChanged(receivedEvent: CustomEvent) {
    this.actionList = receivedEvent.detail;

    //Update communicators
    this.communicators = this.templateCommunicators();

    //Display an empty communicator
    this.emptyCommunicator = this.templateSingleCommunicator(Object.keys(this.connections)[0], [])
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

  //Shows all machines.
  templateMachines() {
    return html`
    ${Object.keys(this.machines).map(machineKey => {

      return html`

      <div class="greyBk">
      <mx-icon @click=${() => this.connectMachine(machineKey)} title="Connect to all ports on ${machineKey}." class="fas fa-plug" color=${mx.machine.hasType(machineKey, "msl") ? mx.machine.list[machineKey].ip == 'localhost' ? localMslColor : remoteMslColor : ''} style="cursor:pointer;"></mx-icon>
      </div>

      <div class="greyBk elide">
        <mx-icon @click=${() => this.connectMachine(machineKey)} title="Connect to all ports on ${machineKey}." class="fas fa-server" color=${mx.machine.hasType(machineKey, "msl") ? mx.machine.list[machineKey].ip == 'localhost' ? localMslColor : remoteMslColor : ''} style="cursor:pointer;"></mx-icon>
        <a @click=${() => this.connectMachine(machineKey)} title="Connect to all ports on ${machineKey}."><span>${machineKey}</span></a>
      </div>

      <div style="grid-column: 3/span 3; display: grid; gap: 3px; grid-template-columns: repeat(${mx.machine.list[machineKey].ports.length},1fr); grid-auto-rows: 28pt;">

        ${mx.machine.list[machineKey].ports.map((portKey: string) => html`
        <div class="greyBk">
          <mx-icon @click=${() => this.connectPort(machineKey, portKey)}  title="Connect to ${portKey} on ${machineKey}." class="fas fa-router" color=${mx.machine.ports[portKey].type == 'msl' ? mx.machine.list[machineKey].ip == 'localhost' ? localMslColor : remoteMslColor : mx.machine.ports[portKey].type == 'admin' ? mx.machine.list[machineKey].ip == 'localhost' ? localAdminColor : remoteAdminColor : ''} style="cursor:pointer;"></mx-icon>
          <a @click=${() => this.connectPort(machineKey, portKey)} title="Connect to ${portKey} on ${machineKey}." class=${this.connections[`${machineKey}-${portKey}`] ? "active" : ""} >${portKey}</a>
        </div>
        `)}
        
      </div>

      <div class="greyBk whiteHeaderText" style="text-align:right">
      ${machineKey == Object.keys(machine.list)[0] ? html`
      <mx-icon title="Download the port list as JSON." class="fas fa-file-export" style="cursor:pointer" @click=${() => downloadJSON(mx.machine.ports,"ports")}></mx-icon>
      </div>
      ` : ""}
    `})}
    `
  }

    //Groups template. Draws one panel for each group.
    templateGroups() {

      return html`
      ${mx.machine.groupKeys.map(groupKey => {
  
        //Setup group icon
        let groupIcon = mx.machine.groups[groupKey].ports ? "fas fa-project-diagram" : mx.machine.groups[groupKey].type ? "fas fa-network-wired" : "fas fa-object-ungroup"
  
        //Setup group tooltip
        let groupTooltip = mx.machine.groups[groupKey].ports ? `The ${groupKey} group defines specific relay ports.` : mx.machine.groups[groupKey].type ? `The ${groupKey} group relays messages between ${mx.machine.groups[groupKey].type} ports.` : `The ${groupKey} group opens the machines without any relays.`
  
        return html`
        <div class="machine greyBk">
        <mx-icon @click=${() => this.connectGroup(groupKey)} title=${groupTooltip} class="fas fa-plug" style="cursor:pointer;"></mx-icon>
        </div>
  
        <div class="machine greyBk elide">
          <mx-icon @click=${() => this.connectGroup(groupKey)} title=${groupTooltip} class=${groupIcon} style="cursor:pointer;"></mx-icon>
          <a title="Connect to the ${groupKey} group.">
          <span>${groupKey}</span></a>
        </div>

        ${!mx.machine.groups[groupKey].ports ? html`
        <div style="grid-column: 3/span 3; display: grid; gap: 3px; grid-template-columns: repeat(${mx.machine.groups[groupKey].machines.length},1fr); grid-auto-rows: 28pt;">
          ${mx.machine.groups[groupKey].machines.map((machineKey: string) => html`
            <div class="machine greyBk" style="font-weight:200">
              <mx-icon title="${!mx.machine.groups[groupKey].relay ? `The ${groupKey} group will open all ports on ${machineKey} without any relays.` : `The ${groupKey} group will open all ports on ${mx.machine.machines[machineKey].ip == "localhost" ? "local" : "remote"} machine ${machineKey} and relay ${mx.machine.groups[groupKey].type} messages to other machines in the group.`}" class="fas fa-router" color=${mx.machine.groups[groupKey].type == 'msl' || mx.machine.hasType(machineKey,"msl") ? mx.machine.list[machineKey]["ip"] == 'localhost' ? localMslColor : remoteMslColor : mx.machine.groups[groupKey].type == 'admin' || mx.machine.hasType(machineKey,"admin") ?  mx.machine.list[machineKey]["ip"] == 'localhost' ? localAdminColor : remoteAdminColor : ''}></mx-icon>
              ${machineKey}
            </div>
          `)}
        </div>
        `: ""}

        ${mx.machine.groups[groupKey].ports ? html`
        <div style="grid-column: 3/span 3; display: grid; gap: 3px; grid-template-columns: repeat(${mx.machine.groups[groupKey].ports?.length},1fr); grid-auto-rows: 28pt;">

            ${mx.machine.groups[groupKey].ports.map((portPair: string[]) => html`
            <div style="display: grid; gap: 3px; grid-template-columns: repeat(2,1fr); grid-auto-rows: 28pt;">

              ${portPair.map((socketKey) => html`
                <div class="machine greyBk" style="font-weight:200">

                    ${socketKey == portPair[1] ? html`
                      <mx-icon title="${portPair[0]} relays to ${portPair[1]}" class="fas fa-arrow-alt-right"></mx-icon>
                    ` : ""}

                    <mx-icon color=${mx.machine.index[socketKey]["type"] == 'msl' ? mx.machine.list[mx.machine.index[socketKey]["machineKey"]]["ip"] == 'localhost' ? localMslColor : remoteMslColor : mx.machine.index[socketKey]["type"] == 'admin' ?  mx.machine.list[mx.machine.index[socketKey]["machineKey"]]["ip"] == 'localhost' ? localAdminColor : remoteAdminColor : ''} title=${`The ${groupKey} group will relay from ${portPair[0]} to ${portPair[1]}.`} class="fas fa-router"}>
                    </mx-icon>

                    ${socketKey}

                </div>
            </div>
              `)}
          `)}
        </div>
        `: ""}
  
        <div class="machine greyBk">
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

      //Decide if communicator is hidden. Unhide last item by default.
      let isCommunicatorHidden = this.isActionsHidden

      //Turn actionIndex into a number for math
      let actionIndexNumber: number = parseInt(actionIndex);

      //Find the index of the last item for comparison
      let lastActionIndex = this.actionList.length - 1;

      //If this is the last item
      if (actionIndexNumber == lastActionIndex) {

        //If send or relay action, show by default
        if (actionItem["type"] == 1 || actionItem["type"] == 2) {
          isCommunicatorHidden = false;
        }
      }

      //If this is the second to last item
      if (actionIndexNumber == lastActionIndex - 1) {

        //If send and next item is relay, show by default
        if (actionItem["type"] == 1 && this.actionList[lastActionIndex]["type"] == 2) {
          isCommunicatorHidden = false;
        }

      }

      //Add a disabled communicator w/ its action information.
      allCommunicators.push(this.templateSingleCommunicator(actionItem["to"], [actionItem], true, isCommunicatorHidden));

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
    <div class="greyBk">
      <mx-icon title="Add a new machine." class="fas fa-arrow-alt-right"></mx-icon>
      <mx-icon title="Type a URL in the box and press Enter to connect to a machine that's not on thie list." class="fas fa-server"></mx-icon>
    </div>

    <div class="greyBk"  style="grid-column: 2/ span 5;padding-left:0px;padding-top:0px;padding-right:6px;">
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
     <mx-icon title="Machines are shown in the order defined." class="fas fa-list-ul"></mx-icon>
    </div>

    <div class="whiteHeaderText darkGreyBk">
        <div>
            <mx-icon title="Available machines." class="fas fa-server"></mx-icon> machines
        </div
        <div>
            
        </div>
    </div>

    <div class="whiteHeaderText darkGreyBk" style="grid-column: 3/span 3">
    <mx-icon title="Machines which are part of the group." class="fas fa-router"></mx-icon> ports
    </div>


        <div class="whiteHeaderText darkGreyBk elide" style="text-align:right;">

        <mx-icon title="Download the machine list as JSON." class="fas fa-file-export" style="cursor:pointer" @click=${() => downloadJSON(mx.machine.machines,"machines")}></mx-icon>
        
            <mx-icon @click=${() => this.isMachinesHidden = !this.isMachinesHidden} style="cursor:pointer;" color=${this.isMachinesHidden ? "currentColor" : "lightGrey"} title="${this.isMachinesHidden ? "Show" : "Hide"} the machine list."  class=${this.isMachinesHidden ? "fas fa-eye" : "fas fa-eye-slash"}></mx-icon>

      
        </div>

    `

    let groupListHeader = html`
    <div class="whiteHeaderText darkGreyBk">
     <mx-icon title="Groups are shown in the order defined." class="fas fa-list-ul"></mx-icon>
    </div>

    <div class="whiteHeaderText darkGreyBk" style="grid-column: 2/span 4">
        <div>
            <mx-icon title="Available groups." class="fas fa-network-wired"></mx-icon> groups
        </div>
    </div>

    <div class="whiteHeaderText darkGreyBk elide" style="text-align:right;">

    <mx-icon title="Download the group list as JSON." class="fas fa-file-export" style="cursor:pointer" @click=${() => downloadJSON(mx.machine.groups,"groups")}></mx-icon>

        <mx-icon @click=${() => this.isGroupsHidden = !this.isGroupsHidden} style="cursor:pointer;" color=${this.isGroupsHidden ? "currentColor" : "lightGrey"} title="${this.isGroupsHidden ? "Show" : "Hide"} the group list."  class=${this.isGroupsHidden ? "fas fa-eye" : "fas fa-eye-slash"}></mx-icon>

    </div>

    `

    return html`

    <div class="grid-fixed-rows">
      ${groupListHeader}
      ${!this.isGroupsHidden ? this.templateGroups() : ""}
    </div>

    <div class="grid-fixed-rows" style="margin-top:3px;">
      ${machineListHeader}
      ${!this.isMachinesHidden ? this.templateMachines() : ""}
      ${this.templateConnectURL()}
    </div>

    <br>
    ${this.communicators}
    ${this.emptyCommunicator}
    <br>
   
  
  `;
  }
}
