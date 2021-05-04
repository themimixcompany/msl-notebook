//Lit Dependencies
import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';


//MSL.js Services

  
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

// Add all icons to the library so you can use it in your page
library.add(fas, far, fab)


@customElement('communicator-view')
export class communicatorView extends LitElement {

  static get styles() {
    return [
    css`
    p, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
    input { font-family: Inter, font-size: 24pt}
    `];}

  //Define public properties (databinding)



  //Show this view on screen
  render() {


// @ts-ignore <-- if you use typescript
dom.watch({
  autoReplaceSvgRoot: this.shadowRoot,
  observeMutationsRoot: this.shadowRoot
})
  

    return html`
    <i class="fas fa-laptop" style="width:20px"></i>
    <mx-greeting></mx-greeting>
    <mx-debug></mx-debug>
    <mx-connect></mx-connect>
    `
  }


}
