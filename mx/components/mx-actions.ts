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
    ol,ul, input, h2, p, .machine, .results { font-family: Inter; font-size: 18pt }
    p {margin-top: 5px; margin-bottom: 5px;}
    .greyBk {background-color:#ccc; padding:5px;}
    .darkGreyBk {background-color:#aaa; padding:5px;}
    .navyBk {background-color:navy; padding:5px;}
    .gridHeader {background-color:#bbb; font-family: Inter; font-size: 20pt }
    a { text-decoration: none; cursor: pointer;}
    a:hover {text-decoration: underline}
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
    `;

    //PRIVATE PROPERTIES

    //Action Names & Icons
    actionNames = ["connect", "send", "relay", "disconnect"];
    actionIcons = ["fas fa-plug", "fas fa-keyboard", "fas fa-chart-network", "far fa-plug"];

    //Response Names & Icons
    responseNames = ["open", "receive", "roundtrip", "close"];
    responseIcons = ["fas fa-door-open", "fas fa-comment-alt-check", "fas fa-comment-alt-dots", "fas fa-door-closed"];

    //PUBLIC PROPERTIES (databinding) //////////
    @property() actionList: {}[] = [];
    @property() fullActions: {}[];
    @property() name: string;
    @property() isHidden: boolean = false;


    //downloadFile
    //Download a file of arbitrary type
    downloadFile = (content, fileName, contentType) => {
        const a = document.createElement("a");
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }

    //downloadJSON
    //Download a JSON object or array
    downloadJSON = (content:{}|[], fileName) => {
        this.downloadFile(JSON.stringify(content), fileName, "text/json" )
    }

    //downloadActionList
    //Download the action list w/o the notify component
    downloadActionList(name: string) {

        //Create an actionList w/o notify property because it is a circular reference in JSON
        let [...actionListCopy] = this.actionList
        for (let oneActionIndex in actionListCopy) {
            delete actionListCopy[oneActionIndex]["notify"];
        }
        this.downloadJSON(actionListCopy, `${name ? name : "actionList"}.json`);
    }

    //downloadActionItem
    //Download the action item w/o the notify component
    downloadActionItem(actionItem:{}, name?: string) {

        //Create an actionItem w/o notify property because it is a circular reference in JSON
        let {...actionItemCopy} = actionItem;
        delete actionItemCopy["notify"];
        this.downloadJSON(actionItemCopy, `${name ? name : `${this.actionNames[actionItem["type"]]}-${actionItem["to"]}`}.json`);
    }

    //Show or Hide History
    showOrHide() {
        this.isHidden = !this.isHidden
    }

    //Send to Socket (Used for re-sending messages from history)
    sendToSocket(socketKey, message: string, notifyElement) {

        let allActions;
        if (this.fullActions) {
            allActions = this.fullActions
        } else {
            allActions = this.actionList
        }
        mx.socket.list[socketKey].mxSend(message, true, notifyElement, allActions);
    }

    //Close socket
    closeSocket(socketKey) {
        mx.socket.list[socketKey].mxClose(this, this.fullActions);
    }

    //Create HTML Templates
    //templateListHeader
    //templateList
    //templateItem
    //templateSubItem


    //List Header
    templateListHeader() {

        let toSocketKey = mx.socket.list[this.name];

        //Setup Colors
        let toWireColor = toSocketKey && toSocketKey.port.type == 'msl' ? toSocketKey && toSocketKey.machine.ip == 'localhost' ? '#ec2028' : 'navy' : toSocketKey && toSocketKey.port.type == 'admin' ? toSocketKey && toSocketKey.machine.ip == 'localhost' ? 'darkOrange' : 'purple' : ''

        return html`
            <div class="grid2" style="grid-gap:0px;">
                <div class="gridHeader" style="grid-column: 1/5; padding-left:3px;">
                    <mx-icon title=${this.name ? `Actions you take in this panel are recorded here.` : "All actions you take are recorded here."} class=${this.name ? "fas fa-keyboard" : "fas fa-cogs"} color=${toWireColor}></mx-icon> ${this.name ? this.name : "actions"}
                </div>

            <div class="gridHeader" style="text-align:right;padding-right:3px;">

                <mx-icon @click=${() => this.showOrHide()} style="cursor:pointer;" color=${this.isHidden ? "white" : "currentColor"} title="${this.isHidden ? "Show" : "Hide"} these results."  class="fas fa-eye"></mx-icon>

                ${this.actionList.length > 0 ? html`
                    <mx-icon title="Download these actions as JSON." class="fas fa-file-export" style="cursor:pointer" @click=${() => this.downloadActionList(this.name)}></mx-icon>
                ` : ""}

            </div>
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


        let actionItemHeader = html`
            <div class="whiteHeaderText navyBk">
             <mx-icon title=${this.name ? "The original order of each action. See the actions panel for the full list." : "The original order of each action."} class="fas fa-list-ol"></mx-icon>
            </div>
            <div class="whiteHeaderText navyBk">
                <div>
                    <mx-icon title="Actions you took." class="fas fa-cogs"></mx-icon> action
                    <mx-icon title="Download this ${this.actionNames[actionItem.type]} action and all its responses as JSON." class="fas fa-file-export" style="cursor:pointer" @click=${() => this.downloadActionItem(actionItem)}></mx-icon>
                </div
                <div>
                    
                </div>
            </div>
            <div class="whiteHeaderText navyBk">
            <mx-icon title="The socket a response was received from." class="fas fa-router"></mx-icon> from
            </div>
            <div class="whiteHeaderText navyBk">
            <mx-icon title="The socket an action or message was sent to." class="fas fa-router"></mx-icon> to
            </div>
            <div class="whiteHeaderText navyBk">
            <mx-icon title="The message itself." class="fas fa-envelope"></mx-icon> message
            </div>
            `

        let fromSocketKey = mx.socket.list[actionItem.from];
        let toSocketKey = mx.socket.list[actionItem.to];

        //Setup Colors
        let fromWireColor = fromSocketKey && fromSocketKey.port.type == 'msl' ? fromSocketKey && fromSocketKey.machine.ip == 'localhost' ? '#ec2028' : 'navy' : fromSocketKey && fromSocketKey.port.type == 'admin' ? fromSocketKey && fromSocketKey.machine.ip == 'localhost' ? 'darkOrange' : 'purple' : ''
        let toWireColor = toSocketKey && toSocketKey.port.type == 'msl' ? toSocketKey && toSocketKey.machine.ip == 'localhost' ? '#ec2028' : 'navy' : toSocketKey && toSocketKey.port.type == 'admin' ? toSocketKey && toSocketKey.machine.ip == 'localhost' ? 'darkOrange' : 'purple' : ''


        //Find icon for type
        let typeIcon = this.actionIcons[actionItem.type]

        //Setup icon title text
        let actionIconTitle = "";
        if (actionItem.type == 0) {
            actionIconTitle = "You connected to a socket."
        }
        if (actionItem.type == 1) {
            actionIconTitle = "You sent a message."
        }
        if (actionItem.type == 2) {
            actionIconTitle = "A message you sent was relayed to another socket."
        }
        if (actionItem.type == 3) {
            actionIconTitle = "You disconnected from a socket."
        }

        //Build single action item template
        let actionItemValues = html`
        <div class="greyBk" style="padding-left:8px;">
        ${actionItem.number}
        </div>
        <div class="greyBk">
        <mx-icon color=${toWireColor} title=${actionIconTitle} class="${this.actionIcons[actionItem.type]}"></mx-icon> ${this.actionNames[actionItem.type]}
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
        ${actionItem.message ? html`
            <a @click=${() => this.sendToSocket(actionItem.to, actionItem.message, actionItem.notify)} title="Resend this message to ${actionItem.to}.">${actionItem.message}</a>
            ` : ""}
        </div>
    `;

        let responseItemHeader = html`
            <div class="whiteHeaderText darkGreyBk">
            <mx-icon title="The order of each response." class="fas fa-list-ol"></mx-icon>
            </div>
            <div class="whiteHeaderText darkGreyBk" style="grid-column:2/span 4">
            <mx-icon title="All of the responses to this action, in order." class="fas fa-reply-all"></mx-icon> response
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

        //Create 1-based response # for display
        let responseNumber = (responseIndex * 1) + 1;

        let fromSocketKey = mx.socket.list[responseItem.from];
        let toSocketKey = mx.socket.list[responseItem.to];

        //Setup Colors
        let fromWireColor = fromSocketKey && fromSocketKey.port.type == 'msl' ? fromSocketKey && fromSocketKey.machine.ip == 'localhost' ? '#ec2028' : 'navy' : fromSocketKey && fromSocketKey.port.type == 'admin' ? fromSocketKey && fromSocketKey.machine.ip == 'localhost' ? 'darkOrange' : 'purple' : ''
        let toWireColor = toSocketKey && toSocketKey.port.type == 'msl' ? toSocketKey && toSocketKey.machine.ip == 'localhost' ? '#ec2028' : 'navy' : toSocketKey && toSocketKey.port.type == 'admin' ? toSocketKey && toSocketKey.machine.ip == 'localhost' ? 'darkOrange' : 'purple' : ''

        //Build single response template

        let responseIconTitle = "";
        if (responseItem.type == 0) {
            responseIconTitle = "The socket responded that the connection is open."
        }
        if (responseItem.type == 1) {
            if (responseItem.from == actionItem.to) {
            responseIconTitle = "The socket sent you a message."
            } else
            {responseIconTitle = "An additional socket sent you a message."}
        }
        if (responseItem.type == 2) {
            responseIconTitle = "The socket roundtripped a message that you relayed."
        }
        if (responseItem.type == 3) {
            responseIconTitle = "The socket responded that the connection is closed."
        }

        let responseItemValues = html`
            <div class="greyBk" style="padding-left:8px;">
            ${actionItem.number}.${responseNumber}
            </div>
            <div class="greyBk">
            <mx-icon color=${fromWireColor} title=${responseIconTitle} class=${responseItem.from == actionItem.to ? this.responseIcons[responseItem.type] : "fas fa-comment-alt-plus"}></mx-icon> ${this.responseNames[responseItem.type]}
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
            <a @click=${() => this.sendToSocket(actionItem.to, responseItem.message, actionItem.notify)} title="Resend this message to ${responseItem.from}.">${responseItem.message}</a>
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