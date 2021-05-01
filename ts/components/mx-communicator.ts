//Lit Dependencies
import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('mx-communicator')
export class mxCommunicator extends LitElement {
  static styles = css`
    p, textarea { color: #ec2028; font-family: Inter Black; font-size: 24pt }
    input { font-family: Inter; font-size: 24pt }
    `;

  //Define public properties (databinding)

  @property() mslResults = '';


  //Something changed in the MSL input box
  mslBoxChanged(event: Event) {
    const latestInput = (event.target as HTMLInputElement).value;
    this.mslResults = `${this.mslResults}\n ${latestInput}`;
    event.target.value = '';
  }


  //Show this component on screen
  render() {
    return html`
    communicator ver ${mslNotebook.version}<br>
    <input @change=${this.mslBoxChanged} placeholder="(msl)"></input>
    <textarea id="mslResultsBox" rows="20" cols="100">${this.mslResults}</textarea>
    `;

  }

}
