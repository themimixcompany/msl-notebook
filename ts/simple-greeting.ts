import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';


@customElement('hello-mimix')
export class SimpleGreeting extends LitElement {
  static styles = css`p { color: #ec2028; font-family: Inter Black; font-size: 24pt }`;

  @property() name = 'Somebody';

  render() {
    return html`<p>Hello, ${this.name}!</p>`;

  }
}
