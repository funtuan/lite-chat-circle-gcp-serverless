
const { userAddWaiting, userLeaveWaiting } = require('./waiting')
const { addChat, readChat, userLeaveRoom } = require('./room')
const { getUserStatus } = require('./user')
const { sendMenu } = require('./messenger')

module.exports.message = async (data) => {
    if (!data.userId) {
        return;
    }
    switch (data.type) {
        case 'text':
            await textHandler(data)
            break;
        case 'postback':
            await postbackHandler(data)
            break;
        case 'image':
            await imageHandler(data)
            break;
        case 'read':
            await readHandler(data)
            break;
        default:
            break;
    }
    return;
}

async function textHandler(data) {
    switch (data.text) {
        case '開始聊天':
            userAddWaiting(data.userId)
            break;
        case '取消配對':
            userLeaveWaiting(data.userId)
            break;
        case '離開聊天':
            userLeaveRoom(data.userId)
            break;
        default:
            const {
                status,
                onlineRoomId,
            } = await getUserStatus(data.userId)
            if (status === 'room') {
                addChat(data.userId, onlineRoomId, data)
            } else {
                sendMenu(data.userId, status)
            }
            break;
    }
}

async function postbackHandler(data) {
    switch (data.postback.payload) {
        case 'START_WAITING_PAYLOAD':
            userAddWaiting(data.userId)
            break;
        case 'LEAVE_WAITING_PAYLOAD':
            userLeaveWaiting(data.userId)
            break;
        case 'LEAVE_ROOM_PAYLOAD':
            userLeaveRoom(data.userId)
            break;
        default:
            const {
                status,
            } = await getUserStatus(data.userId)
            sendMenu(data.userId, status)
            break;
    }
}

const likeStickerIds = [
    369239343222814,
    369239383222810,
    369239263222822,
]

async function imageHandler(data) {
    const { sticker_id } = data.payload
    const {
        status,
        onlineRoomId,
    } = await getUserStatus(data.userId)
    if (sticker_id && likeStickerIds.indexOf(sticker_id) !== -1) {
        sendMenu(data.userId, status)
    }
    if (!sticker_id && onlineRoomId) {
        addChat(data.userId, onlineRoomId, data)
    }
}


async function readHandler(data) {
    readChat(data.userId)
}