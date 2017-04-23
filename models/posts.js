const Post = require('../lib/mongo').Post
const marked = require('marked')

const CommentModel = require('./comments')

Post.plugin('addCommentsCount', {
  afterFind(posts) {
    return Promise.all(posts.map(post => {
      return CommentModel.getCommentsCount(post._id).then(commentsCount => {
        post.commentsCount = commentsCount
        return post
      })
    }))
  },
  afterFindOne(post) {
    if (post) return CommentModel.getCommentsCount(post._id)
      .then(count => {
        post.commentsCount = count
        return post
      })

    return post
  }
})

Post.plugin('contentToHtml', {
  afterFind(posts) {
    return posts.map(post => {
      post.content = marked(post.content)
      return post
    })
  },
  afterFindOne(post) {
    if (post) post.content = marked(post.content)
    return post
  }
})

module.exports = {
  create(post) {
    return Post.create(post).exec()
  },

  // 通过id获取文章
  getPostById(postId) {
    return Post
      .findOne({_id: postId})
      .populate({path: 'author', model: 'User'})
      .addCreateAt()
      .addCommentsCount()
      .contentToHtml()
      .exec()
  },

  // 获取所有文章，或某个人的文章
  getPosts(author) {
    const query = {}
    if (author) query.author = author
    return Post
      .find(query)
      .populate({path: 'author', model: 'User'})
      .sort({_id: -1})
      .addCreateAt()
      .addCommentsCount()
      .contentToHtml()
      .exec()
  },

  // pv 加 1
  incPv(postId) {
    return Post
      .update({_id: postId}, {$inc: {pv: 1}})
      .exec()
  },

  // 获取文章原始内容 (编辑文章)
  getRawPostById(postId) {
    return Post
      .findOne({_id: postId})
      .populate({path: 'author', model: 'User'})
      .exec()
  },

  // 通过用户id和文章id更新一篇文章
  updatePostById(postId, author, data) {
    return Post
      .update({author: author, _id: postId}, {$set: data})
      .exec()
  },

  // 通过用户id和文章id删除一篇文章
  delPostById(postId, author) {
    return Post
      .remove({author: author, _id: postId})
      .exec()
      .then(res => {
        // 删除留言
        if (res.result.ok && res.result.n > 0) return CommentModel.delCommentByPostId(postId)
      })
  }
};
