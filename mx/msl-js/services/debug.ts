// MSL.js Debug Service
// by The Mimix Company

import { mxCommunicator } from "components/mx-communicator";


// Sends debugging information to the mx-debug component for display.


//PRIVATE FUNCTIONS

//notify
//Send an event to a web component or HTML element
const notify = function (notifyElement, eventName: string, payload: any) {

    //create event
    let notifyEvent = new CustomEvent(eventName);

    //attach payload
    notifyEvent.payload = payload;

    //dispatch
    notifyElement.dispatchEvent(notifyEvent);
};


//PUBLIC PROPERTIES

let echo = false;

//PUBLIC FUNCTIONS

//log
//Write to the debugging component
const debugLog = function (...message: string[]) {

    //Notify document
    notify(document, "debug", message);

    //Echo to console if requested
    if (echo) {
        mxCommunicator.con(message);
    }


}

const setEcho = function(isEcho: boolean = true) {
    echo = isEcho;
};

//Service Definition
export const debug = {
    log: debugLog,
    echo: setEcho
};
