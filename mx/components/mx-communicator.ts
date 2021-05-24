// <mx-communicator>
// by The Mimix Company

//Provides two-way communication between the browser and a single websocket using MSL.js. Also collects all other messages triggered by the sent message, such as admin replies and relays.

//Lit Dependencies
import { html, css, LitElement, CSSResult } from 'lit';
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
    .gridHeader {background-color:#bbb}
    a {cursor: pointer; text-decoration:underline}
    .grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      grid-auto-rows: minmax(100px, auto);
    }
    `;

  //Setup for Run Once
  hasRun = false;

  //Define public properties (databinding)
  @property() mslResults: any;
  @property({ attribute: false }) socketKey: string; // => let socketKey = attribute named 'socket'
  @property() isHidden: boolean = false;
  @property() history: {}[];
  @property() connector;

  //Private properties
  lastMessage = {
    sentMessage: "",
    sentSocketKey: "",
    receivedMessage: "",
    receivedSocketKey: ""
  };

  //Private Functions

  //Update communicator when messages received
  messageReceived(event: Event) {

    //Extract sent and received message info
    const { sentMessage, sentSocketKey, receivedMessage, receivedSocketKey } = event.payload;

    //Extract last message info for comparison
    let lastSentMessage = this.lastMessage.sentMessage;
    let lastSentSocketKey = this.lastMessage.sentSocketKey;


    //Detect additional responses from same sent message
    let isAdditionalResponse = sentMessage == lastSentMessage && sentSocketKey == lastSentSocketKey;

    //Setup Colors
    let sentWireColor = mx.socket.list[sentSocketKey].port.type == 'msl' ? mx.socket.list[sentSocketKey].machine.ip == 'localhost' ? '#ec2028' : 'navy' : mx.socket.list[sentSocketKey].port.type == 'admin' ? mx.socket.list[sentSocketKey].machine.ip == 'localhost' ? 'darkOrange' : 'purple' : ''
    let ReceivedWireColor = mx.socket.list[receivedSocketKey].port.type == 'msl' ? mx.socket.list[sentSocketKey].machine.ip == 'localhost' ? '#ec2028' : 'navy' : mx.socket.list[receivedSocketKey].port.type == 'admin' ? mx.socket.list[sentSocketKey].machine.ip == 'localhost' ? 'darkOrange' : 'purple' : ''

    //Setup Icons
    let sentMessageIcon = sentSocketKey == this.socketKey ? 'fas fa-keyboard' : 'fas fa-project-diagram';

    //Build single result template
    let singleResult = html`
    <div class="grid results greyBk">
    <div>
      ${sentMessage && !isAdditionalResponse ? html`<mx-icon style="cursor:pointer;" @click=${() => this.sendMessage(sentMessage)} title="Send this message to ${this.socketKey}." class=${sentMessageIcon} color="${sentWireColor}"></mx-icon> ${sentMessage}` : ""}
    </div>
    <div>
    ${sentMessage && !isAdditionalResponse ? html`<mx-icon class="fas fa-router" color="${sentWireColor}"></mx-icon> ${sentSocketKey}` : ""}
    </div>
    <div>
    ${sentMessage && !isAdditionalResponse ? html`==>` : ""}
    </div>
    <div>
      <mx-icon class="fas fa-router" color="${ReceivedWireColor}"></mx-icon> ${receivedSocketKey}
    </div>
    <div>
      <mx-icon style="cursor:pointer;" @click=${() => this.sendMessage(receivedMessage)} title="Send this message to ${this.socketKey}." class="fas fa-comment" color="${ReceivedWireColor}"></mx-icon>  ${receivedMessage}
    </div>
    </div>
`;

    //Remember Last Message
    this.lastMessage = event.payload;

    //Add new result to results property
    this.mslResults = html`
    ${this.mslResults}
    ${singleResult}
    `;
  }

  //Check for message input box Enter key pressed to send message
  mslBoxKeyDown(event: Event) {
    const eventTarget = event.target as HTMLInputElement
    const message = eventTarget.value;
    if (event.keyCode == 13) {
      //Send message
      this.sendMessage(message);
      //eventTarget.value = '';
    }
  }

  //Send Message
  //Call mxSend w/ notifyElement=this to notify this component; echo=true to echo original message (not just response)
  sendMessage(message: string) {
    mx.socket.list[this.socketKey].mxSend(message, this, true, this.history);
  }

  //Empty The Results Area
  emptyResults(receivedEvent: Event) {
    this.mslResults = "";
  }

  //Show or Hide Results
  showOrHideResults() {
    this.isHidden = !this.isHidden
  }

  //Show this component on screen
  render() {

    //BEFORE TEMPLATE

    //Run Once

    //Get a reference to the socket for this communicator
    let socket = mx.socket.list[this.socketKey];

    if (!this.hasRun) {

      //Add event listeners for events targeting this component
      this.addEventListener("message-received", this.messageReceived); //listen for "message-received" and call this.messageReceived w/ the triggering event.

      // //Be notified of history changes for this socket
      // mx.socket.takeHistory(this.socketKey, this)

      //Setup an empty callback for initial connect messages
      mx.socket.takeCallbacks(this.socketKey, this, this.history);

      //Remember we ran once
      this.hasRun = true;

    }

    //HTML TEMPLATE PARTS

    //Input Box
    let inputPart = html`
      <div class="greyBk" style="padding-right:6px;">
        <input style="width:100%" @keydown=${this.mslBoxKeyDown} placeholder="${socket.port.type}"></input>
      </div>
    `

    //Results Header
    let headerPart = html`
      <div class="gridHeader results" style="font-weight:600">
        ${this.socketKey}
        <mx-icon @click=${this.emptyResults} style="cursor:pointer;" title="Remove this socket's message results." size=".9" class="fas fa-trash"></mx-icon>
        <mx-icon @click=${this.showOrHideResults} style="cursor:pointer;" color=${this.isHidden ? "white" : "currentColor"} title="${this.isHidden ? "Show" : "Hide"} the message results." size=".9" class="fas fa-eye"></mx-icon>
      </div>
    `;

    //Results Div
    let resultsPart = html`
      <div class="grid results greyBk" style="color:white;font-weight:500;">
        <div>
        sent message
        </div>
        <div>
        to socket
        </div>
        <div>
      
        </div>
        <div>
        from socket
        </div>
        <div>
        received message
        </div>
      </div>
      ${this.mslResults}
    `;

    //RENDER TEMPLATE
    
    return html`
      ${inputPart}
      ${headerPart}
      ${this.isHidden ? "" : resultsPart}
    `;
  }
}
