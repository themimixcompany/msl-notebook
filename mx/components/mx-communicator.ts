// <mx-communicator>
// by The Mimix Company

//Provides two-way communication between the browser and a single websocket using MSL.js. Also collects all other messages triggered by the sent message, such as admin replies and relays.

//Lit Dependencies
import { html, css, LitElement, CSSResult, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

//MSL.js Services
import * as mx from 'msl-js/service-loader';

//<mx-communicator>
@customElement('mx-communicator')
export class mxCommunicator extends LitElement {

  static styles = css`
  ol,ul, input, h2, p, .machine, div { font-family: Inter; font-size: 18pt }
  p {margin-top: 5px; margin-bottom: 5px;}
  .elide {text-overflow: ellipsis; overflow: hidden; white-space: nowrap}
  .greyBk {background-color:#ccc; padding:5px;}
  .darkGreyBk {background-color:#aaa; padding:5px;}
  .navyBk {background-color:#606060; padding:5px;}
  .activeBk {background-color:navy; padding:5px;}
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
    grid-auto-rows: 26pt;
    gap: 3px;
  }
  .grid2 {
      display: grid;
      grid-template-columns: 100px 175px 1fr 250px 250px 80px;
      gap: 3px;
    }
  `;


  //PRIVATE PROPERTIES //////////

  //Setup for Run Once
  hasRun = false;

   //Type Colors
   localMslColor = "#F65314";
   localAdminColor = "#FFBB00";
   remoteMslColor = "#00A1F1";
   remoteAdminColor = "#7CBB00";

  // PUBLIC PROPERTIES //////////

  //Define public properties (databinding)
  @property() socketKey: string;
  @property() message: string = "";
  @property() isHidden: boolean = false;
  @property() isDisabled: boolean = false;
  @property() actionList: {}[] = [];
  @property() connections: {} = {};
  @property() privateActionList: {}[] = [];
  @property() connector


  //Private Functions

  //Close Socket
  closeSocket() {
    let socket = mx.socket.connections[this.socketKey]
    socket.mxClose(this, this.actionList);
  }

  //Update results area when a message is received
  messageReceived(event: CustomEvent) {
    this.privateActionList = event.detail;
    event.cancelBubble = true;
  }


  //Check for message input box Enter key pressed to send message
  mslBoxKeyDown(event: Event) {
    const eventTarget = event.target as HTMLInputElement
    const message = eventTarget.value;
    if (event.keyCode == 13) {
      //Send message
      this.sendMessage(message);
      //this.isDisabled = true;
    }
  }

  //Send Message
  //Call mxSend w/ notifyElement=this to notify this component; echo=true to echo original message (not just response)
  sendMessage(message: string) {

    mx.socket.list[this.socketKey].mxSend(message, true, this, this.actionList, this.privateActionList);


  }

// HTML TEMPLATES

//Input Box
templateInputBox() {

   //Get a reference to the socket for this communicator
   let socket = mx.socket.list[this.socketKey];

    //Setup Colors
     let toWireColor = socket.port.type == 'msl' ? socket.machine.ip == 'localhost' ? this.localMslColor : this.remoteMslColor : socket.port.type == 'admin' ? socket.machine.ip == 'localhost' ? this.localAdminColor : this.remoteAdminColor : ''

   
  return html`
    <div class="whiteHeaderText elide ${this.isHidden ? "navyBk" : "activeBk"}" style="padding-left:10px;font-weight:900;grid-row:1/span 2">
      <mx-icon class="fas fa-arrow-alt-right">
      </mx-icon>
      ${this.actionList.length * 1 + 1}.
    </div>

    <div class="whiteHeaderText navyBk elide ${this.isHidden ? "navyBk" : "activeBk"}" style="grid-row:1/span 2">
      <mx-icon style="cursor:pointer" title=${`Send a message to ${this.socketKey}`} class="fas fa-keyboard" color=${toWireColor}>
      </mx-icon> 
      send
    </div>

    <div style="grid-column:3/span 4;padding-left:0px;padding-right:6px;">
      <input ?disabled=${this.isDisabled} style="width:100%" @keydown=${this.mslBoxKeyDown} placeholder="${socket?.port.type}"></input>
    </div>

  

`
}

  //Connections Chooser
  templateConnections() {

    let connectionList: TemplateResult

    for (let socketKey in this.connections) {

  
      //Setup Colors
      let toSocket = mx.socket.list[socketKey];
      let toWireColor = toSocket.port.type == 'msl' ? toSocket.machine.ip == 'localhost' ? this.localMslColor : this.remoteMslColor : toSocket.port.type == 'admin' ? toSocket.machine.ip == 'localhost' ? this.localAdminColor : this.remoteAdminColor : ''

      //Test if socket is currently selected
      let isSelectedSocket = socketKey == this.socketKey ? true : false;

      //Setup opacity
      let opacity = isSelectedSocket ? 1 : .5;


      //Create the icon and socketKey for each available connection
      connectionList = html`${connectionList}
      <div class="activeBk whiteHeaderText">
        <mx-icon style="cursor:pointer;opacity:${opacity}" @click=${() => this.socketKey = socketKey} title=${this.socketKey ? `Direct your message to ${socketKey}` : ""} class="fas fa-router" color=${toWireColor}></mx-icon><a style="opacity:${opacity}" title=${`Direct your message to ${socketKey}`} @click=${() => this.socketKey = socketKey}>${socketKey}</a>
      </div>
      `
    }

    return html`

          <div style="grid-column: 3/span 3; display: grid; gap: 3px; grid-auto-rows: 26pt; grid-template-columns: repeat(${Object.keys(this.connections).length},1fr)">
          ${connectionList}
          </div>

          <div class="activeBk whiteHeaderText" style="padding-left:3px;text-align:right;">
                <mx-icon class="fas fa-plus-square"></mx-icon>
                <mx-icon @click=${() => this.closeSocket()} style="cursor:pointer;margin-right:3px;" title="Close the connection to ${this.socketKey}." class="fas fa-minus-square">
      </mx-icon>
          </div>
        `
  }

  //Show this component on screen
  render() {

    //BEFORE TEMPLATE

    //Run Once

    if (!this.hasRun) {

      //Add event listeners for events targeting this component
      this.addEventListener("message-received", this.messageReceived);


      //Remember we ran once
      this.hasRun = true;

    }


    //RENDER TEMPLATE

    return html`
    <div class="grid-fixed-rows">
      ${!this.isDisabled && this.connections[this.socketKey] ? this.templateInputBox() : ""}
      ${!this.isDisabled ? this.templateConnections() : ""}
    </div>
    <mx-actions .isHidden=${this.isHidden} .actionList=${this.privateActionList} .fullActions=${this.actionList} .name=${this.socketKey} .connector=${this.connector}></mx-actions>
    `
  }
}
