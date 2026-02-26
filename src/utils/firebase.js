const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Make sure to set up your Firebase service account credentials
let firebaseApp;

/**
 * Initialize Firebase Admin SDK
 * @param {Object} serviceAccount - Firebase service account credentials
 * @returns {admin.app.App} Firebase app instance
 */
function initializeFirebase(serviceAccount) {
  if (!firebaseApp) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  return firebaseApp;
}

/**
 * Send notification to a single FCM token
 * @param {Object} params - Notification parameters
 * @param {string} params.token - FCM token of the recipient
 * @param {string} params.title - Notification title
 * @param {string} params.body - Notification body
 * @param {Object} [params.data] - Optional additional data payload
 * @param {Object} [params.options] - Optional notification options (priority, sound, etc.)
 * @returns {Promise<string>} Message ID if successful
 * @throws {Error} If sending fails
 */
async function sendNotificationToToken({ token, title, body, data = {}, options = {} }) {
  try {
    if (!token) {
      throw new Error('FCM token is required');
    }

    if (!title || !body) {
      throw new Error('Title and body are required');
    }

    const message = {
      token: token,
      notification: {
        title: title,
        body: body
      },
      data: {
        ...data,
        // Convert all data values to strings (FCM requirement)
        timestamp: new Date().toISOString()
      },
      android: {
        priority: options.priority || 'high',
        notification: {
          sound: options.sound || 'default',
          channelId: options.channelId || 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: options.sound || 'default',
            badge: options.badge || 1
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('Successfully sent notification to token:', token);
    return response;
  } catch (error) {
    console.error('Error sending notification to token:', token, error);
    throw error;
  }
}

/**
 * Send notification to multiple FCM tokens
 * @param {Object} params - Notification parameters
 * @param {string[]} params.tokens - Array of FCM tokens
 * @param {string} params.title - Notification title
 * @param {string} params.body - Notification body
 * @param {Object} [params.data] - Optional additional data payload
 * @param {Object} [params.options] - Optional notification options
 * @returns {Promise<Object>} Object containing success count, failure count, and responses
 * @throws {Error} If tokens array is empty or invalid
 */
async function sendNotificationToTokens({ tokens, title, body, data = {}, options = {} }) {
  try {
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      throw new Error('Tokens array is required and must not be empty');
    }

    if (!title || !body) {
      throw new Error('Title and body are required');
    }

    // Filter out null/undefined tokens
    const validTokens = tokens.filter(token => token && typeof token === 'string');

    if (validTokens.length === 0) {
      throw new Error('No valid tokens provided');
    }

    const message = {
      notification: {
        title: title,
        body: body
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      android: {
        priority: options.priority || 'high',
        notification: {
          sound: options.sound || 'default',
          channelId: options.channelId || 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: options.sound || 'default',
            badge: options.badge || 1
          }
        }
      }
    };

    // FCM supports sending to up to 500 tokens at once
    const batchSize = 500;
    const results = {
      successCount: 0,
      failureCount: 0,
      responses: []
    };

    // Process tokens in batches
    for (let i = 0; i < validTokens.length; i += batchSize) {
      const batch = validTokens.slice(i, i + batchSize);
      
      try {
        const response = await admin.messaging().sendEachForMulticast({
          tokens: batch,
          ...message
        });

        results.successCount += response.successCount;
        results.failureCount += response.failureCount;
        results.responses.push(...response.responses);

        // Log failures for debugging
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(`Failed to send to token ${batch[idx]}:`, resp.error);
          }
        });

        console.log(`Batch ${Math.floor(i / batchSize) + 1}: ${response.successCount} successful, ${response.failureCount} failed`);
      } catch (error) {
        console.error('Error sending batch:', error);
        results.failureCount += batch.length;
      }
    }

    console.log(`Total: ${results.successCount} successful, ${results.failureCount} failed out of ${validTokens.length} tokens`);
    return results;
  } catch (error) {
    console.error('Error sending notifications to multiple tokens:', error);
    throw error;
  }
}

/**
 * Send notification to a topic
 * @param {Object} params - Notification parameters
 * @param {string} params.topic - FCM topic name
 * @param {string} params.title - Notification title
 * @param {string} params.body - Notification body
 * @param {Object} [params.data] - Optional additional data payload
 * @param {Object} [params.options] - Optional notification options
 * @returns {Promise<string>} Message ID if successful
 */
async function sendNotificationToTopic({ topic, title, body, data = {}, options = {} }) {
  try {
    if (!topic) {
      throw new Error('Topic is required');
    }

    if (!title || !body) {
      throw new Error('Title and body are required');
    }

    const message = {
      topic: topic,
      notification: {
        title: title,
        body: body
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      android: {
        priority: options.priority || 'high',
        notification: {
          sound: options.sound || 'default',
          channelId: options.channelId || 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: options.sound || 'default',
            badge: options.badge || 1
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('Successfully sent notification to topic:', topic);
    return response;
  } catch (error) {
    console.error('Error sending notification to topic:', topic, error);
    throw error;
  }
}

module.exports = {
  initializeFirebase,
  sendNotificationToToken,
  sendNotificationToTokens,
  sendNotificationToTopic
};
