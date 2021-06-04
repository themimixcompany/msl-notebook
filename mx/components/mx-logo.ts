// <mx-logo>
// by The Mimix Company

//Returns the MSL Notebook logo

//Lit Dependencies
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

//Static Assets
import logo from 'svg/MSL Notebook.svg'

//<mx-logo>
@customElement('mx-logo')
export class mxLogo extends LitElement {

  //Show this component on screen
  render() {
    return html`
    <img src=${logo} style="width:500px;margin-bottom:20px;">
    <span style="font-family:Inter;font-weight:300;font-size:14pt;">
      ${mslNotebook.version}
    </span>
    `;
  }
}
