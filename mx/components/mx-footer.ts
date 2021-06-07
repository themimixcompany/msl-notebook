// <mx-footer>
// by The Mimix Company

//Returns the Mimix logo and link



//Lit Dependencies
import { mxElement } from 'global/mx-styles';
import { html, LitElement, css } from 'lit';
import { customElement } from 'lit/decorators.js';

//Static Assets
import mimixLogo from 'svg/Mimix Trademark.svg'
import mslJSLogo from 'svg/MSLjs.svg'


//<mx-logo>
@customElement('mx-footer')
export class mxFooter extends mxElement {

  //CSS PROPERTIES //////////

  //Use shared styles
  static get styles() {
    return [
      super.styles,
      css``
    ];
  }

  //Show this component on screen
  render() {
    return html`
    <div class="grid" style="grid-template-columns: 1fr 1fr">
      <div>
        <a href="https://mimix.io" title="MSL Notebook is a product of The Mimix Company. Enjoy!"><img src="${mimixLogo}" style="height:25px"></a>
      </div> 
      <div class="right light small">
      <a href="https://nebula.mimix.io" title="Powered by MSL.js"><img src="${mslJSLogo}" style="height:23px;margin-top:1px;"></a>
      </div>
    </div>
    `;
  }
}
