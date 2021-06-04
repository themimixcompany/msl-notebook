// <mx-footer>
// by The Mimix Company

//Returns the Mimix logo and link



//Lit Dependencies
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

//Static Assets
import logo from 'svg/Mimix Trademark.svg'


//<mx-logo>
@customElement('mx-footer')
export class mxFooter extends LitElement {

  //Show this component on screen
  render() {
    return html`
    <a href="https://mimix.io" title="MSL Notebook is a product of The Mimix Company. Enjoy!"><img src="${logo}" style="height:30px;margin-bottom:20px;margin-top:10px;"></a> 
    `;
  }
}
