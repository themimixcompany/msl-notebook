// <mx-history>
// by The Mimix Company

//Displays the history of websocket communications, as returned from the MSL.js socket service.

//Lit Dependencies
import { html, css, LitElement, HTMLTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

//MSL.js Services
import * as mx from 'msl-js/service-loader'

//PRIVATE PROPERTIES //////////
const actionNames = ["connect", "send", "relay", "disconnect"];
const responseNames = ["open", "receive", "roundtrip", "close"];


//<mx-history>
//Displays history information collected from the socket service
@customElement('mx-history2')
export class mxHistory2 extends LitElement {
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
    //templateListHeader
    //templateList
    //templateItem
    //templateSubItem


    //List Header
    templateListHeader() {
        return html`
            <div class="gridHeader results" style="font-weight:600">
            <mx-icon class="fas fa-tasks"></mx-icon> actions

            <mx-icon @click=${this.showOrHide} style="cursor:pointer;" color=${this.isHidden ? "white" : "currentColor"} title="${this.isHidden ? "Show" : "Hide"} the history." size=".9" class="fas fa-eye"></mx-icon>

            <mx-icon @click=${this.emptyActionList} style="cursor:pointer;" title="Erase the history." size=".9" class="fas fa-trash"></mx-icon>

            </div>
        `
    }

    //List
    templateList() {

        //create a container to hold all item teplate results
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

        //Create 1-based action # for display
        let actionNumber = (actionIndex * 1) + 1;

        let actionItemHeader = html`
            <div class="whiteHeaderText navyBk">
            #
            </div>
            <div class="whiteHeaderText navyBk">
            action
            </div>
            <div class="whiteHeaderText navyBk">
            from
            </div>
            <div class="whiteHeaderText navyBk">
            to
            </div>
            <div class="whiteHeaderText navyBk">
            message
            </div>
            `

        //Build single result template
        let actionItemValues = html`
        <div class="greyBk">
        ${actionNumber}
        </div>
        <div class="greyBk">
        ${actionNames[actionItem.type]}
        </div>
        <div class="greyBk">
        ${actionItem.from}
        </div>
        <div class="greyBk">
        ${actionItem.to}
        </div>
        <div class="greyBk">
        ${actionItem.message}
        </div>
    `;

        let responseItemHeader = html`
            <div class="whiteHeaderText darkGreyBk">
            #
            </div>
            <div class="whiteHeaderText darkGreyBk">
            response
            </div>
            <div class="whiteHeaderText darkGreyBk">
            from
            </div>
            <div class="whiteHeaderText darkGreyBk">
            to
            </div>
            <div class="whiteHeaderText darkGreyBk">
            message
            </div>
             `

        //create a container to hold all response teplate results
        let responseTemplates: HTMLTemplateResult

        //accumulate all action item template results
        for (let responseIndex in actionItem.response) {
            responseTemplates = html`${responseTemplates}${this.templateResponse(actionIndex, responseIndex, actionItem.response[responseIndex])}`;
        }

        return html`
        ${actionItemHeader}
        ${actionItemValues}
        ${responseItemHeader}
        ${responseTemplates}
        `
    }

    //Response
    templateResponse(actionIndex, responseIndex, responseItem) {

        //Create 1-based action and response # for display
        let actionNumber = (actionIndex * 1) + 1;
        let responseNumber = (responseIndex * 1) + 1;



        //Build single result template
        let responseItemValues = html`
            <div class="greyBk">
            ${actionNumber}.${responseNumber}
            </div>
            <div class="greyBk">
            ${responseNames[responseItem.type]}
            </div>
            <div class="greyBk">
            ${responseItem.from}
            </div>
            <div class="greyBk">
            ${responseItem.to}
            </div>
            <div class="greyBk">
            ${responseItem.message}
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
            ${this.templateList()}
         `;
    }
}