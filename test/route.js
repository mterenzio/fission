var should = require('should');
var assert = require('assert');
var request = require('supertest');
var config = require('../config/config');
var mongoose= require("mongoose");

describe('Fission', function() {
    var url = 'http://localhost:4000';
    var storyStreamData = null;
    var userData = null;
    var db = null;
    var newsData = null;

    before(function(done) {
        var user = {
            username: 'testUser1',
            email: 'test1User@test.com',
            password: '123456',
            apiKey: '8d557e71-21b4-11f4-b6de-d73b685c219c',
            models: ['news']
        };
        mongoose.connect(config.get("db:mongodb:url"),config.get("db:mongodb:dbOptions"));
        var db = mongoose.connection;

        //console.log(conn);
        db.on('error', function(err){
           throw err;
        });

        db.once('open', function() {
            User = require('../model/user');
            new User(user).save(function(err, newUser){
                if(err)
                throw err;

                userData = newUser;
                done();
            })
        });
    });

    describe('StoryStream', function() {
        it('should add data into story stream', function(done) {
            var storyStream = {
                title: 'test title',
                description: 'test description'
            };
            request(url)
                .post('/storystream')
                .set('Authorization', 'Bearer ' + userData.apiKey)
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
                .set('Authorization', 'Bearer ' + userData.apiKey)
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
                .set('Authorization', 'Bearer ' + userData.apiKey)
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
                .set('Authorization', 'Bearer ' + userData.apiKey)
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
                .set('Authorization', 'Bearer ' + userData.apiKey)
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
                .set('Authorization', 'Bearer ' + userData.apiKey)
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

    describe('Model', function() {
        it('should add data into Model', function(done) {
            var news = {
                title: 'test title',
                description: 'test description'
            };
            request(url)
                .post('/news')
                .set('Authorization', 'Bearer ' + userData.apiKey)
                .set('Content-Type', 'application/json')
                .send(news)
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }
                    newsData = res.body;
                    //res.should.have.status(200);
                    done();
                });
        });

        it('should get all data from model', function(done) {
            request(url)
                .get('/news/all')
                .set('Authorization', 'Bearer ' + userData.apiKey)
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

        it('should get model by id', function(done) {
            request(url)
                .get('/news/' + newsData._id)
                .set('Authorization', 'Bearer ' + userData.apiKey)
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

        it('should get data based on query from model', function(done) {
            var query = {
                title: 'test title'
            };
            request(url)
                .post('/news/query')
                .set('Authorization', 'Bearer ' + userData.apiKey)
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

        it('should update model by id', function(done) {
            var news = {
                title: 'test title',
                description: 'test description'
            };
            request(url)
                .put('/news/' + newsData._id)
                .set('Authorization', 'Bearer ' + userData.apiKey)
                .set('Content-Type', 'application/json')
                .send(news)
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
                .delete('/news/' + newsData._id)
                .set('Authorization', 'Bearer ' + userData.apiKey)
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

    after(function(done){
        User = require('../model/user');
        User.findOne({username:'testUser1'}, function(err, user){
            if(err)
            throw err;

            user.remove(function(err){
                done();
            })
        })
    })
});