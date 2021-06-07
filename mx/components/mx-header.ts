// <mx-logo>
// by The Mimix Company

//Returns the MSL Notebook logo

//Lit Dependencies
import { mxElement } from 'global/mx-styles';
import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

//Static Assets
import mslNotebookLogo from 'svg/MSL Notebook.svg'

//<mx-logo>
@customElement('mx-header')
export class mxHeader extends mxElement {

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
    <div class="grid" style="grid-template-columns: 1fr 1fr;margin-bottom:15px;">
    <div>
      <a href="https://mimix.io" title="MSL Notebook is a product of The Mimix Company. Enjoy!"><img src="${mslNotebookLogo}" style="height:30px;"></a>
    </div> 
    <div class="right light small bottom">
    v${mslNotebook.version}
    </div>
  </div>
  `;
  }
}
