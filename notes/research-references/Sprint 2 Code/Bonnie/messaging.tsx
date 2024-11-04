function encryptMessage(newMessage: string, sendTo: string, currID: string): void {}

function getUserInput(currID: string): void {
    let newMessage: string;
    let sendTo: string | null;
    while (true) {
        newMessage = prompt("Enter message:") || "";
        if (newMessage) break;
    }
    while (true) {
        sendTo = prompt("Enter ID:");
        if (sendTo === "-1") {
            return;
        }
        if (sendTo) break;
    }
    if (!newMessage || !sendTo) {
        throw new Error("Please provide your message and ID");
    }
    encryptMessage(newMessage, sendTo, currID);
}


function printMessage(receivedMessage: string, currentID: string, senderID: string): void {
    const currentUserID = currentID;
    const senderUserID = senderID
    const formattedMessage = `${senderUserID}: ${receivedMessage}`;
    console.log(formattedMessage);

}

