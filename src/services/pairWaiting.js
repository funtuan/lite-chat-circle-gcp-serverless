
const { createRoom } = require('./room')
const { datastore, Kinds } = require('./datastore');

module.exports.pair = async() => {
    let [waitings] = await datastore.runQuery(
        datastore.createQuery(Kinds.waiting)
            .order('createdAt')
    )
    let index = 0
    while (index < waitings.length) {
        for (let k = index + 1; k < waitings.length; k++) {
            if (
                waitings[index].banUserIds.split(',').indexOf(waitings[k].userId) === -1 &&
                waitings[k].banUserIds.split(',').indexOf(waitings[index].userId) === -1
            ) {
                await createRoom([waitings[index].userId, waitings[k].userId])
                await datastore.delete(waitings[index][datastore.KEY])
                await datastore.delete(waitings[k][datastore.KEY])
                waitings.splice(k, 1)

                k = waitings.length
            }
        }
        index++
    }
}

