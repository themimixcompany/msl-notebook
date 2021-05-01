//Lit Dependencies
import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

//MSL.js Services
import {machine} from '/ts/services/machine.ts'

let myMachineList = machine.list("msl");
console.log(myMachineList);


@customElement('communicator-view')
export class communicatorView extends LitElement {

  static styles = css`
    p, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
    input { font-family: Inter; font-size: 24pt }
    `;

  //Define public properties (databinding)
  @property() userName:string;


  handleEvent(e) {
    this.userName = e.detail.message;
  }

  //Show this view on screen
  render() {
    return html`
    view ver ${mslNotebook.version}<br>
    user ${this.userName}<br>
    <mx-greeting @my-event=${this.handleEvent} id="mxGreeting"></mx-greeting>
    <mx-communicator id="mxCommunicator"></mx-communicator>
    `
  }


}
