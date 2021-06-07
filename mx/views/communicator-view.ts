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

    <mx-connect></mx-connect>
   
    <!-- <mx-debug></mx-debug> -->
    `
  }
}
