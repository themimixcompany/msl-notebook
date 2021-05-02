//Lit Dependencies
import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

//MSL.js Services
import * as mx from '/ts/services/machine.ts'
//import * as mx from '/ts/services/socket.ts'

@customElement('mx-connect')
export class mxConnect extends LitElement {
  static styles = css`
    p, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
    input { font-family: Inter; font-size: 24pt }
    `;

  //Define public properties (databinding)
  @property() name = 'World';


  //Something changed in the Name input box
  nameBoxChanged(event: Event) {
    this.name = (event.target as HTMLInputElement).value;
    let myEvent = new CustomEvent('my-event', {
      detail: {
        message: this.name
      }
    });
    this.dispatchEvent(myEvent);
  }


  //Show this component on screen
  render() {
    return html`
    connect<br>
    <ol>
      ${mx.machine.keys.map((machineKey) => html`<li>${machineKey}</li>`)}
    </ol>
    `;

  }

}
