const FBMessenger = require('fb-messenger')
const { homeMenu, waitingMenu, roomMenu, startRoomMenu } = require('../messengerTemplate/generic')
const { PAGE_ACCESS_TOKEN } = require('../config') 

const messenger = new FBMessenger({
    token: PAGE_ACCESS_TOKEN,
})

module.exports.sendText = async (userId, {
    text,
}) => {
    const [userType, bid] = userId.split(':')
    console.log('sendText', {
        id: bid,
        text,
    })
    await messenger.sendTextMessage({
        id: bid,
        text,
    }) 
}

module.exports.sendMenu = async (userId, type) => {
    const [userType, bid] = userId.split(':')
    console.log('sendMenu', type, {
        id: bid,
    })
    switch (type) {
        case 'home':
            await messenger.sendGenericMessage({
                id: bid,
                elements: homeMenu,
            }) 
            break;
        case 'waiting':
            await messenger.sendGenericMessage({
                id: bid,
                elements: waitingMenu,
            }) 
            break;
        case 'room':
            await messenger.sendGenericMessage({
                id: bid,
                elements: roomMenu,
            }) 
            break;
        case 'startRoom':
            await messenger.sendGenericMessage({
                id: bid,
                elements: startRoomMenu,
            }) 
            break;
        default:
            break;
    }
}


module.exports.sendRead = async (userId) => {
    const [userType, bid] = userId.split(':')
    console.log('sendAction', {
        id: bid,
        action: 'mark_seen',
    })
    await messenger.sendAction({
        id: bid,
        action: 'mark_seen',
    }) 
}
