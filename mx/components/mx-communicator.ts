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
  @property() mslResults;
  @property({ attribute: 'socket' }) socketKey: string;

  //Private Functions

  //Update history when messages received
  messageReceived(receivedEvent: Event) {
    console.log("message received by communicator");
    let latestReceived = receivedEvent.payload;
    console.log(latestReceived);
    let logMessage:string;
    const {message,response} = latestReceived;
    logMessage = `${message} => ${response}`;
    this.mslResults = html`${this.mslResults}<div class="results greyBk">${logMessage}</div>`;
  }


  //Something changed in the MSL input box
  mslBoxChanged(event: Event) {
    const eventTarget = event.target as HTMLInputElement
    const latestInput = eventTarget.value;
    //use mxSend w/ true parm to get message and response in JSON
    mx.socket.list[this.socketKey].mxSend(latestInput, this, true);
    //eventTarget.value = '';
  }



  //Show this component on screen
  render() {

    //Add event listeners for events targeting this component
    this.addEventListener("message-received", this.messageReceived);

    let socket = mx.socket.list[this.socketKey];
    console.log(socket);

    return html`
    <div class="gridHeader results">
      ${this.socketKey}
    </div>
    <div class="greyBk" style="padding-right:6px;">
      <input style="width:100%" @change=${this.mslBoxChanged} placeholder="${socket.port.type}"></input>
    </div>
    
    <div>${this.mslResults}</div>
    `;

  }

}
