// MSL Notebook Startup
// by The Mimix Company http://mimix.io

// LICENSE
// Blue Oak Model License, Version 1.0.0
//
// Purpose
// This license gives everyone as much permission to work with this software as possible, while protecting contributors from liability.
//
// Acceptance
// In order to receive this license, you must agree to its rules. The rules of this license are both obligations under that agreement and conditions to your license. You must not do anything with this software that triggers a rule that you cannot or will not follow.
//
// Copyright
// Each contributor licenses you to do everything with this software that would otherwise infringe that contributor’s copyright in it.
//
// Notices
// You must ensure that everyone who gets a copy of any part of this software from you, with or without changes, also gets the text of this license or a link to https://blueoakcouncil.org/license/1.0.0.
//
// Excuse
// If anyone notifies you in writing that you have not complied with Notices, you can keep your license by taking all practical steps to comply within 30 days after the notice. If you do not do so, your license ends immediately.
//
// Patent
// Each contributor licenses you to do everything with this software that would otherwise infringe any patent claims they can license or become able to license.
//
// Reliability
// No contributor can revoke this license.
//
// No Liability
// As far as the law allows, this software comes as is, without any warranty or condition, and no contributor will be liable to anyone for any damages related to this software or this license, under any kind of legal claim.

// GLOBAL CONSTANTS //////////
// Everything in this file is global to the entire application.

// VERSION //////////
const mslNotebook = {
    version: "2.0.8"
};


// GLOBAL FUNCTIONS //////////
// These functions are available to all components.

// GLOBAL ICONS 

//Action Names & Icons
const actionNames = ["connect", "send", "relay", "disconnect"];
const actionIcons = ["fas fa-plug", "fas fa-keyboard", "fas fa-chart-network", "far fa-plug"];

//Response Names & Icons
const responseNames = ["open", "receive", "roundtrip", "close"];
const responseIcons = ["fas fa-door-open", "fas fa-comment-alt-check", "fas fa-comment-alt-dots", "fas fa-door-closed"];

// GLOBAL COLORS

//Type Colors
const localMslColor = "#F65314";
const localAdminColor = "#FFBB00";
const remoteMslColor = "#00A1F1";
const remoteAdminColor = "#7CBB00";
const remoteTextColor = "#bf41f9";

// FILE DOWNLOADING //////////
// Opens a browser download dialog box for any content.

//downloadFile
//Download a file of arbitrary type
const downloadFile = (content, fileName, mimeType) => {
    const a = document.createElement("a");
    const fileOptions:BlobPropertyBag = {
        "type": mimeType,
        "endings": "native"
    }
    const file = new Blob([content], fileOptions);
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
}

//downloadJSON
//Download a JSON object or array
const downloadJSON = (content: {} | [], fileName:string = "jsonObject") => {
    downloadFile(JSON.stringify(content), fileName, "text/json")
}

//downloadText
//Download a text file
const downloadText = (content:string, fileName) => {
    downloadFile(content, fileName, "text/msl")
}

//downloadActionList
//Download the action list w/o the notify component
const downloadActionList = (actionList, name: string = "actionList") => {

    //Create an actionList w/o notify property because it is a circular reference in JSON
    let [...actionListCopy] = actionList
    for (let oneActionIndex in actionListCopy) {
        delete actionListCopy[oneActionIndex]["notify"];
    }
    downloadJSON(actionListCopy, `${name}.json`);
}

//downloadActionItem
//Download the action item w/o the notify component
const downloadActionItem = (actionItem: {}, name ?: string) => {

    //Create an actionItem w/o notify property because it is a circular reference in JSON
    let { ...actionItemCopy } = actionItem;
    delete actionItemCopy["notify"];
    downloadJSON(actionItemCopy, `${name ? name : `${actionNames[actionItem["type"]]}-${actionItem["to"]}`}.json`);
}

// FILE UPLOADING

//    <input @change=${this.uploadActionList} type="file" id="file" name="file">
const fileChooser = (uploadFunction) => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = uploadFunction;
    input.click();
}

const uploadFile = (event: Event): File => {
    const uploadedFile: File = event.target["files"][0];
    return uploadedFile;
}

const uploadText = async (event: Event): Promise<string> => {
    const uploadedFile: File = uploadFile(event);
    const uploadedFileText = await uploadedFile.text(); 
    return uploadedFileText;
}

const uploadJSON = async (event: Event): Promise<{}> => {
    const uploadedText = await uploadText(event);
    let uploadedJSON = {};

    try {
        uploadedJSON = JSON.parse(uploadedText);
        return uploadedJSON;
    } catch (error) {
        return false;
    }

}


// START APPLICATION //////////

//Clear console
console.clear();