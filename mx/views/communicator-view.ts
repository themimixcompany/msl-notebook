//Lit Dependencies
import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

//MSL.js Services
import * as mx from 'msl-js/service-loader'

// console.log("find msl");
// console.log(mx.machine.find("msl"));
//

console.log("all machines");
console.log(mx.machine.list);

// console.log("copy to local and change");
// let myMachineCopy = mx.machine.list();
// myMachineCopy.test1 = ["hey"];
// console.log(myMachineCopy);
//
// let mySecondCopy = mx.machine.list();
// console.log("change remote and refetch");
// mx.machine.set("test1","name","Howdy!")
// console.log(mySecondCopy);


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
    <mx-connect></mx-connect>
    `
  }


}
