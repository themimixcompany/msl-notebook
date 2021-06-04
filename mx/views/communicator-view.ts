// <communicator-view>
// by The Mimix Company

//A group of components in MVC style.
//Creates a greeting area, debugging area, and web socket connector.

//Lit Dependencies
import { html, css, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

// <communicator-view>
@customElement('communicator-view')
export class communicatorView extends LitElement {

  static get styles() {
    return [
      css`
      ol,ul, input, h2, p, .machine, div { font-family: Inter; font-size: 18pt }
      p, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
      input {font-family: Inter, font-size: 24pt}
      `];
  }

  //Show this view on screen
  render() {

    return html`

    <ol>
      <li>Click a <mx-icon class="fas fa-server"></mx-icon> server, <mx-icon class="fas fa-router"></mx-icon> port, or <mx-icon class="fas fa-network-wired"></mx-icon> group to connect.</li>
      <li>When connected, use the <mx-icon class="fas fa-keyboard"></mx-icon> communicator to send messages.
      <li>Click a sent message or reply icon to resend it.</li>
    </ol>

    <mx-connect></mx-connect>
    <!-- <mx-debug></mx-debug> -->
    `
  }
}
