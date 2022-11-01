
const { Datastore } = require('@google-cloud/datastore');

module.exports.datastore = new Datastore();

module.exports.Kinds = {
    userStatus: 'UserStatus',
    waiting: 'Waiting',
    userAtRoom: 'UserAtRoom',
    room: 'Room',
}