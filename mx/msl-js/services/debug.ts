// MSL.js Debug Service
// by The Mimix Company

// Sends debugging information to the mx-debug component for display.

//SERVICE CONSTANTS



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


//PUBLIC FUNCTIONS

//log
//Write to the debugging component
const debugLog = function (message, echoToConsole: boolean = false) {

    //Notify document
    notify(document, "debug", message);

    //Echo to console if requested
    if (echoToConsole) {
        console.log(message);
    }


}


//Service Definition
export const debug = {
    log: debugLog
};
