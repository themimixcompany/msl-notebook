//Lit Dependencies
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

//MSL.js Services
import * as mx from 'msl-js/services/socket'



@customElement('mx-communicator')
export class mxCommunicator extends LitElement {
  static styles = css`
    p, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
    input { font-family: Inter; font-size: 24pt }
    `;

  //Define public properties (databinding)
  @property() mslResults = '';
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
    this.mslResults = `${this.mslResults}\n ${logMessage}`;
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
    communicator ver ${mslNotebook.version}<br>
    <input @change=${this.mslBoxChanged} placeholder="${socket.port.type}"></input><br>
    <textarea id="mslResultsBox" rows="5" cols="50">${this.mslResults}</textarea>
    `;

  }

}
