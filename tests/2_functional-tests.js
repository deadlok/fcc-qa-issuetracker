const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    let update_id
    let delete_id

    test('#1 Create an issue with every field', function (done) {
        chai
        .request(server)
        .keepOpen()
        .post('/api/issues/apitest')
        .send({
            issue_title: 'Issue test 1',
            issue_text: 'Issue test 1 description',
            created_by: 'Test Reporter',
            assigned_to: 'Staff 1',
            status_text: 'Investigating'
        })
        .end(function (err, res) {
            update_id = res.body._id
            //console.log(update_id)
            let date = new Date()

            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.issue_title, 'Issue test 1');
            assert.equal(res.body.issue_text, 'Issue test 1 description');
            assert.equal(res.body.created_by, 'Test Reporter');
            assert.equal(res.body.assigned_to, 'Staff 1');
            assert.equal(res.body.status_text, 'Investigating');
            assert.equal(res.body.created_on.substring(0, 16), new Date().toISOString().substring(0,16)) ;
            assert.equal(res.body.updated_on.substring(0, 16), new Date().toISOString().substring(0,16)) ;
            assert.equal(res.body.open, true);
            done();
        });
    });

    test('#2 Create an issue with only required field', function (done) {
        chai
        .request(server)
        .keepOpen()
        .post('/api/issues/apitest')
        .send({
            issue_title: 'Issue test 2',
            issue_text: 'Issue test 2 description',
            created_by: 'Test Reporter',
        })
        .end(function (err, res) {
            delete_id = res.body._id
            let date = new Date()

            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');   
            assert.equal(res.body.issue_title, 'Issue test 2');
            assert.equal(res.body.issue_text, 'Issue test 2 description');
            assert.equal(res.body.created_by, 'Test Reporter');
            assert.equal(res.body.assigned_to, '');
            assert.equal(res.body.status_text, '');
            assert.equal(res.body.created_on.substring(0, 14), new Date().toISOString().substring(0,14)) ;
            assert.equal(res.body.updated_on.substring(0, 14), new Date().toISOString().substring(0,14)) ;
            assert.equal(res.body.open, true);
            done();
        });
    });  

    test('#3 Create an issue with missing required fields', function (done) {
        chai
        .request(server)
        .keepOpen()
        .post('/api/issues/apitest')
        .send({
            issue_title: 'Issue test 3',
            issue_text: 'Issue test 3 description',
            created_by: '',
        })
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.error, 'required field(s) missing');
            done();
        });
    });

    test('#4 View issues on a project', function (done) {
        chai
        .request(server)
        .keepOpen()
        .get('/api/issues/apitest')
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.isAbove(res.body.length, 1);
            assert.property(res.body[0],'issue_title');
            assert.property(res.body[0],'issue_text');
            assert.property(res.body[0],'created_by');
            assert.property(res.body[0],'created_on');
            assert.property(res.body[0],'updated_on');
            assert.property(res.body[0],'assigned_to');
            assert.property(res.body[0],'status_text');
            assert.property(res.body[0],'open');
            done();
        });
    });

    test('#5 View issues on a project with one filter', function (done) {
        chai
        .request(server)
        .keepOpen()
        .get('/api/issues/apitest?created_by=Test Reporter')
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.isAbove(res.body.length, 1);
            assert.property(res.body[0],'issue_title');
            assert.property(res.body[0],'issue_text');
            assert.property(res.body[0],'created_by');
            assert.property(res.body[0],'created_on');
            assert.property(res.body[0],'updated_on');
            assert.property(res.body[0],'assigned_to');
            assert.property(res.body[0],'status_text');
            assert.property(res.body[0],'open');
            done();
        });
    });

    test('#6 View issues on a project with multiple filter', function (done) {
        chai
        .request(server)
        .keepOpen()
        .get('/api/issues/apitest?created_by=Test Reporter&assigned_to=')
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.isAbove(res.body.length, 1);
            assert.property(res.body[0],'issue_title');
            assert.property(res.body[0],'issue_text');
            assert.property(res.body[0],'created_by');
            assert.property(res.body[0],'created_on');
            assert.property(res.body[0],'updated_on');
            assert.property(res.body[0],'assigned_to');
            assert.property(res.body[0],'status_text');
            assert.property(res.body[0],'open');
            done();
        });
    });

    test('#7 Update one field on an issue', function (done) {
        chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest')
        .send({
            _id: update_id,
            issue_text: 'Issue test 1 modified'

        })
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.result, 'successfully updated');
            assert.equal(res.body._id, update_id);
            done();
        });
    });

    test('#8 Update multiple fields on an issue', function (done) {
        chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest')
        .send({
            _id: update_id,
            issue_text: 'Issue test 1 modified',
            created_by: 'Test Reporter'
        })
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.result, 'successfully updated');
            assert.equal(res.body._id, update_id);
            done();
        });
    });

    test('#9 Update an issue with missing _id', function (done) {
        chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest')
        .send({
            issue_text: 'Issue test 1 modified',
            created_by: 'Test Reporter'
        })
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.error, 'missing _id');
            done();
        });
    });

    test('#10 Update an issue with no fields to update', function (done) {
        chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest')
        .send({
            _id: update_id
        })
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.error, 'no update field(s) sent');
            assert.equal(res.body._id, update_id);
            done();
        });
    });

    test('#11 Update an issue with an invalid _id', function (done) {
        chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest')
        .send({
            _id: '*** invalid id ***',
            issue_text: 'Issue test 1 modified',
            created_by: 'Test Reporter'
        })
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.error, 'could not update');
            assert.equal(res.body._id, '*** invalid id ***');
            done();
        });
    });

    test('#12 Delete an issue', function (done) {
        // delete all created issue for testing
        chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/apitest')
        .send({
            _id: delete_id,
        })
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.result, 'successfully deleted');
            assert.equal(res.body._id, delete_id);
        });

        chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/apitest')
        .send({
            _id: update_id,
        })
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.result, 'successfully deleted');
            assert.equal(res.body._id, update_id);
            done();
        });
    });


    test('#13 Delete an issue with an invalid _id', function (done) {
        // delete all created issue for testing
        chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/apitest')
        .send({
            _id: '*** invalid id ***',
        })
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.error, 'could not delete');
            assert.equal(res.body._id, '*** invalid id ***');
            done();
        });
    });

    test('#14 Delete an issue with missing _id', function (done) {
        // delete all created issue for testing
        chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/apitest')
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.error, 'missing _id');
            done();
        });
    });
});

// console.log('res.body')
// console.log(typeof res.body)
// console.log(res.body) 
