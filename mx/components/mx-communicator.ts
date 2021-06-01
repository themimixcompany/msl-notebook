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
    p, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
    input, .results { font-family: Inter; font-size: 18pt; }
    .greyBk {background-color:#ccc}
    .lightGrey {color:#ddd;}
    .gridHeader {background-color:#bbb; font-family: Inter; font-size: 20pt }
    a { text-decoration: none; cursor: pointer;}
    a:hover {text-decoration: underline}
    .grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      grid-auto-rows: minmax(100px, auto);
    }
    .grid2 {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 3px;
    }
    `;

  //Setup for Run Once
  hasRun = false;

  //Define public properties (databinding)
  @property() mslResults: any;
  @property({ attribute: false }) socketKey: string; // => let socketKey = attribute named 'socket'
  @property() isHidden: boolean = false;
  @property() isDisabled: boolean = false;
  @property() actionList: {}[] = [];
  @property() connections: {} = {};
  @property() privateActionList: {}[] = [];
  @property() connector;
  @property() nextCommunicator;


  //Private Functions

  //Close Socket
  closeSocket() {
    let socket = mx.socket.connections[this.socketKey]
    socket.mxClose(this,this.actionList);
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
      this.isDisabled = true;
    }
  }

  //Send Message
  //Call mxSend w/ notifyElement=this to notify this component; echo=true to echo original message (not just response)
  sendMessage(message: string) {
    mx.socket.list[this.socketKey].mxSend(message, true, this, this.actionList, this.privateActionList);
    this.nextCommunicator = html`
    <mx-communicator .connections=${this.connections} .socketKey=${this.socketKey} .actionList=${this.actionList}  .connector=${this.connector}></mx-communicator>
    `
  }


  //Communicator Header
  templateListHeader() {

    //Early return. Don't draw connection choices if communicator has been used.
    if (this.isDisabled) {
      return;
    }
    
    let connectionList: TemplateResult

    for (let socketKey in this.connections) {

      //Setup Colors
      let toSocket = mx.socket.list[socketKey];
      let toWireColor = toSocket.port.type == 'msl' ? toSocket.machine.ip == 'localhost' ? '#ec2028' : 'navy' : toSocket.port.type == 'admin' ? toSocket.machine.ip == 'localhost' ? 'darkOrange' : 'purple' : ''

      //Test if socket is currently selected
      let isSelectedSocket = socketKey == this.socketKey ? true : false;

      //Setup opacity
      let opacity = isSelectedSocket ? 1 : .5;

      //Create the icon and socketKey for each available connection
      connectionList = html`${connectionList}
      <mx-icon style="cursor:pointer;opacity:${opacity}" @click=${() => this.socketKey = socketKey} title=${this.socketKey ? `Direct your message to ${socketKey}` : ""} class="fas fa-keyboard" color=${toWireColor}></mx-icon><a style="opacity:${opacity}"  title=${`Direct your message to ${socketKey}`} @click=${() => this.socketKey = socketKey}>${socketKey}</a>
      `
    }

    return html`
        <div class="grid2" style="grid-gap:0px;">

            <div class="gridHeader" style="grid-column: 1/5; padding-left:3px;">
                ${connectionList}
            </div>

            <div class="gridHeader" style="text-align:right;padding-right:3px;">
                <mx-icon @click=${() => this.closeSocket()} style="cursor:pointer;" title="Close the connection to ${this.socketKey}." class="fas fa-times-square"></mx-icon>
            </div>

        </div>
        `
}

  //Show this component on screen
  render() {

    //BEFORE TEMPLATE

    //Run Once

    //Get a reference to the socket for this communicator
    let socket = mx.socket.list[this.socketKey];

    if (!this.hasRun) {

      //Add event listeners for events targeting this component
      this.addEventListener("message-received", this.messageReceived); 

      //Remember we ran once
      this.hasRun = true;

    }

    //HTML TEMPLATE PARTS

    //Input Box
    let inputPart = html`
      <div class="greyBk" style="padding-right:6px;">
        <input ?disabled=${this.isDisabled} style="width:100%" @keydown=${this.mslBoxKeyDown} placeholder="${socket.port.type}"></input>
      </div>
    `

    //RENDER TEMPLATE
  
    return html`
    ${inputPart}
    ${this.templateListHeader()}
    ${this.privateActionList.length > 0 ? html`
    <mx-actions .actionList=${this.privateActionList} .fullActions=${this.actionList} .name=${this.socketKey}></mx-actions>
    <br>
    ${this.nextCommunicator}` : ""}
    ` 
  }
}
