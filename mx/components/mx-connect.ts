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
    textarea { color: #ec2028; font-family: Inter Black; font-size: 18pt }
    ol,ul, input, h2, p, .machine { font-family: Inter; font-size: 18pt }
    .greyBk {background-color:#ccc}
    .gridHeader {background-color:#bbb}
    a { text-decoration: underline;}
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      grid-auto-rows: minmax(100px, auto);
    }
    .one {
      grid-column: 1;
      grid-row: 1;
    }
    .gridHeader, .threeColumns {
      grid-column: 1 / 4;
    }
    
    
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

  machineGrid() {
    return html`
    ${mx.machine.keys.map((machineKey) => html`
      <div class="machine greyBk">${machineKey}
      <p>
      ${mx.machine.list[machineKey].ports.map((portKey: string) => html`
      <a @click=${() => this.addConnection(machineKey, portKey)}>${portKey}</a>
      `)}
      &nbsp;
      </p>
    </div>
    `)}
    `
  }

  communicators() {
    return html`

    ${this.connections.map((socketKey) => html`
      <div class="threeColumns">
        <mx-communicator socket=${socketKey}></mx-communicator>
      </div>
    `)}
    `
  }




  //Show this component on screen
  render() {

    //Add event listeners for events targeting this component
    this.addEventListener("status-changed", this.statusChanged);

    return html`

    <p>Click a port to connect. Then send a message.</p>

    <div class="grid">
      ${this.machineGrid()}
      ${this.communicators()}
    </div>
    
    <br>
  `;

  }

}
