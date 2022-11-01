
const {CloudTasksClient} = require('@google-cloud/tasks');

// Instantiates a client.
const client = new CloudTasksClient({ fallback: true });
const {
    CLOUD_TASKS_PROJECT,
    CLOUD_TASKS_LOCATION,
    CLOUD_TASKS_EMAIL,
    CLOUD_TASKS_PAIR_QUEUE,
    CLOUD_TASKS_PAIR_URL,
} = require('../config');



module.exports.addPairTask = async () => {
  const pairParent = client.queuePath(CLOUD_TASKS_PROJECT, CLOUD_TASKS_LOCATION, CLOUD_TASKS_PAIR_QUEUE);
  const task = {
    httpRequest: {
        headers: {
          'Content-Type': 'text/plain',
        },
        httpMethod: 'POST',
        url: CLOUD_TASKS_PAIR_URL,
        oidcToken: {
          serviceAccountEmail: CLOUD_TASKS_EMAIL,
        },
    }
  };

  try {
    // Send create task request.
    const [response] = await client.createTask({parent: pairParent, task});
    console.log(`Created task ${response.name}`);
    return response.name;
  } catch (error) {
    // Construct error for Stackdriver Error Reporting
    console.log('Error creating task:', error);
  }
}