const express = require('express')
const PostModel = require('../models/posts')
const CommentModel = require('../models/comments')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin

// GET /posts 所有用户或特定用户的文章
router.get('/', function (req, res, next) {
  const author = req.query.author

  PostModel.getPosts(author)
    .then(posts => {
      res.render('posts', {posts})
    })
    .catch(next)
})

// POST /posts 发表一篇文章
router.post('/', checkLogin, function (req, res, next) {
  const author = req.session.user._id
  const title = req.fields.title
  const content = req.fields.content

  try {
    if (!title.length) throw new Error('请填写标题')
    if (!content.length) throw new Error('请填写内容')
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  let post = {
    author,
    title,
    content,
    pv: 0
  }

  PostModel.create(post)
    .then(result => {
      post = result.ops[0]
      req.flash('success', '创建成功')
      res.redirect(`/posts/${post._id}`)
    })
    .catch(next)
})

// GET /posts/create 创建一篇文章
router.get('/create', checkLogin, function (req, res, next) {
  res.render('create')
})

// GET /posts/:postId 获取特定的一篇文章
router.get('/:postId', function (req, res, next) {
  const postId = req.params.postId

  Promise.all([
    PostModel.getPostById(postId),
    CommentModel.getComments(postId),
    PostModel.incPv(postId)
  ])
  .then(result => {
    const post = result[0]
    const comments = result[1]
    if (!post) throw new Error('文章不存在')

    res.render('post', {post, comments})
  })
  .catch(next)
})

// 获取文章更新页
router.get('/:postId/edit', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id

  PostModel.getRawPostById(postId)
    .then(post => {
      if (!post) throw new Error('文章不存在')
      if (author.toString() !== post.author._id.toString()) throw new Error('权限不足')
      res.render('edit', {post})
    })
    .catch(next)
})

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id
  const {title, content} = req.fields

  PostModel.updatePostById(postId, author, {title, content})
    .then(() => {
      req.flash('success', '编辑成功')
      res.redirect(`/posts/${postId}`)
    })
    .catch(next)
})

// GET /posts/:postId/remove 删除一篇文章
router.post('/:postId/remove', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id

  PostModel.delPostById(postId, author)
    .then(() => {
      req.flash('success', '删除成功')
      res.redirect('/posts')
    })
    .catch(next)
})

//POST /posts/:postId/comment 创建一条留言
router.post('/:postId/comment', checkLogin, function (req, res, next) {
  const author = req.session.user._id
  const postId = req.params.postId
  const  content = req.fields.content
  const comment = {
    author,
    postId,
    content
  }

  CommentModel.create(comment)
    .then(() => {
      req.flash('success', '留言成功')
      res.redirect('back')
    })
    .catch(next)
})

// GET /posts/:postId/comment/:commentId/remove 删除留言
router.get('/:postId/comment/:commentId/remove', checkLogin, function (req, res, next) {
  const {commentId} = req.params
  const author = req.session.user._id

  CommentModel.delCommentById(commentId, author)
    .then(() => {
      req.flash('success', '删除留言成功')
      res.redirect('back')
    })
    .catch(next)
})

module.exports = router;
