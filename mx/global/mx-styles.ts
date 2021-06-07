// mx-styles
// by The Mimix Company

//Exports shared CSS for use by web components

import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('mx-element')
export class mxElement extends LitElement {
  static styles = css`

    /* Elements */

    /* Text */
    ol, ul, input, div { font-family: Inter; font-size: 18pt }

    /* Links */
    a {text-decoration: none; cursor: pointer;}
    a:hover {text-decoration: underline}

    /* Text Classes */
    .elide {text-overflow: ellipsis; overflow: hidden; white-space: nowrap;}
    .whiteHeaderText {color:white;font-weight:500;}
    .light {font-weight:200;}
    .right {text-align:right;}
    .small {font-size:12pt;}
    .bottom {vertical-align:bottom;}

    /* Background Colors */
    .veryDarkGreyBk {background-color:#606060;}
    .darkGreyBk {background-color:#aaa;}
    .gridHeader {background-color:#bbb;}
    .greyBk {background-color:#ccc;}
    .activeBk {background-color:#aaa;}

    img {color:currentColor}
  
    /* Grids */
    .grid {
      display: grid;
      grid-template-columns: 100px 175px 1fr 250px 250px 110px;
      gap: 3px;
    }
    .fixed-rows {
      grid-auto-rows: 30pt;
    
    }

    /* Grid-Classed Elements */
    .grid div {padding:5px;}
    .grid div.grid {padding:0px;}
    `;

  protected render() {
    return html`
    `;
  }
}
