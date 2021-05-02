//Lit Dependencies
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

//MSL.js Services
import * as mx from 'global/service-loader'
import { machine } from 'global/service-loader';

@customElement('mx-connect')
export class mxConnect extends LitElement {
  static styles = css`
    p, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
    ol, input { font-family: Inter; font-size: 24pt }
    a { text-decoration: underline;}
    `;

  //Define public properties (databinding)
  @property() connections: {};


  //Someone clicked a connect link
  addConnection(machineKey: string, portKey: string) {
    console.log(Object.keys(mx.socket.list));
    console.log(mx.socket.keys);
    mx.socket.connect(machineKey, portKey, this);
    ;
  }

  //Update connections when changed
  statusChanged(e: Event) {
    console.log("event received");
    let message = e.detail.message;
    this.connections = message;
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
    const itemTemplates = [];
    for (let oneConnection in this.connections) {
      itemTemplates.push(html`<li>${oneConnection}</li>`);
    }
    return html`
    connections<br>
    <ol>
    ${itemTemplates}
  </ol>
    `
  }

  //Show this component on screen
  render() {

    //listen for connection status changed
    this.addEventListener("status-changed", this.statusChanged);

    return html`
    ${this.machineList()}
    ${this.connectionList()}
    <br>
  `;

  }

}
