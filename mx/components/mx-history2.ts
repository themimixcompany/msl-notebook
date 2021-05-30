// <mx-history>
// by The Mimix Company

//Displays the history of websocket communications, as returned from the MSL.js socket service.

//Lit Dependencies
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

//MSL.js Services
import * as mx from 'msl-js/service-loader'

//<mx-history>
//Displays history information collected from the socket service
@customElement('mx-history2')
export class mxHistory2 extends LitElement {
    static styles = css`
    textarea { color: #ec2028; font-family: Inter Black; font-size: 18pt }
    ol,ul, input, h2, p, .machine, .results { font-family: Inter; font-size: 18pt }
    p {margin-top: 5px; margin-bottom: 5px;}
    .greyBk {background-color:#ccc}
    .gridHeader {background-color:#bbb}
    a { text-decoration: underline; cursor: pointer; text-decoration:underline}
    .whiteHeaderText {color:white;font-weight:500;}
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .grid2 {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
    }
    .one {
      grid-column: 1;
      grid-row: 1;
    }
    .threeColumns {
      grid-column: 1 / 4;
    },
    .fiveColumns {
      grid-column: 1 / 6;
    }
    .threeRows {
      grid-column: 1;
      grid-row: 1 / 5;
    }
    
    `;

    //Define public properties (databinding)
    @property() actionList: {}[] = [];
    @property() isHidden: boolean = false;

    //Empty history
    emptyActionList() {
      this.actionList = [];
    }

    //Show or Hide History
    showOrHide() {
        this.isHidden = !this.isHidden
    }

    //Send to Socket (Used for re-sending messages from history)
    sendToSocket(socketKey, message: string) {
    mx.socket.list[socketKey].mxSend(message, true);
  }

    //Create HTML Templates

    
    //Results Header
    templateHistoryHeader() {
        return html`
            <div class="gridHeader results" style="font-weight:600">
            <mx-icon class="fas fa-tasks"></mx-icon> actions

            <mx-icon @click=${this.showOrHide} style="cursor:pointer;" color=${this.isHidden ? "white" : "currentColor"} title="${this.isHidden ? "Show" : "Hide"} the history." size=".9" class="fas fa-eye"></mx-icon>

            <mx-icon @click=${this.emptyActionList} style="cursor:pointer;" title="Erase the history." size=".9" class="fas fa-trash"></mx-icon>

            </div>
        `
    }

    //Show this component on screen
    render() {

        return html`
            ${this.templateHistoryHeader()}
            ${this.actionList.length}
         `;
    }
}