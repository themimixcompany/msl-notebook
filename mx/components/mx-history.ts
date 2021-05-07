//Lit Dependencies
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

//MSL.js Services
import * as mx from 'msl-js/service-loader'

@customElement('mx-history')
export class mxHistory extends LitElement {
  static styles = css`
    p, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
    input, .results { font-family: Inter; font-size: 18pt; }
    .greyBk {background-color:#ccc}
    .gridHeader {background-color:#bbb}
    a {cursor: pointer; text-decoration:underline}
    `;

  //Define public properties (databinding)
  @property() history: any;
  @property() isHidden: boolean = false;


  //Private Functions

  //Update history when messages received
  messageReceived(receivedEvent: Event) {
    let latestReceived = receivedEvent.payload;
    let logMessage: string;
    const { message, response } = latestReceived; // => const message = latestReceived.message, etc.
    logMessage = `${message} => ${response}`;
    this.history = html`
    ${this.history}
    <div class="results greyBk">
    <a @click=${() => this.sendMessage(message)} title="Resend this message.">
    ${message}
    </a> => 
    <a @click=${() => this.sendMessage(response)} title="Resend this response.">
    ${response}
    </a>
    </div>`;
  }


  //Send Message
  //Call mxSend w/ notifyElement=this to notify this component; echo=true to echo original message (not just response)
  sendMessage(message:string) {
    mx.socket.list[this.socketKey].mxSend(message, this, true);
  }

   //Empty The Results <div>
   emptyResults(receivedEvent: Event) {
    this.history = "";
  }


    //Show or Hide Results
    showOrHideResults() {
      this.isHidden = !this.isHidden
    }
 
  //Show this component on screen
  render() {

    //BEFORE TEMPLATE

    //Add event listeners for both document (communicator sent message) and this component (we re-sent a message)
    document.addEventListener("history-updated", this.messageReceived); 
    this.addEventListener("history-updated", this.messageReceived); 

    //Get a reference to the socket for this communicator
    let socket = mx.socket.list[this.socketKey];


    //HTML TEMPLATE PARTS
    


    //Results Header
    let headerPart = html`
    <div class="gridHeader results" style="font-weight:600">
      history
      <mx-icon @click=${this.emptyResults} style="cursor:pointer;" title="Remove this socket's message results." size=".9" class="fas fa-trash"></mx-icon>
      <mx-icon @click=${this.showOrHideResults} style="cursor:pointer;" color=${this.isHidden ? "white" : "currentColor"} title="${this.isHidden ? "Show" : "Hide"} the message results." size=".9" class="fas fa-eye"></mx-icon>
    </div>
    `

    //Results Div
    let resultsPart = html`
    <div>
      ${this.history}
    </div>
    `

    //RENDER TEMPLATE

    return html`
    ${headerPart}
    ${this.isHidden ? "" : resultsPart}


    
    `;
  }
}
