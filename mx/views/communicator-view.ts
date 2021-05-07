//Lit Dependencies
import {html, css, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

 
@customElement('communicator-view')
export class communicatorView extends LitElement {

  static get styles() {
    return [
    css`
    p, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
    input {font-family: Inter, font-size: 24pt}

    `];}

  //Show this view on screen
  render() {

    return html`

    <mx-greeting></mx-greeting>
    <mx-debug></mx-debug>
    <mx-history></mx-history>
    <mx-connect></mx-connect>
    <mx-icon class="fab fa-js" size="2" color="orange"></mx-icon>
    `
  }


}
