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
    <mx-icon set="fab" name="js" color="orange" width="20" height="20"></mx-icon>
    <mx-greeting></mx-greeting>
    <mx-debug></mx-debug>
    <mx-connect></mx-connect>
    `
  }


}
