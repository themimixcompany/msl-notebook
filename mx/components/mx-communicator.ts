//Lit Dependencies
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

//MSL.js Services
import * as mx from 'msl-js/services/socket'

@customElement('mx-communicator')
export class mxCommunicator extends LitElement {
  static styles = css`
    p, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
    input, .results { font-family: Inter; font-size: 18pt; }
    .greyBk {background-color:#ccc}
    .gridHeader {background-color:#bbb}
    `;

  //Define public properties (databinding)
  @property() mslResults: any;
  @property({ attribute: 'socket' }) socketKey: string; // => let socketKey = attribute named 'socket'

  //Private Functions

  //Update history when messages received
  messageReceived(receivedEvent: Event) {
    let latestReceived = receivedEvent.payload;
    let logMessage: string;
    const { message, response } = latestReceived; // => const message = latestReceived.message, etc.
    logMessage = `${message} => ${response}`;
    this.mslResults = html`${this.mslResults}<div class="results greyBk">${logMessage}</div>`;
  }


  //Something changed in the MSL input box
  mslBoxChanged(event: Event) {
    const eventTarget = event.target as HTMLInputElement
    const message = eventTarget.value;
    //use mxSend w/ true parm to get message and response in JSON
    mx.socket.list[this.socketKey].mxSend(message, this, true);
    //eventTarget.value = '';
  }



  //Show this component on screen
  render() {

    //Add event listeners for events targeting this component
    this.addEventListener("message-received", this.messageReceived); //listen for "message-received" and call this.messageReceived w/ the triggering event.

    let socket = mx.socket.list[this.socketKey];

    return html`
    <div class="gridHeader results" style="font-weight:600">
      ${this.socketKey}
    </div>
    <div class="greyBk" style="padding-right:6px;">
      <input style="width:100%" @change=${this.mslBoxChanged} placeholder="${socket.port.type}"></input>
    </div>
    
    <div>${this.mslResults}</div>
    `;

  }

}
