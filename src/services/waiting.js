const dayjs = require('dayjs');
const { sendText, sendMenu } = require('./messenger')
const { DAILY_PAIR_LIMIT, REPEAT_LIMIT } = require('../config');
const { datastore, Kinds } = require('./datastore');
const { setUserStatus } = require('./user');
const { addPairTask } = require('./cloudTasks');

module.exports.userAddWaiting = async (userId) => {
    
    const waitingKey = datastore.key([Kinds.waiting, userId])
    console.log('userAddWaiting 1')
    const [waitings] = await datastore.runQuery(
        datastore.createQuery(Kinds.waiting).filter('__key__', waitingKey)
    )
    console.log('userAddWaiting 2')

    if (waitings.length > 0) {
        // 正在等待
        await sendText(userId, {
            text: '正在配對中，請稍候',
        })
    } else {
        const [historyUserAtRooms] = await datastore.runQuery(
            datastore.createQuery(Kinds.userAtRoom)
                .filter('userId', userId)
                .filter('createdAt', '>', dayjs().startOf('day').toDate())
                .order('createdAt', { descending: true })
                .limit(DAILY_PAIR_LIMIT)
        )
        console.log('userAddWaiting 3')
        if (historyUserAtRooms.length >= DAILY_PAIR_LIMIT) {
            await sendText(userId, {
                text: `今日配對次數已用盡，請明日再試，珍惜每天能配對的 ${DAILY_PAIR_LIMIT} 位同學！`,
            })
            return
        }

        const roomIds = historyUserAtRooms.slice(0, REPEAT_LIMIT).map(userAtRoom => userAtRoom.roomId)

        const tasks = roomIds.map(async roomId => {
            const [data] = await datastore.runQuery(
                datastore.createQuery(Kinds.userAtRoom)
                    .filter('roomId', roomId)
                    .order('createdAt', { descending: true })
            )
            return data
        })
        const historyOtherUserAtRooms = (await Promise.all(tasks)).flat()
        console.log('userAddWaiting 4')

        const banUserIds = [...new Set(
            historyOtherUserAtRooms
            .filter(userAtRoom => userAtRoom.userId !== userId)
            .map(userAtRoom => userAtRoom.userId)
        )].join(',')

        datastore.upsert({
            key: waitingKey,
            data: {
                userId,
                banUserIds,
                createdAt: new Date(),
            },
        });
        
        console.log('userAddWaiting 5')

        setUserStatus(userId, 'waiting')

        console.log('userAddWaiting 6')

        // 加入等待完成
        sendMenu(userId, 'waiting')
        sendText(userId, {
            text: `今日剩餘配對 ${DAILY_PAIR_LIMIT - historyUserAtRooms.length} 次，請珍惜每天能配對的 ${DAILY_PAIR_LIMIT} 位同學！`,
        })

        console.log('userAddWaiting 7')
        await addPairTask()
        console.log('userAddWaiting 8')
    }
}

module.exports.userLeaveWaiting = async (userId) => {
    const waitingKey = datastore.key([Kinds.waiting, userId])

    try {
        await datastore.delete(waitingKey)
    } catch (error) {
        sendText(userId, {
            text: '目前非配對狀態，操作無效',
        })
        return
    }
    
    setUserStatus(userId, 'home')
    sendMenu(userId, 'home')
}