//Lit Dependencies
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

//MSL.js Services
import { socket } from 'msl-js/services/socket'



@customElement('mx-communicator')
export class mxCommunicator extends LitElement {
  static styles = css`
    p, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
    input { font-family: Inter; font-size: 24pt }
    `;

  //Define public properties (databinding)

  @property() mslResults = '';

  //Private Functions

  //Update history when messages received
  messageReceived(receivedEvent: Event) {
    console.log("message received by communicator");
    let latestReceived:string = receivedEvent.payload;
    console.log(latestReceived);
    this.mslResults = `${this.mslResults}\n ${latestReceived}`;
  }


  //Something changed in the MSL input box
  mslBoxChanged(event: Event) {
    const eventTarget = event.target as HTMLInputElement
    const latestInput = eventTarget.value;
    socket.list["local-mx-msl"].mxSend(latestInput, this);
    //eventTarget.value = '';
  }


  //Show this component on screen
  render() {

    //Add event listeners for events targeting this component
    this.addEventListener("message-received", this.messageReceived);

    return html`
    communicator ver ${mslNotebook.version}<br>
    <input @change=${this.mslBoxChanged} placeholder="(msl)"></input>
    <textarea id="mslResultsBox" rows="5" cols="100">${this.mslResults}</textarea>
    `;

  }

}
