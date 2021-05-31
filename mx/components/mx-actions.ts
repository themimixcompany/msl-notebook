// <mx-history>
// by The Mimix Company

//Displays the history of websocket communications, as returned from the MSL.js socket service.

//Lit Dependencies
import { html, css, LitElement, HTMLTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

//MSL.js Services
import * as mx from 'msl-js/service-loader'

//<mx-history>
//Displays history information collected from the socket service
@customElement('mx-actions')
export class mxActions extends LitElement {
    static styles = css`
    textarea { color: #ec2028; font-family: Inter Black; font-size: 18pt }
    ol,ul, input, h2, p, .machine, .results { font-family: Inter; font-size: 18pt }
    p {margin-top: 5px; margin-bottom: 5px;}
    .greyBk {background-color:#ccc; padding:5px;}
    .darkGreyBk {background-color:#aaa; padding:5px;}
    .navyBk {background-color:navy; padding:5px;}
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
      gap: 3px;
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

    //PUBLIC PROPERTIES (databinding) //////////
    @property() actionList: {}[] = [];
    @property() fullActions: {}[] = this.actionList;
    @property() name: string;
    @property() isHidden: boolean = false;

    //Show or Hide History
    showOrHide() {
        this.isHidden = !this.isHidden
    }

    //Send to Socket (Used for re-sending messages from history)
    sendToSocket(socketKey, message: string, notifyElement) {
        console.log("sending",socketKey,message)
        mx.socket.list[socketKey].mxSend(message, true, this, this.actionList, this.fullActions);
    }

    //Close socket
    closeSocket(socketKey) {
        mx.socket.list[socketKey].mxClose(this,this.actionList);
    }

    //Create HTML Templates
    //templateListHeader
    //templateList
    //templateItem
    //templateSubItem


    //List Header
    templateListHeader() {
        return html`
            <div class="gridHeader results" style="font-weight:600">
            <mx-icon class="fas fa-cogs"></mx-icon> ${this.name ? this.name : "actions"}

            <mx-icon @click=${() => this.showOrHide()} style="cursor:pointer;" color=${this.isHidden ? "white" : "currentColor"} title="${this.isHidden ? "Show" : "Hide"} these results." size=".9" class="fas fa-eye"></mx-icon>

            ${this.name ? html`
            <mx-icon @click=${() => this.closeSocket(this.name)} style="cursor:pointer;" title="Close the connection to ${this.name}." size=".9" class="fas fa-times-square"></mx-icon>
            ` : ""}
            </div>
        `
    }

    //List
    templateList() {

        //create a container to hold all item template results
        let itemTemplates: HTMLTemplateResult

        //accumulate all action item template results
        for (let actionIndex in this.actionList) {
            itemTemplates = html`${itemTemplates}${this.templateItem(actionIndex, this.actionList[actionIndex])}`;
        }

        //return all results   
        return html` 
            <div class="grid2 results">
            ${itemTemplates}
            </div>
            `
    }

    //Item
    templateItem(actionIndex, actionItem) {

        //Action Names & Icons
        const actionNames = ["connect", "send", "relay", "disconnect"];
        const actionIcons = ["fas fa-plug", "fas fa-keyboard", "fas fa-chart-network", "far fa-plug"];

        //Create 1-based action # for display
        let actionNumber = (actionIndex * 1) + 1;

        let actionItemHeader = html`
            <div class="whiteHeaderText navyBk">
            <mx-icon class="fas fa-list-ol"></mx-icon>
            </div>
            <div class="whiteHeaderText navyBk">
            <mx-icon class="fas fa-cogs"></mx-icon> action
            </div>
            <div class="whiteHeaderText navyBk">
            <mx-icon class="fas fa-router"></mx-icon> from
            </div>
            <div class="whiteHeaderText navyBk">
            <mx-icon class="fas fa-router"></mx-icon> to
            </div>
            <div class="whiteHeaderText navyBk">
            <mx-icon class="fas fa-envelope"></mx-icon> message
            </div>
            `

        let fromSocketKey = mx.socket.list[actionItem.from];
        let toSocketKey = mx.socket.list[actionItem.to];

        //Setup Colors
        let fromWireColor = fromSocketKey && fromSocketKey.port.type == 'msl' ? fromSocketKey && fromSocketKey.machine.ip == 'localhost' ? '#ec2028' : 'navy' : fromSocketKey && fromSocketKey.port.type == 'admin' ? fromSocketKey && fromSocketKey.machine.ip == 'localhost' ? 'darkOrange' : 'purple' : ''
        let toWireColor = toSocketKey && toSocketKey.port.type == 'msl' ? toSocketKey && toSocketKey.machine.ip == 'localhost' ? '#ec2028' : 'navy' : toSocketKey && toSocketKey.port.type == 'admin' ? toSocketKey && toSocketKey.machine.ip == 'localhost' ? 'darkOrange' : 'purple' : ''


        //Find icon for type
        let typeIcon = actionIcons[actionItem.type]

        //Build single result template
        let actionItemValues = html`
        <div class="greyBk" style="padding-left:8px;">
        ${actionNumber}
        </div>
        <div class="greyBk">
        <mx-icon class="${actionIcons[actionItem.type]}"></mx-icon> ${actionNames[actionItem.type]}
        </div>
        <div class="greyBk">
        ${actionItem.from ? html`<mx-icon class="fas fa-router" color=${fromWireColor}></mx-icon>` : ""}
        ${actionItem.from}
        </div>
        <div class="greyBk">
        ${actionItem.to ? html`<mx-icon class="fas fa-router" color=${toWireColor}></mx-icon>` : ""}
        ${actionItem.to}
        </div>
        <div class="greyBk">
        ${actionItem.message}
        </div>
    `;

        let responseItemHeader = html`
            <div class="whiteHeaderText darkGreyBk">
            <mx-icon class="fas fa-list-ol"></mx-icon>
            </div>
            <div class="whiteHeaderText darkGreyBk" style="grid-column:2/span 4">
            <mx-icon class="fas fa-reply-all"></mx-icon> response
            </div>
            
             `

        //create a container to hold all response teplate results
        let responseTemplates: HTMLTemplateResult

        //accumulate all action item template results
        for (let responseIndex in actionItem.response) {
            responseTemplates = html`${responseTemplates}${this.templateResponse(actionIndex, actionItem, responseIndex, actionItem.response[responseIndex])}`;
        }

        return !this.isHidden ? html`
        <div style="grid-column: 1/span 5; height:5px;"></div>
        ${actionItemHeader}
        ${actionItemValues}
        ${responseItemHeader}
        ${responseTemplates}
        ` : ""
    }

    //Response
    templateResponse(actionIndex, actionItem, responseIndex, responseItem) {

        
        //Response Names & Icons
        const responseNames = ["open", "receive", "roundtrip", "close"];
        const responseIcons = ["fas fa-door-open", "fas fa-comment-alt-check", "fas fa-comment-alt-dots", "fas fa-door-closed"];

        //Create 1-based action and response # for display
        let actionNumber = (actionIndex * 1) + 1;
        let responseNumber = (responseIndex * 1) + 1;

        let fromSocketKey = mx.socket.list[responseItem.from];
        let toSocketKey = mx.socket.list[responseItem.to];

          //Setup Colors
          let fromWireColor = fromSocketKey && fromSocketKey.port.type == 'msl' ? fromSocketKey && fromSocketKey.machine.ip == 'localhost' ? '#ec2028' : 'navy' : fromSocketKey && fromSocketKey.port.type == 'admin' ? fromSocketKey && fromSocketKey.machine.ip == 'localhost' ? 'darkOrange' : 'purple' : ''
          let toWireColor = toSocketKey && toSocketKey.port.type == 'msl' ? toSocketKey && toSocketKey.machine.ip == 'localhost' ? '#ec2028' : 'navy' : toSocketKey && toSocketKey.port.type == 'admin' ? toSocketKey && toSocketKey.machine.ip == 'localhost' ? 'darkOrange' : 'purple' : ''

        //Build single result template
        let responseItemValues = html`
            <div class="greyBk" style="padding-left:8px;">
            ${actionNumber}.${responseNumber}
            </div>
            <div class="greyBk">
            <mx-icon class=${responseItem.from == actionItem.to ? responseIcons[responseItem.type] : "fas fa-comment-alt-plus"}></mx-icon> ${responseNames[responseItem.type]}
            </div>
            <div class="greyBk">
            ${responseItem.from ? html`<mx-icon class="fas fa-router" color=${fromWireColor}></mx-icon>` : ""}
            ${responseItem.from}
            </div>
            <div class="greyBk">
            ${responseItem.to ? html`<mx-icon class="fas fa-router" color=${toWireColor}></mx-icon>` : ""}
            ${responseItem.to}
            </div>
            <div class="greyBk">
            ${responseItem.message ? html`
            <a @click=${() => this.sendToSocket(actionItem.to,responseItem.message,actionItem.notify)}>${responseItem.message}</a>
            ` : ""}
            </div>
        `;


        return html`
            ${responseItemValues}
            `
    }

    //Show this component on screen
    render() {

        return html`
            ${this.templateListHeader()}
            ${this.actionList[0] ? this.templateList() : ""}
         `;
    }
}