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
  @property() actionList: {}[] = [];
  @property() messageActionList: {}[] = [];
  @property() connector;
  @property() nextCommunicator;


  //Private Functions

  //Close Connection
  closeConnection() {
    mx.socket.connections[this.socketKey].mxClose(this,this.actionList);
  }

  //Update results area when a message is received
  messageReceived(event: CustomEvent) {
    this.messageActionList = event.detail;
    event.cancelBubble = true;  
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
    mx.socket.list[this.socketKey].mxSend(message, true, this, this.actionList);
    this.nextCommunicator = html`
    <mx-communicator .socketKey=${this.socketKey} .actionList=${this.actionList} .connector=${this}></mx-communicator>
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
        <input style="width:100%" @keydown=${this.mslBoxKeyDown} placeholder="${socket.port.type}"></input>
      </div>
    `
    
    //Make a copy of the singleActionArray for the communicator's action component
    let [...arrayCopy] = this.messageActionList;

    
    //RENDER TEMPLATE
  
    return html`
    ${inputPart}
    <mx-actions .actionList=${arrayCopy} .name=${this.socketKey}></mx-actions>
    <br>
    ${this.nextCommunicator}
    ` 
  }
}
