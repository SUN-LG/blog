const config = require('config-lite')(__dirname)
const moment = require('moment')
const objectIdToTimestamp = require('objectid-to-timestamp')
const Mongolass = require('mongolass')
const mongolass = new Mongolass()

mongolass.plugin('addCreateAt', {
  afterFind(results) {
    results.forEach(item => {
      item.create_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm')
    })
    return results
  },
  afterFindOne(result) {
    if (result) result.create_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm')
    return result
  }
})

mongolass.connect(config.mongodb)

const User = mongolass.model('User', {
  name: {type: 'string'},
  password: {type: 'string'},
  avatar: {type: 'string'},
  gender: {type: 'string', enum: ['m', 'f', 'x']},
  bio: {type: 'string'}
})
User.index({name: 1}, {unique: true}).exec()

const Post = mongolass.model('Post', {
  author: {type: Mongolass.Types.ObjectId},
  title: {type: 'string'},
  content: {type: 'string'},
  pv: {type: 'number'}
})
Post.index({author: 1, _id: -1}).exec()

const Comment = mongolass.model('Comment', {
  author: {type: Mongolass.Types.ObjectId},
  content: {type: 'string'},
  postId: {type: Mongolass.Types.ObjectId}
})
Comment.index({postId: 1, _id: 1}).exec()
Comment.index({author: 1, _id: 1}).exec()

module.exports = {
  User,
  Post,
  Comment
};
