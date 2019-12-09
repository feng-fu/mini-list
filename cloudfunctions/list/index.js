const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) =>{
    const { OPENID } = cloud.getWXContext();
    switch(event.action) {
        case 'GET':
            return getList(OPENID, event, context)
        case 'post':
            return saveList(OPENID, event, context)
        case 'modify':
            return modifyList(OPENID, event, context)
        case 'del':
            return delListItem(OPENID, event, context)
        default:
            return
    }
}

async function getList(OPENID, event, context) {
    const todos = db.collection('list')
        
}

async function saveList(OPENID, event, context) {

}

async function modifyList(OPENID, event, context) {

}

async function delListItem(OPENID, event, context) {

}
