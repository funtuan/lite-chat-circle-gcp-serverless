'use strict';

const { message } = require('./services/message');
const { VALIDATION_TOKEN } = require('./config');

function parseEventType (webhook_event) {
    let event = {
      'type': '',
      'subtype': ''
    };
  
    if (webhook_event.message) {
      if (webhook_event.message.is_echo) {    
        event.type = 'messaging_echoes';               
      } else {
        event.type = 'messages';     
        if (webhook_event.message.quick_reply) {
          event.subtype = 'quick_reply';
        } else if (webhook_event.message.attachments) {
          event.subtype = 'attachment';      
        } else {
          event.subtype = 'text';
        } 
      }
    } else if (webhook_event.postback) {
      event.type = 'messaging_postbacks';
    } else if (webhook_event.standby) {
      event.type = 'standby';
    } else if (webhook_event.delivery) {
      event.type = 'message_deliveries';
    } else if (webhook_event.read) {
      event.type = 'message_reads';    
    } else if (webhook_event.account_linking) {
      event.type = 'messaging_account_linking';
    } else if (webhook_event.optin) {
      event.type = 'messaging_optins';
    } else if (webhook_event.referral) {
      event.type = 'messaging_referrals';
      event.subtype = webhook_event.referral.source;
    } else if (webhook_event.pass_thread_control || webhook_event.take_thread_control || webhook_event.request_thread_control || webhook_event.app_roles) {
      event.type = 'messaging_handovers';
      if (webhook_event.pass_thread_control) {
        event.subtype = 'pass_thread_control';
      } else if (webhook_event.take_thread_control) {
        event.subtype = 'take_thread_control';
      } else if (webhook_event.request_thread_control) {
        event.subtype = 'request_thread_control';
      } else if (webhook_event.app_roles) {
        event.subtype = 'app_roles';
      }
    } else if (webhook_event['policy-enforcement']) {
      event.type = 'messaging_policy_enforcement';
    } else if (webhook_event.payment) {
      event.type = 'messaging_payments';
    } else if (webhook_event.pre_checkout) {
      event.type = 'messaging_pre_checkouts';
    } else if (webhook_event.checkout_update) {
      event.type = 'messaging_checkout_updates';
    } else if (webhook_event.game_play) {
      event.type = 'messaging_game_plays';
    } else {
      console.error('Webhook received unknown messagingEvent: ', webhook_event);
      event.type = 'unknown';
    }
    return event;
  }
  
module.exports.webhook = async (req, res) => {
    if (!VALIDATION_TOKEN) {
        console.error("Missing validation token");
        res.status(400).send(new Error('Missing validation token'));
    }


    if (req.method === "GET") {
        let query = req.query;
        if (query['hub.mode'] === 'subscribe' &&
            query['hub.verify_token'] === VALIDATION_TOKEN) {
            console.log("Validating webhook");
            res.status(200).send(query['hub.challenge']);
        } else {
            res.status(400).send(new Error('[403] Failed validation. Make sure the validation tokens match.'));
        }
    }
    else if (req.method === "POST") {
        res.status(200).send('EVENT_RECEIVED');
        let data = req.body;
        if (data.object == 'page') {
            var messagingList = data.entry[0].messaging;

            await Promise.all(messagingList.map(processMessagingEvent))
        }
    } else {
        res.status(400).send(new Error('Unrecognized method "' + req.method + '"'))
    }
};

async function processMessagingEvent(messagingEvent) {

    const {
        type,
    } = parseEventType(messagingEvent);

    if (type === 'messages') {
        if (messagingEvent.message.text) {
            message({
                userId: `fb:${messagingEvent.sender.id}`,
                type: 'text',
                text: messagingEvent.message.text,
            })
        }
        if (messagingEvent.message.attachments) {
            for (const attachment of messagingEvent.message.attachments) {
                message({
                    userId: `fb:${messagingEvent.sender.id}`,
                    type: attachment.type,
                    payload: attachment.payload,
                })
            }
        }
    }
    if (type === 'messaging_postbacks') {
        if (messagingEvent.postback) {
            message({
                userId: `fb:${messagingEvent.sender.id}`,
                type: 'postback',
                postback: messagingEvent.postback,
            })
        }
    }
    if (type === 'message_reads') {
        message({
            userId: `fb:${messagingEvent.sender.id}`,
            type: 'read',
            timestamp: messagingEvent.timestamp,
        })
    }
}