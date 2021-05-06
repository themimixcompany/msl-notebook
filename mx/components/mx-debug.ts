//Lit Dependencies
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

//MSL.js Services

//Setup for closure over this component. Used in callback from document element.
let thisComponent:mxDebug;

@customElement('mx-debug')
export class mxDebug extends LitElement {
  static styles = css`
    p, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
    input, .results { font-family: Inter; font-size: 18pt; }
    .greyBk {background-color:#ccc}
    .gridHeader {background-color:#bbb}
    `;

  //Define public properties (databinding)
  @property() debugResults: any;

  //Private Functions

  //Update history when messages received
  messageReceived(receivedEvent: Event) {
    let message:string[] = receivedEvent.payload;
    let logMessage = message.map((messageArgument) => `${messageArgument} `);
    thisComponent.debugResults = html`${thisComponent.debugResults}<div class="results greyBk">${logMessage}</div>`;
  }

  //Empty Results
  emptyResults(receivedEvent: Event) {
    this.debugResults = "";
  }

  //Show this component on screen
  render() {

    //Assign closure value during the instance's constructor
    thisComponent = this;

    //Add event listener for document element
    document.addEventListener("debug", this.messageReceived); //listen for "debug" and call this.messageReceived w/ the triggering event.


    return html`
    <div class="gridHeader results" style="font-weight:600">
      debugging <mx-icon @click=${this.emptyResults} style="cursor:pointer;" title="Remove the debugging results." size=".9" class="fas fa-trash"></mx-icon>
    </div>

    <div class="greyBk results">${this.debugResults}</div>
    <br>
    `;

  }

}
