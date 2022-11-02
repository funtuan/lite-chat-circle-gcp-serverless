'use strict';

const { Datastore } = require('@google-cloud/datastore');
const { webhook } = require('./webhook');
const { pair } = require('./services/pairWaiting');

// Creates a client
const datastore = new Datastore();

exports.webhook = webhook

exports.event = (event, callback) => {
  callback();
};

exports.pair = async (req, res) => {
  await pair();
  res.status(200).send('ok!');
};