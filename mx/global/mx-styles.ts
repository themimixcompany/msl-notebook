// mx-styles
// by The Mimix Company

//Exports shared CSS for use by web components

import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('mx-element')
export class mxElement extends LitElement {
  static styles = css`

    ol, ul, input, div { font-family: Inter; font-size: 18pt }
    a {text-decoration: none; cursor: pointer;}
    a:hover {text-decoration: underline}

    .elide {text-overflow: ellipsis; overflow: hidden; white-space: nowrap}
    .greyBk {background-color:#ccc; padding:5px;}
    .darkGreyBk {background-color:#aaa; padding:5px;}
    .veryDarkGreyBk {background-color:#606060; padding:5px;}
    .activeBk {background-color:navy; padding:5px;}
    .gridHeader {background-color:#bbb; font-family: Inter; font-size: 20pt }
    .whiteHeaderText {color:white;font-weight:500;}

    .grid-fixed-rows {
      display: grid;
      grid-template-columns: 100px 175px 1fr 250px 250px 110px;
      grid-auto-rows: 30pt;
      gap: 3px;
    }
    .grid2 {
        display: grid;
        grid-template-columns: 100px 175px 1fr 250px 250px 110px;
        gap: 3px;
      }
    `;

  protected render() {
    return html`
    `;
  }
}
