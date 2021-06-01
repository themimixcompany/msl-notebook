//Lit Dependencies
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';


//Setup for closure over this component. Used in callback from document element.
let thisComponent: mxDebug;

@customElement('mx-debug')
export class mxDebug extends LitElement {
  static styles = css`
    p, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
    input, .results { font-family: Inter; font-size: 18pt; }
    .greyBk {background-color:#ccc}
    .gridHeader {background-color:#bbb; font-family: Inter; font-size: 20pt }
    .blue {
      color: navy;
  }
    `;

  //Define public properties (databinding)
  @property() debugResults: any;
  @property() isHidden: boolean = true;

  //Private Functions

  //Update history when messages received
  messageReceived(receivedEvent: Event) {
    let message: string[] = receivedEvent.payload;
    let logMessage = message.map((messageArgument) => `${messageArgument} `);
    thisComponent.debugResults = html`${thisComponent.debugResults}<div class="results greyBk">${logMessage}</div>`;
  }

  //Empty Results
  emptyResults(receivedEvent: Event) {
    this.debugResults = "";
  }

  //Show or Hide Results
  showOrHideResults() {
    this.isHidden = !this.isHidden
  }

  //Show this component on screen
  render() {

    //BEFORE RENDER

    //Assign closure value during the instance's constructor
    thisComponent = this; //inside a Lit component, this means "this component"

    //Add event listener for document element
    //not all services are passed a notifyElement, so debug uses document
    document.addEventListener("debug", this.messageReceived); //listen for "debug" and call this.messageReceived w/ the triggering event.

    //TEMPLATE PARTS

    //Debugging Header
    let headerPart = html`
    <div class="gridHeader">
      <mx-icon class="fas fa-bug"></mx-icon> debugging

      <mx-icon @click=${this.showOrHideResults} style="cursor:pointer;" color=${this.isHidden ? "white" : "currentColor"} title="${this.isHidden ? "Show" : "Hide"} the debugging information." size=".9" class="fas fa-eye"></mx-icon>

      <mx-icon @click=${this.emptyResults} style="cursor:pointer;" title="Erase the debugging information." size=".9" class="fas fa-trash"></mx-icon>

    </div>
  `

    //Debug Results
    let resultsPart = html`
    <div class="greyBk results">${this.debugResults}</div>
      <br>
    `

    //RENDER FINISHED TEMPLATE

    return html`
    ${headerPart}
    ${this.isHidden ? "" : resultsPart}
    `;

  }

}
