exports.handler = async function(event, context) {
    for (const message of event.Records) {
        console.log(message);
    }
};