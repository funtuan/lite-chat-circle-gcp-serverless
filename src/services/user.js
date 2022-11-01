
const { datastore, Kinds } = require('./datastore');

module.exports.getUserStatus = async (userId) => {
    const userStatusKey = datastore.key([Kinds.userStatus, userId])
    const [userStatuses] = await datastore.runQuery(
        datastore.createQuery(Kinds.userStatus).filter('__key__', userStatusKey)
    )
    if (userStatuses.length > 0) {
        return userStatuses[0]
    }
    return { status: 'home' }
}

module.exports.setUserStatus = async (userId, status, onlineRoomId = null) => {
    const userStatusKey = datastore.key([Kinds.userStatus, userId])
    await datastore.upsert({
        key: userStatusKey,
        data: {
            status,
            updatedAt: new Date(),
            onlineRoomId,
        },
    })
}
