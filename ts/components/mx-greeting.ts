//Lit Dependencies
import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('hello-mimix')
export class mxComponent extends LitElement {
  static styles = css`
    p, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
    input { font-family: Inter; font-size: 24pt }
    `;

  //Define public properties (databinding)
  @property() name = 'World';


  //Something changed in the Name input box
  nameBoxChanged(event: Event) {
    this.name = (event.target as HTMLInputElement).value;
  }



  //Show this component on screen
  render() {
    return html`
    ver ${mslNotebook.version}<br>
    <input @change=${this.nameBoxChanged} placeholder="Your Name Here"><br>
      <p>Hello, ${this.name}!</p>
    `;

  }

}
