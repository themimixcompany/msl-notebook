//Lit Dependencies
import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';


//<mx-greeting>
//Says hello to the name in the input box when changed.
@customElement('mx-greeting')
export class mxGreeting extends LitElement {
  static styles = css`
    h1, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
    input { font-family: Inter; font-size: 24pt }
    p { font-family: Inter; font-size: 18pt }
    `;

  //Define public properties (databinding)
  @property() name = 'World';


  //The Enter key has been pressed
  nameKeyDown(event: Event) {
    if (event.keyCode == 13) {
      this.name = (event.target as HTMLInputElement).value;
      let myEvent = new CustomEvent('name-changed', {
        detail: {
          message: this.name
        }
      });
    }
  }

  //Show this component on screen
  render() {
    return html`
    <i class="fas fa-flag" style="width:20px"></i>
    <input @keydown=${this.nameKeyDown} placeholder="Your Name Here"><br>
      <h1>Hello, ${this.name} ${mslNotebook.version}!</h1>
    `;
  }
}
