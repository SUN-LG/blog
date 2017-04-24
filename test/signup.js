const path = require('path')
const expect = require('chai').expect
const request = require('supertest')
const app = require('../index.js')
const User = require('../lib/mongo.js').User

const testName1 = 'testName1'
const testName2 = 'testName2'

describe('signup', function () {
  describe('POST /signup', function () {
    const agent = request.agent(app)
    beforeEach(function (done) {
      User.create({
        name: testName1,
        password: '123456',
        avatar: '',
        gender: 'x',
        bio: ''
      })
      .exec()
      .then(() => done())
      .catch(done)
    })

    afterEach(function (done) {
      User.remove({name: {$in: [testName1, testName2]}})
        .exec()
        .then(() => done())
        .catch(done)
    })

    it('wrong name', function (done) {
      agent
      .post('/signup')
      .type('form')
      .attach('avatar', path.join(__dirname, 'avatar.png'))
      .field({name: ''})
      .redirects()
      .end(function (err, res) {
        console.log('errrrr', err)
        if (err) return done(err)
        expect(res.text).to.match(/名字必须为1-10个字符/)
        done()
      })
    })

    it('success', function (done) {
      agent
        .post('/signup')
        .type('form')
        .attach('avatar', path.join(__dirname, 'avatar.png'))
        .field({name: testName2, gender: 'm', bio: 'noder', password: '123456', repassword: '123456'})
        .redirects()
        .end(function (err, res) {

          if (err) return done(err)
          expect(res.text).to.match(/注册成功/)
          console.log('succcccccccccccccccess')
          done()
        })
    })
  })

})
