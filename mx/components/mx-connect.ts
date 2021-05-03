//Lit Dependencies
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

//MSL.js Services
import * as mx from 'msl-js/service-loader'


//<mx-connect>
//Opens connections to WebSockets
@customElement('mx-connect')
export class mxConnect extends LitElement {
  static styles = css`
    p, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
    ol, input { font-family: Inter; font-size: 24pt }
    a { text-decoration: underline;}
    `;

  //Define public properties (databinding)
  @property() connections: string[] = [];


  //Connect link clicked
  addConnection(machineKey: string, portKey: string) {
    console.log(Object.keys(mx.socket.list));
    console.log(mx.socket.keys); //? no output
    mx.socket.connect(machineKey, portKey, this);
    ;
  }

  //Update connections when changed by socket service
  statusChanged(receivedEvent: Event) {
    console.log("status changed");
    console.log(receivedEvent.payload);
    this.connections = Object.keys(receivedEvent.payload);
  }




  //Create HTML Templates

  machineList() {
    return html`
    machines<br>
    <ul>
      ${mx.machine.keys.map((machineKey) => html`<li>${machineKey}:
      ${mx.machine.list[machineKey].ports.map((portKey: string) => html` <a @click=${() => this.addConnection(machineKey, portKey)}>${portKey}</a>`)}
      </li>`)}
    </ul>
    <br>
    `
  }

  connectionList() {
    return html`
    connections<br>
    <ol>
    ${this.connections.map((socketKey) => html`<li>${socketKey}</li>`)}
    </ol>
    <br>
    `
  }


  //Show this component on screen
  render() {

    //Add event listeners for events targeting this component
    this.addEventListener("status-changed", this.statusChanged);

    return html`
    ${this.machineList()}
    ${this.connectionList()}
    <br>
  `;

  }

}
