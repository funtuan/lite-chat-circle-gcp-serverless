'use strict';

const { Datastore } = require('@google-cloud/datastore');
const { webhook } = require('./webhook');
const { pair } = require('./services/pairWaiting');

// Creates a client
const datastore = new Datastore();

exports.webhook = webhook

exports.http = async (req, res) => {
  // The kind for the new entity
  const kind = 'Task';

  // The name/ID for the new entity
  const name = 'sampletask1';

  // The Cloud Datastore key for the new entity
  const taskKey = datastore.key([kind, name]);

  // Prepares the new entity
  const task = {
    key: taskKey,
    data: {
      description: 'Buy milk',
    },
  };

  // Saves the entity
  await datastore.save(task);

  res.status(200).send('Hello World!' + JSON.stringify(req.query) + JSON.stringify(req.body) + JSON.stringify(req.method));
};

exports.event = (event, callback) => {
  callback();
};

exports.pair = async (req, res) => {
  await pair();
  res.status(200).send('ok!');
};