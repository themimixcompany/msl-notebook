// <mx-history>
// by The Mimix Company

//Displays the history of websocket communications, as returned from the MSL.js socket service.

//Lit Dependencies
import { mxElement } from 'global/mx-styles';
import { html, css, LitElement, HTMLTemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

//MSL.js Services
import * as mx from 'msl-js/service-loader'

//<mx-history>
//Displays history information collected from the socket service
@customElement('mx-actions')
export class mxActions extends mxElement {
    //CSS PROPERTIES //////////

    //Use shared styles
    static get styles() {
        return [
          super.styles,
          css``
        ];
      }

    //PRIVATE PROPERTIES



    //PRIVATE PROPERTIES

    //PUBLIC PROPERTIES (databinding) //////////
    @property() actionList: {}[] = [];
    @property() fullActions: {}[];
    @property() connector: {};
    @property() name: string;
    @property() isHidden: boolean = false;

    //Show or Hide Actions
    showOrHide() {
        let payload = "";
        mx.socket.notify(this.connector, "actions-hidden", payload)
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

    //downloadMSL
    downloadMSL = (actionList: {}[], fileName: string = "mslText.msl") => {
        downloadJSON(mx.socket.msl(actionList), fileName)
    }

    //Close socket
    closeSocket(socketKey) {
        mx.socket.list[socketKey].mxClose(this, this.fullActions);
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
            <div class=${this.isHidden ? "grid-fixed-rows" : "grid2"}>
            ${itemTemplates}
            </div>
            `
    }



    //Item
    templateItem(actionIndex, actionItem) {

        //Find icon for type
        let typeIcon = actionIcons[actionItem.type]

        //Setup icon title text
        let actionIconTitle = "";
        if (actionItem.type == 0) {
            actionIconTitle = `You connected to ${actionItem.to}.`
        }
        if (actionItem.type == 1) {
            actionIconTitle = `You sent a message to ${actionItem.to}.`
        }
        if (actionItem.type == 2) {
            actionIconTitle = `A message you sent on ${actionItem.from} was relayed to ${actionItem.to}.`
        }
        if (actionItem.type == 3) {
            actionIconTitle = `You disconnected from ${actionItem.to}.`
        }


        //Get to and from socket keys
        let fromSocketKey = mx.socket.list[actionItem.from];
        let toSocketKey = mx.socket.list[actionItem.to];

        //Setup for summary 2nd message (in "from" column)
        let secondMessage: string;

        //Look for first "receive" response
        for (let responseIndex in actionItem.response) {
            let responseItem = actionItem.response[responseIndex];

            //Don't show this unless hidden.
            if (!this.isHidden) {
                break;
            }

            //Choose the first received message for this action.
            if (responseItem.type == 1) {
                secondMessage = responseItem.message;
                fromSocketKey = mx.socket.list[responseItem.from];
                break;
            }
        }


        //Setup Colors
        let fromWireColor = fromSocketKey && fromSocketKey.port.type == 'msl' ? fromSocketKey && fromSocketKey.machine.ip == 'localhost' ? localMslColor : remoteMslColor : fromSocketKey && fromSocketKey.port.type == 'admin' ? fromSocketKey && fromSocketKey.machine.ip == 'localhost' ? localAdminColor : remoteAdminColor : ''
        let toWireColor = toSocketKey && toSocketKey.port.type == 'msl' ? toSocketKey && toSocketKey.machine.ip == 'localhost' ? localMslColor : remoteMslColor : toSocketKey && toSocketKey.port.type == 'admin' ? toSocketKey && toSocketKey.machine.ip == 'localhost' ? localAdminColor : remoteAdminColor : ''


        //Build summary action line
        let actionItemLine = html`
            <div class="whiteHeaderText veryDarkGreyBk elide" style="padding-left:10px;font-weight:900">
                ${actionItem.number}.
            </div>

            <div class="whiteHeaderText veryDarkGreyBk elide">
                <mx-icon color=${toWireColor} title=${actionIconTitle} class="${actionIcons[actionItem.type]}">
                </mx-icon> 
                ${actionNames[actionItem.type]}
            </div>

            <div class="whiteHeaderText veryDarkGreyBk elide">
                ${actionItem.message ? html`
                <mx-icon color=${toWireColor} title="The sent message." class="fas fa-envelope">
                </mx-icon> 
                <a title="Resend this message to ${actionItem.to}" @click=${() => this.sendToSocket(actionItem.to, actionItem.message, this.connector)}>${actionItem.message}` : ""}</a>
                
            </div>
        
            <div class="whiteHeaderText veryDarkGreyBk elide">
                ${secondMessage ? html`
                <mx-icon color=${fromWireColor} title="The message received from the ${actionNames[actionItem.type]}." class=${responseIcons[1]}>
                </mx-icon>
                ${secondMessage}` : ""}
            </div>
     
            <div class="whiteHeaderText veryDarkGreyBk elide">
                <mx-icon color=${toWireColor} title="The socket the action was sent to." class="fas fa-router">
                </mx-icon>
                ${actionItem.to}
            </div>
    
            <div class="whiteHeaderText veryDarkGreyBk elide" style="text-align:right;">
            ${this.name ? html`
                <mx-icon @click=${() => this.isHidden = !this.isHidden} style="cursor:pointer;" color=${this.isHidden ? "currentColor" : "lightGrey"} title="${this.isHidden ? "Show" : "Hide"} action ${actionItem.number}: ${actionNames[actionItem.type]}, and its responses."  class=${this.isHidden ? "fas fa-eye" : "fas fa-eye-slash"}></mx-icon>
                ` : ""}
                <mx-icon title="Download action ${actionItem.number}: ${actionNames[actionItem.type]}, and its responses as JSON." class="fas fa-file-export" style="cursor:pointer" @click=${() => downloadActionItem(actionItem)}></mx-icon>
            </div>
 
        `


        //create a container to hold all response teplate results
        let responseTemplates: HTMLTemplateResult

        //accumulate all action item template results
        for (let responseIndex in actionItem.response) {
            responseTemplates = html`${responseTemplates}${this.templateResponse(actionIndex, actionItem, responseIndex, actionItem.response[responseIndex])}`;
        }

        return html`
        ${!this.isHidden || this.name ? actionItemLine : ""}
        ${!this.isHidden ? responseTemplates : ""}
        `
    }

    //Response
    templateResponse(actionIndex, actionItem, responseIndex, responseItem) {

        //Create 1-based response # for display
        let responseNumber = (responseIndex * 1) + 1;

        let fromSocketKey = mx.socket.list[responseItem.from];
        let toSocketKey = mx.socket.list[responseItem.to];

        //Setup Colors
        let fromWireColor = fromSocketKey && fromSocketKey.port.type == 'msl' ? fromSocketKey && fromSocketKey.machine.ip == 'localhost' ? localMslColor : remoteMslColor : fromSocketKey && fromSocketKey.port.type == 'admin' ? fromSocketKey && fromSocketKey.machine.ip == 'localhost' ? localAdminColor : remoteAdminColor : ''
        let toWireColor = toSocketKey && toSocketKey.port.type == 'msl' ? toSocketKey && toSocketKey.machine.ip == 'localhost' ? localMslColor : remoteMslColor : toSocketKey && toSocketKey.port.type == 'admin' ? toSocketKey && toSocketKey.machine.ip == 'localhost' ? localAdminColor : remoteAdminColor : ''

        //Build single response template

        let responseIconTitle = "";
        if (responseItem.type == 0) {
            responseIconTitle = `${responseItem.from} responded that the connection is open.`
        }
        if (responseItem.type == 1) {
            if (responseItem.from == actionItem.to) {
                responseIconTitle = `${responseItem.from} sent you a message in response.`
            } else { responseIconTitle = `${responseItem.from} sent you a message separately from ${actionItem.to}.` }
        }
        if (responseItem.type == 2) {
            responseIconTitle = `The ${responseItem.from} socket responded to the message that you relayed from ${responseItem.to}.`
        }
        if (responseItem.type == 3) {
            responseIconTitle = `${responseItem.from} responded that the connection is closed.`
        }

        let responseItemValues = html`
            <div class="greyBk" style="padding-left:8px;">
            ${actionItem.number}.${responseNumber}
            </div>
            <div class="greyBk">
            <mx-icon color=${fromWireColor} title=${responseIconTitle} class=${responseItem.from == actionItem.to ? responseIcons[responseItem.type] : "fas fa-comment-alt-plus"}></mx-icon> ${responseNames[responseItem.type]}
            </div>
       

            <div class="greyBk">
            ${responseItem.message ? html`
            <a @click=${() => this.sendToSocket(responseItem.from, responseItem.message, this.connector)} title="Resend this message to ${responseItem.from}.">${responseItem.message}</a>
            ` : ""}
            </div>

            <div class="greyBk">
            ${responseItem.from ? html`<mx-icon title="The socket the response came from." class="fas fa-router" color=${fromWireColor}></mx-icon>` : ""}
            ${responseItem.from}
            </div>

            <div class="greyBk">
            ${responseItem.to ? html`<mx-icon class="fas fa-router" color=${toWireColor}></mx-icon>` : ""}
            ${responseItem.to}
            </div>
           
            <div class="greyBk">
            </div>
        `;

        return html`
            ${responseItemValues}
            `
    }

    //Show this component on screen
    render() {

        //BEFORE RENDER

        let actionListHeader = html`
        <div class="whiteHeaderText darkGreyBk">
         <mx-icon title="The order of responses." class="fas fa-list-ol"></mx-icon>
        </div>

        <div class="whiteHeaderText darkGreyBk">
            <div>
                <mx-icon title="Responses to this action." class="fas fa-cogs"></mx-icon> actions
            </div
            <div>
                
            </div>
        </div>

        <div class="whiteHeaderText darkGreyBk">
        <mx-icon title="Messages in this action." class="fas fa-envelope"></mx-icon> messages
        </div>

            <div class="whiteHeaderText darkGreyBk">
                <mx-icon title="The socket a response came from." class="fas fa-router">
                </mx-icon>
                from
            </div>

            <div class="whiteHeaderText darkGreyBk elide">
                <mx-icon title="The socket an action was sent to." class="fas fa-router">
                </mx-icon>
                to
            </div>
    
            <div class="whiteHeaderText darkGreyBk elide" style="text-align:right;">
            ${true ? html`
                <mx-icon @click=${() => this.showOrHide()} style="cursor:pointer;" color=${this.isHidden ? "currentColor" : "lightGrey"} title="${this.isHidden ? "Show" : "Hide"} all actions and responses."  class=${this.isHidden ? "fas fa-eye" : "fas fa-eye-slash"}></mx-icon>
                ` : ""}
                <mx-icon title="Download all actions and responses as JSON." class="fas fa-file-export" style="cursor:pointer" @click=${() => downloadActionList(this.fullActions)}></mx-icon>
            </div>

        `

        return html`
        
            ${this.actionList[0] && this.actionList[0]["number"] == 1 ? html`
            <div class="grid-fixed-rows" style="margin-bottom:3px">
                ${actionListHeader}
            </div>
            ` : ""}
            ${this.actionList[0] ? this.templateList() : ""}
         `;
    }
}