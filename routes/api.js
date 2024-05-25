'use strict';
require('dotenv').config();

module.exports = function (app) {

  const mongoose = require('mongoose')
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>{
    console.log("Connected to MongoDB")
  })
  .catch((e)=>{
    console.log("Cannot Connected to MongoDB")
    console.log(e)
  });

  const issueSchema = new mongoose.Schema({
    issue_title: {
      type: String,
      required: true
    },
    issue_text: {
      type: String,
      required: true
    },
    created_by: {
      type: String,
      required: true
    },
    created_on: {
      type: Date,
      required: true
    },
    updated_on: {
      type: Date
    },
    assigned_to: {
      type: String
    },
    open: {
      type: Boolean,
      default: true
    },
    status_text: {
      type: String
    }
  })

  app.route('/api/issues/:project')
  
    .get(async function (req, res){
      let project = req.params.project;
      let Issue = mongoose.model(project, issueSchema)

      let reqParam = req.query;
      try {
        const data = await Issue.find(reqParam);
        res.json(data)
      } catch(e) {
        console.log(e);
      }
    })
    
    .post(async function (req, res){
      let project = req.params.project;

      let issue_title = req.body.issue_title;
      let issue_text = req.body.issue_text;
      let created_by = req.body.created_by;
      let created_on = Date.now();
      let updated_on = created_on;
      let assigned_to = req.body.assigned_to?req.body.assigned_to:""
      let status_text = req.body.status_text?req.body.status_text:""

      let Issue = mongoose.model(project, issueSchema)
      let issue = new Issue({
        issue_title: issue_title,
        issue_text: issue_text,
        created_by: created_by,
        created_on: created_on,
        updated_on: updated_on,
        assigned_to: assigned_to,
        status_text: status_text
      })
      try {
        const data = await issue.save();

        //console.log(data)
        res.json(data);
      } catch(err){
        console.log(err);
        if(err.message.match('is required')) res.json({error: 'required field(s) missing'});
      } 
    })
    
    .put(async function (req, res){
      let project = req.params.project;
      let _id = req.body._id;
      let Issue = mongoose.model(project, issueSchema)
      

      if (!_id) {
        res.json({error: 'missing _id'})
      } else {
        try { 
        await Issue.findById(_id)
        .then(async data => {
          console.log("body :")
          console.log(req.body)

          let updateTotal = 0 
          if (req.body.issue_title){
            data.issue_title = req.body.issue_title;
            updateTotal += 1;
          }
          if (req.body.issue_text){
            data.issue_text = req.body.issue_text;
            updateTotal += 1;
          }
          if (req.body.created_by){
            data.created_by = req.body.created_by;
            updateTotal += 1;
          }
          if (req.body.assigned_to){
            data.assigned_to = req.body.req.body.assigned_to
            updateTotal += 1;
          }
          if (req.body.status_text){
            data.status_text = req.body.status_text
            updateTotal += 1;
          }
          if (req.body.open == 'false'){
            data.open == req.body.open
            updateTotal += 1;
          }

          if (updateTotal == 0) res.json({ error: 'no update field(s) sent', '_id':_id})
          else {
            data.updated_on = Date.now()
            const newIssue = await data.save()
            console.log(newIssue)
            res.json({result: 'successfully updated', '_id': _id })
          }
        })
      } catch (e) {
        console.log(e)
        res.json({error: 'could not update', '_id': _id })
      }
    }
    })
    
    .delete(async function (req, res){
      let project = req.params.project;
      let _id = req.body._id;
      if (_id == '') {
        res.json({error: 'missing _id'})
      } else { 
        let Issue = mongoose.model(project, issueSchema)
        try {
          await Issue.findOneAndRemove({_id: _id})
          res.json({result: 'successfully deleted', '_id':_id})
        } catch(e) {
          res.json({error: 'could not delete', '_id': _id})
        }
      }
    });
    
};
