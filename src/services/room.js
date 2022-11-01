
// 換成 gcp upload 
const { ImgurClient } = require('imgur')
const { datastore, Kinds } = require('./datastore')
const { getUserStatus, setUserStatus } = require('./user')
const { sendText, sendMenu, sendRead } = require('./messenger')
const {
    IMGUR_CLIENT_ID,
    IMGUR_CLIENT_SECRET,
    IMGUR_REFRESH_TOKEN,
} = require('../config');


module.exports.createRoom = async (userIds) => {
    const roomKey = datastore.key(Kinds.room)
    await datastore.upsert({
        key: roomKey,
        data: {
            status: 'open',
            createdAt: new Date(),
        },
    })

    for (const userId of userIds) {
        await datastore.upsert({
            key: datastore.key(Kinds.userAtRoom),
            data: {
                userId,
                roomId: roomKey,
                createdAt: new Date(),
            },
        })

        await setUserStatus(userId, 'room', roomKey)

        setTimeout(()=> {
            sendMenu(userId, 'startRoom')
        }, 100)
    }
    return;
}

module.exports.userLeaveRoom = async (userId) => {
    const {
        status,
        onlineRoomId,
    } = await getUserStatus(userId)

    if (status !== 'room') {
        await sendText(userId, {
            text: '現在沒有加入任何聊天',
        })
        sendMenu(userId, 'home')
        return;
    }

    await setUserStatus(userId, 'home')
    await sendText(userId, {
        text: '已成功離開聊天',
    })
    sendMenu(userId, 'home')

    let [otherUserAtRooms] = await datastore.runQuery(
        datastore.createQuery(Kinds.userAtRoom)
            .filter('roomId', onlineRoomId)
    )
    otherUserAtRooms = otherUserAtRooms.filter(otherUserAtRoom => otherUserAtRoom.userId !== userId)

    for (const otherUserAtRoom of otherUserAtRooms) {
        const {
            status,
            onlineRoomId,
        } = await getUserStatus(otherUserAtRoom.userId)

        if (status === 'room' && onlineRoomId === otherUserAtRoom.roomId) {
            await setUserStatus(otherUserAtRoom.userId, 'home')
            await sendText(otherUserAtRoom.userId, {
                text: '對方離開聊天，請重新配對',
            })
            sendMenu(otherUserAtRoom.userId, 'home')
        }
    }

    await datastore.upsert({
        key: onlineRoomId,
        data: {
            status: 'close',
        },
    })
    return;
}

module.exports.addChat = async (userId, onlineRoomId, data) => {
    if (data.type === 'image') {
        const client = new ImgurClient({
            clientId: IMGUR_CLIENT_ID,
            clientSecret: IMGUR_CLIENT_SECRET,
            refreshToken: IMGUR_REFRESH_TOKEN,
        })
        const json = await client.upload({
            image: data.payload.url,
            title: new Date().toISOString(),
        })
        if (json.data && json.data.link) {
            data.text = json.data.link
        }
    }
    if (data.text) {
    
        let [otherUserAtRooms] = await datastore.runQuery(
            datastore.createQuery(Kinds.userAtRoom)
                .filter('roomId', onlineRoomId)
        )
        otherUserAtRooms = otherUserAtRooms.filter(otherUserAtRoom => otherUserAtRoom.userId !== userId)

        for (const otherUserAtRoom of otherUserAtRooms) {
            const {
                status,
                onlineRoomId: otherOnlineRoomId,
            } = await getUserStatus(otherUserAtRoom.userId)
            if (status != 'room' || onlineRoomId != otherOnlineRoomId) {
                console.log('addChat: user not in room userId=', otherUserAtRoom.userId)
                continue;
            }
            switch (data.type) {
                case 'text':
                    await sendText(otherUserAtRoom.userId, {
                        text: data.text,
                    })
                    break;
                case 'image':
                    await sendText(otherUserAtRoom.userId, {
                        text: data.text,
                    })
                    break;
                default:
                    break;
            }
        }
    }

    return;
}

module.exports.readChat = async (userId) => {
    const {
        status,
        onlineRoomId,
    } = await getUserStatus(userId)
    if (status === 'room') {
        let [otherUserAtRooms] = await datastore.runQuery(
            datastore.createQuery(Kinds.userAtRoom)
                .filter('roomId', onlineRoomId)
        )
        otherUserAtRooms = otherUserAtRooms.filter(otherUserAtRoom => otherUserAtRoom.userId !== userId)
        for (const otherUserAtRoom of otherUserAtRooms) {
            sendRead(otherUserAtRoom.userId)
        }
    }

    return;
}

