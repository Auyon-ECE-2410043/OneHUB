/**
 * File: pushNotification.js
 * Description: Wrapper for sending native mobile push notifications (FCM).
 * Note: To be fully implemented when the mobile app connects via Firebase.
 */

const User = require("../models/User");

// TODO: Require 'firebase-admin' once mobile app is built
// const admin = require("firebase-admin");
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

/**
 * Send a push notification to a user's mobile devices.
 * 
 * @param {String} userId - The MongoDB ObjectId of the user.
 * @param {String} title - Notification title.
 * @param {String} body - Notification body.
 * @param {Object} data - Optional payload data (e.g., screen to open).
 */
async function sendPushNotification(userId, title, body, data = {}) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      console.log(`[Push] Skip: User ${userId} has no registered mobile devices.`);
      return;
    }

    const tokens = user.fcmTokens;
    console.log(`[Push] Preparing to send to ${tokens.length} devices for User ${userId}.`);

    /* 
      // FIREBASE IMPLEMENTATION (Uncomment when Firebase is set up)
      
      const payload = {
        notification: { title, body },
        data: data,
        tokens: tokens, // Multicast
      };

      const response = await admin.messaging().sendMulticast(payload);
      
      // Cleanup invalid/expired tokens from DB
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        
        if (failedTokens.length > 0) {
          user.fcmTokens = user.fcmTokens.filter(t => !failedTokens.includes(t));
          await user.save();
          console.log(`[Push] Removed ${failedTokens.length} invalid tokens.`);
        }
      }
    */
   
    console.log(`[Push] Mock sent: "${title}" to user ${userId}`);

  } catch (error) {
    console.error("[Push] Error sending push notification:", error);
  }
}

module.exports = {
  sendPushNotification
};
