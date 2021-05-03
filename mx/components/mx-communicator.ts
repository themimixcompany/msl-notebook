//Lit Dependencies
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

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
    const eventTarget = event.target as HTMLInputElement
    const latestInput = eventTarget.value;
    this.mslResults = `${this.mslResults}\n ${latestInput}`;
    eventTarget.value = '';
  }


  //Show this component on screen
  render() {
    return html`
    communicator ver ${mslNotebook.version}<br>
    <input @change=${this.mslBoxChanged} placeholder="(msl)"></input>
    <textarea id="mslResultsBox" rows="5" cols="100">${this.mslResults}</textarea>

    <!-- Shoelace Tabs -->
    <sl-tab-group>
    <sl-tab slot="nav" panel="general">General</sl-tab>
   <sl-tab slot="nav" panel="custom">Custom</sl-tab>
   <sl-tab slot="nav" panel="advanced">Advanced</sl-tab>
  <sl-tab slot="nav" panel="disabled" disabled>Disabled</sl-tab>

  <sl-tab-panel name="general">This is the general tab panel.</sl-tab-panel>
  <sl-tab-panel name="custom">This is the custom tab panel.</sl-tab-panel>
  <sl-tab-panel name="advanced">This is the advanced tab panel.</sl-tab-panel>
  <sl-tab-panel name="disabled">This is a disabled tab panel.</sl-tab-panel>
  </sl-tab-group>
    `;

  }

}
