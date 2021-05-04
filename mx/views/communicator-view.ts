//Lit Dependencies
import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

//MSL.js Services

@customElement('communicator-view')
export class communicatorView extends LitElement {

  static styles = css`
    p, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
    input { font-family: Inter; font-size: 24pt }
    `;

  //Define public properties (databinding)
  @property() userName:string;
  @property() activeSockets:Object; 


  handleEvent(e: Event) {
    this.userName = e.detail.message;
  }



  //Show this view on screen
  render() {
    return html`
    <mx-greeting @name-changed=${this.handleEvent}></mx-greeting>
    <mx-debug></mx-debug>
    <mx-connect></mx-connect>
    `
  }


}
