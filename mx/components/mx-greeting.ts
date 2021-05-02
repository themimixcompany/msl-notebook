//Lit Dependencies
import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('mx-greeting')
export class mxGreeting extends LitElement {
  static styles = css`
    h1, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
    input { font-family: Inter; font-size: 24pt }
    p { font-family: Inter; font-size: 18pt }
    `;

  //Define public properties (databinding)
  @property() name = 'World';


  //Something changed in the Name input box
  nameBoxChanged(event: Event) {
    this.name = (event.target as HTMLInputElement).value;
    let myEvent = new CustomEvent('name-changed', {
      detail: {
        message: this.name
      }
    });
    this.dispatchEvent(myEvent);
  }


  //Show this component on screen
  render() {
    return html`
    greeting ver ${mslNotebook.version}<br>
    <input @change=${this.nameBoxChanged} placeholder="Your Name Here"><br>
      <h1>Hello, ${this.name}!</h1>
      <p>Click wss-text to test WS connection.</p>
    `;

  }

}
