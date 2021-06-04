// <communicator-view>
// by The Mimix Company

//A group of components in MVC style.
//Creates a greeting area, debugging area, and web socket connector.

//Lit Dependencies
import { html, css, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

//Static Assets
import logo from 'svg/Mimix Trademark.svg'

// <communicator-view>
@customElement('communicator-view')
export class communicatorView extends LitElement {

  static get styles() {
    return [
      css`
    p, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
    input {font-family: Inter, font-size: 24pt}
    `];
  }

  //Show this view on screen
  render() {

    return html`
    <mx-greeting></mx-greeting>
    <mx-connect></mx-connect>

    <!-- <mx-debug></mx-debug> -->

    <a href="https://mimix.io" title="MSL Notebook is a product of The Mimix Company. Enjoy!"><img src="${logo}" style="height:30px;margin-bottom:20px;margin-top:10px;"></a> 
    `
  }
}
