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
    p {margin-top: 5px; margin-bottom: 5px;}
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
    mx.socket.connect(machineKey, portKey, this);
    ;
  }

  //Update connections when changed by socket service
  statusChanged(receivedEvent: Event) {
    mx.debug.log("active connections updated");
    this.connections = Object.keys(receivedEvent.payload);
  }




  //Create HTML Templates

  machineGrid() {
    return html`
    ${mx.machine.keys.map(machineKey => {
    

      return html`
      <div class="machine greyBk">
      <mx-icon class="fas fa-server" color=${mx.machine.hasType(machineKey,"msl") ? 'red' : ''}></mx-icon>
      <span style="font-weight:600">${machineKey}</span>
      <i class="fas fa-flag" style="font-size:24pt"></i>
  
      ${mx.machine.list[machineKey].ports.map((portKey: string) => html`
      <p>
      <a @click=${() => this.addConnection(machineKey, portKey)}>
      <mx-icon class="fas fa-router" color=${mx.machine.ports[portKey].type == 'msl' ? 'red' : ''}></mx-icon>
      ${portKey}
      </p>
      `)}
  
    </div>
    `})}
    `
  }

  communicators() {
    return html`
    <i class="fas fa-server"></i>

    ${this.connections.map(socketKey => html`
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
