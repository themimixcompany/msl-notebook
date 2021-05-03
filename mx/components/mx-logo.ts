//Lit Dependencies
import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import logo from 'svg/MSL Notebook.svg'

@customElement('mx-logo')
export class mxLogo extends LitElement {
  static styles = css`
    p, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
    input { font-family: Inter; font-size: 24pt }
    `;

  //Show this component on screen
  render() {
    return html`
    <img src=${logo} style="width:500px;margin-bottom:20px;"> 
    <br>
    `;

  }

}
