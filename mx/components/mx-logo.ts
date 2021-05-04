//Lit Dependencies
import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

//Static Assets
import logo from 'svg/MSL Notebook.svg'

//<mx-logo>
//Returns the MSL Notebook logo

@customElement('mx-logo')
export class mxLogo extends LitElement {
 
  //Show this component on screen
  render() {
    return html`
    <i class="fas fa-server"></i>
    <img src=${logo} style="width:500px;margin-bottom:20px;"> 
    <br>
    `;

  }

}
