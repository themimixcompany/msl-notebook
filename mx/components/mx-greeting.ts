// <mx-greeting>
// by The Mimix Company

//A demo component to ensure Lit is setup and running.
//Displays global version number.
//Says hello to the name in the input box when changed.

//Lit Dependencies
import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

//<mx-greeting>
@customElement('mx-greeting')
export class mxGreeting extends LitElement {
  static styles = css`
    h1, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
    input { font-family: Inter; font-size: 24pt }
    p { font-family: Inter; font-size: 18pt }
    `;

  //Define public properties (databinding)
  @property() name = 'World';

  //Key pressed in input box? Check for Enter.
  nameKeyDown(event: Event) {
    if (event.keyCode == 13) {
      this.name = (event.target as HTMLInputElement).value;
    }
  }

  //Show this component on screen
  render() {
    return html`
    <h1>Hello, ${this.name} ${mslNotebook.version}! <input @keydown=${this.nameKeyDown} placeholder="Your Name Here"></h1>
    `;
  }
}
