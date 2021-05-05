//Lit Dependencies
import { mxCommunicator } from 'components/mx-communicator';
import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';


//MSL.js Services
import * as mx from 'msl-js/service-loader'
  
@customElement('communicator-view')
export class communicatorView extends LitElement {

  static get styles() {
    return [
    css`
    p, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
    input {font-family: Inter, font-size: 24pt}
    `];}

  //Define public properties (databinding)



  //Show this view on screen
  render() {

    return html`
  
    <mx-greeting></mx-greeting>
    <mx-debug></mx-debug>
    <mx-connect></mx-connect>
    <mx-icon class="fas fa-server"></mx-icon>
    <mx-icon class="far fa-server" size="2" color="orange"></mx-icon>
    <mx-icon class="fas fa-server" size="3" color="red"></mx-icon>
    <mx-icon class="fas fa-server" size="4" color="purple"></mx-icon>
    <mx-icon class="fas fa-server" size="5" color="blue"></mx-icon>
    `
  }


}
