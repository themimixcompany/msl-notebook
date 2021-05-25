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
@customElement('mx-history')
export class mxHistory extends LitElement {
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
    @property() history: {}[] = [];
    @property() isHidden: boolean = false;

    //Empty history
    emptyHistory() {
        this.history = [];
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

    //Outer History (Draws all history items)
    templateHistory() {

        //Setup for historyIndex
        let historyLength = this.history.length

        //Only draw if history exists (early return)
        if (historyLength < 1) {
            return;
        }

        //Setup for collecting all items from history array
        let historyItemTemplates;

        //look at all history items
        for (let historyIndex in this.history) {

            //Add the template for this history item to the outgoing HTML
            historyItemTemplates = html`
      ${historyItemTemplates}
      ${this.templateHistoryItem(historyIndex)}`;
        }

        //Return history item templates
        return html`
        
    <div class="grid2 greyBk results">
    ${historyItemTemplates}
    </div>
    `
    }

    //Single history item
    templateHistoryItem(historyIndex) {

        //Remember history item
        let historyItem = this.history[historyIndex];

        //Get first socket in history; this was the originating sender. Used for detecting relay result messages.
        let originalSendingSocket = Object.keys(historyItem)[0];

        let historyItemHeader = html`
            <div class="whiteHeaderText">
            message #${historyIndex * 1 + 1}
            </div>
            <div class="whiteHeaderText">
            to socket
            </div>
            <div class="whiteHeaderText">

            </div>
            <div class="whiteHeaderText">
            from socket
            </div>
            <div class="whiteHeaderText">
            received message
            </div>
        `

        //Setup for collecting all socket info for this item
        let socketTemplates;

        //look at all socket keys on this history item
        for (let socketKey of Object.keys(this.history[historyIndex])) {

            //Add one socket key's template to the history item
            socketTemplates = html`${socketTemplates} ${this.templateSocketItem(socketKey, historyItem[socketKey], originalSendingSocket)}`
        }

        //Return socket templates HTML
        return html`
            ${historyItemHeader}
            ${socketTemplates}
        `
    }

    //Single socket within a history item
    templateSocketItem(socketKey: string, messageValues: string[], originalSendingSocket:string) {

        //Extract sent and received message info
        const [sentMessage, receivedMessage] = messageValues;

        //Setup Colors
        let sentWireColor = mx.socket.list[socketKey].port.type == 'msl' ? mx.socket.list[socketKey].machine.ip == 'localhost' ? '#ec2028' : 'navy' : mx.socket.list[socketKey].port.type == 'admin' ? mx.socket.list[socketKey].machine.ip == 'localhost' ? 'darkOrange' : 'purple' : ''
        let ReceivedWireColor = mx.socket.list[socketKey].port.type == 'msl' ? mx.socket.list[socketKey].machine.ip == 'localhost' ? '#ec2028' : 'navy' : mx.socket.list[socketKey].port.type == 'admin' ? mx.socket.list[socketKey].machine.ip == 'localhost' ? 'darkOrange' : 'purple' : ''

        //Setup Icons
        let sentMessageIcon = socketKey == originalSendingSocket ? 'fas fa-keyboard' : 'fas fa-project-diagram';
        let receivedMessageIcon = sentMessage != "" ? 'fas fa-comment' : 'fas fa-comment-check';

        //Build single result template
        let singleResult = html`
            <div>
            ${sentMessage ? html`<mx-icon @click=${() => this.sendToSocket(socketKey,sentMessage)} class=${sentMessageIcon} color="${sentWireColor}" style="cursor:pointer;" title="Resend this message to ${socketKey}."></mx-icon> ${sentMessage}` : ""} 
            </div>
            <div>
            ${sentMessage ? html`<mx-icon class="fas fa-router" color="${sentWireColor}"></mx-icon> ${socketKey}` : ""}
            </div>
            <div>
            ${sentMessage ? html`==>` : ""}
            </div>
            <div>
            <mx-icon class= "fas fa-router" color="${ReceivedWireColor}"></mx-icon> ${socketKey}
            </div>
            <div>
            <mx-icon @click=${() => this.sendToSocket(socketKey,receivedMessage)} class=${receivedMessageIcon} color="${ReceivedWireColor}" title="Send this received message to ${socketKey}."></mx-icon>  ${receivedMessage}
            </div>
        `;

        //Return HTML
        return singleResult;
    }

    //Results Header
    templateHistoryHeader() {
        return html`
            <div class="gridHeader results" style="font-weight:600">
            history
            <mx-icon @click=${this.emptyHistory} style="cursor:pointer;" title="Remove this socket's message results." size=".9" class="fas fa-trash"></mx-icon>
            <mx-icon @click=${this.showOrHide} style="cursor:pointer;" color=${this.isHidden ? "white" : "currentColor"} title="${this.isHidden ? "Show" : "Hide"} the message results." size=".9" class="fas fa-eye"></mx-icon>
            </div>
        `
    }

    //Show this component on screen
    render() {

        return html`
            ${this.templateHistoryHeader()}
            ${this.isHidden ? "" : this.templateHistory()}
         `;
    }
}