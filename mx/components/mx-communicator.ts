//Lit Dependencies
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

//MSL.js Services
import * as mx from 'msl-js/service-loader'

@customElement('mx-communicator')
export class mxCommunicator extends LitElement {
  static styles = css`
    p, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
    input, .results { font-family: Inter; font-size: 18pt; }
    .greyBk {background-color:#ccc}
    .gridHeader {background-color:#bbb}
    a {cursor: pointer; text-decoration:underline}
    `;

  //Define public properties (databinding)
  @property() mslResults: any;
  @property({ attribute: 'socket' }) socketKey: string; // => let socketKey = attribute named 'socket'
  @property() isHidden: boolean = false;


  //Private Functions

  //Update history when messages received
  messageReceived(receivedEvent: Event) {
    let latestReceived = receivedEvent.payload;
    let logMessage: string;
    const { message, response, socket } = latestReceived; // => const message = latestReceived.message, etc.
    this.mslResults = html`
    ${this.mslResults}
    <div class="results greyBk">
    <a @click=${() => this.sendMessage(message)} title="Resend this message.">
    ${message} [${socket.key}]
    </a> => 
    <a @click=${() => this.sendMessage(response)} title="Resend this response.">
    ${response}
    </a>
    </div>`;
  }

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
  sendMessage(message:string) {
    mx.socket.list[this.socketKey].mxSend(message, this, true);
  }

   //Empty The Results <div>
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

    //Add event listeners for events targeting this component
    this.addEventListener("message-received", this.messageReceived); //listen for "message-received" and call this.messageReceived w/ the triggering event.

    //Get a reference to the socket for this communicator
    let socket = mx.socket.list[this.socketKey];

    //Initalize this socket w/ a listener (without sending a message)
    mx.socket.init(socket, this);

    //HTML TEMPLATE PARTS
    
    //Input Box
    let inputPart = html`
    <div class="greyBk" style="padding-right:6px;">
      <input style="width:100%" @keydown=${this.mslBoxKeyDown} placeholder="${socket.port.type}"></input>
    </div>`

    //Results Header
    let headerPart = html`
    <div class="gridHeader results" style="font-weight:600">
      ${this.socketKey}
      <mx-icon @click=${this.emptyResults} style="cursor:pointer;" title="Remove this socket's message results." size=".9" class="fas fa-trash"></mx-icon>
      <mx-icon @click=${this.showOrHideResults} style="cursor:pointer;" color=${this.isHidden ? "white" : "currentColor"} title="${this.isHidden ? "Show" : "Hide"} the message results." size=".9" class="fas fa-eye"></mx-icon>
    </div>
    `

    //Results Div
    let resultsPart = html`
    <div>
      ${this.mslResults}
    </div>
    `

    //RENDER TEMPLATE

    return html`
    ${inputPart}
    ${headerPart}
    ${this.isHidden ? "" : resultsPart}


    
    `;
  }
}
