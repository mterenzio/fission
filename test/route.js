var should = require('should');
var assert = require('assert');
var request = require('supertest');
var config = require('../config/config');

describe('Fission', function() {
    var url = 'http://localhost:4000';
    var storyStreamData = null;
    var userData = null;

//    before(function(done) {
//        var user = {
//            username: 'testUser',
//            email: 'testUser@test.com',
//            password: '123456'
//        };
//        request(url)
//            .post('/register')
//            .set('Content-Type', 'application/json')
//            .send(user)
//            .end(function(err, res) {
//                if (err) {
//                    throw err;
//                }
//
//                request(url)
//                    .post('/login')
//                    .set('Content-Type', 'application/json')
//                    .send(user)
//                    .end(function(err, res) {
//                        if (err) {
//                            throw err;
//                        }
//
//                        userData = res.body;
//                        console.log(userData);
//                        done();
//                    });
//            });
//    });

    describe('StoryStream', function() {
        it('should add data into story stream', function(done) {
            var storyStream = {
                title: 'test title',
                description: 'test description'
            };
            request(url)
                .post('/storystream')
                .set('Authorization', 'Bearer 8d557e70-20b4-11e4-b3de-d73b685c219c')
                .set('Content-Type', 'application/json')
                .send(storyStream)
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }
                   storyStreamData = res.body;
                    //res.should.have.status(200);
                    done();
                });
        });

        it('should get all data from story stream', function(done) {
            request(url)
                .get('/storystream/all')
                .set('Authorization', 'Bearer 8d557e70-20b4-11e4-b3de-d73b685c219c')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }
                    //res.should.have.status(200);
                    done();
                });
        });

        it('should get story stream by id', function(done) {
            request(url)
                .get('/storystream/' + storyStreamData._id)
                .set('Authorization', 'Bearer 8d557e70-20b4-11e4-b3de-d73b685c219c')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }
                    //res.should.have.status(200);
                    done();
                });
        });

        it('should get data based on query from story stream', function(done) {
            var query = {
                title: 'test title'
            };
            request(url)
                .post('/storystream/query')
                .set('Authorization', 'Bearer 8d557e70-20b4-11e4-b3de-d73b685c219c')
                .set('Content-Type', 'application/json')
                .send(query)
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }
                    //res.should.have.status(200);
                    done();
                });
        });

        it('should update story stream by id', function(done) {
            var storyStream = {
                title: 'test title',
                description: 'test description'
            };
            request(url)
                .put('//storystream/' + storyStreamData._id)
                .set('Authorization', 'Bearer 8d557e70-20b4-11e4-b3de-d73b685c219c')
                .set('Content-Type', 'application/json')
                .send(storyStream)
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

                    done();
                });
        });

        it('should delete story stream by id', function(done) {
            request(url)
                .delete('/storystream/' + storyStreamData._id)
                .set('Authorization', 'Bearer 8d557e70-20b4-11e4-b3de-d73b685c219c')
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }
                    //res.should.have.status(200);
                    done();
                });
        });
    });
});