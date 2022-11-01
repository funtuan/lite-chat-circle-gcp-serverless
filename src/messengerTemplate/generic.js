module.exports.homeMenu = [{
    "title":"聊天系Lite選單",
    "image_url":"https://chat-circle.com/images/get_started.png",
    "subtitle":"全新簡單，免註冊立刻聊！",
    "buttons":[
        {
            "type":"postback",
            "title":"開始聊天",
            "payload":"START_WAITING_PAYLOAD"
        }
    ]
}]

module.exports.waitingMenu = [{
    "title":"正在配對中",
    "image_url":"https://chat-circle.com/images/mate.png",
    "subtitle":"正在尋找你的聊聊夥伴，請等待",
    "buttons":[
        {
            "type":"postback",
            "title":"取消配對",
            "payload":"LEAVE_WAITING_PAYLOAD"
        }
    ]
}]

module.exports.roomMenu = [{
    "title":"聊天選單",
    "image_url":"https://chat-circle.com/images/menu.png",
    "subtitle":"按下離開後，將一去不復返",
    "buttons":[
        {
            "type":"postback",
            "title":"離開對話",
            "payload":"LEAVE_ROOM_PAYLOAD"
        }
    ]
}]


module.exports.startRoomMenu = [{
    "title":"配對完成",
    "image_url":"https://chat-circle.com/images/match.png",
    "subtitle":"直接打字，對方就會看到囉",
    "buttons":[
        {
            "type":"postback",
            "title":"離開對話",
            "payload":"LEAVE_ROOM_PAYLOAD"
        }
    ]
}]