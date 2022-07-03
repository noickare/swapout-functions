/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable require-jsdoc */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import {IUser} from "./models/user";
import {IConversation, IMessage} from "./models/conversation";
import {sendEmail, truncateString} from "./utils/helpers";
import {Message} from "firebase-admin/lib/messaging/messaging-api";
import {v4 as uuidv4} from "uuid";
import {INotification} from "./models/notifications";
import {firestore} from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.urlencoded());


const usersCollection = db.collection("users");
const conversationCollection = db.collection("userConversationList");

export const api = functions.https.onRequest(app);

exports.createUserOnRegister = functions.auth.user().onCreate(async (user) => {
  try {
    const toSaveUser: IUser = {
      uid: user.uid,
      email: user.email as string,
      username: "",
      createdAt: user.metadata.creationTime as string,
      lastLoginTime: user.metadata.lastSignInTime as string,
      isEmailVerified: user.emailVerified,
      name: user.displayName || "",
      avatar: user.photoURL || "",
    };

    await usersCollection.doc(user.uid).set(toSaveUser);
  } catch (error) {
    // TODO: log error
    console.log("user creation error", error);
  }
});


exports.notificationOnMessageCreate = functions.firestore.document("/items/{itemId}/conversations/{conversationId}/messages/{messageId}").onCreate(async (snapshot, context) => {
  const messageMeta = snapshot.data() as IMessage;
  const conversationId = context.params.conversationId;
  const conversationSnapshot = await conversationCollection.doc(conversationId).get();
  if (conversationSnapshot.exists) {
    const conversation = conversationSnapshot.data() as IConversation;
    const toReceiveNotifications = conversation.users.filter((u) => u != messageMeta.sender);
    const senderData = await (await usersCollection.doc(messageMeta.sender).get()).data() as IUser;

    toReceiveNotifications.forEach(async (userId) => {
      const userSnapshot = await usersCollection.doc(userId).get();
      if (userSnapshot.exists) {
        const userData = userSnapshot.data() as IUser;
        const notificationUid = uuidv4();
        const notification: INotification = {
          uid: notificationUid,
          content: "New Message from " + senderData.name || senderData.email.substring(0, 3),
          seen: false,
          deepLink: `https://clueswap.com/item/${conversation.itemId}/conversations/${conversation.uid}`,
          createdAt: firestore.FieldValue.serverTimestamp(),
        };
        await usersCollection.doc(userData.uid).collection("notifications").doc(notificationUid).set(notification);
        const payload: Message = {
          token: userData.fcmToken as string,
          notification: {
            title: "New message from " + senderData.name,
            body: truncateString(messageMeta.content, 240),
          },
          data: {
            body: truncateString(messageMeta.content, 240),
          },
        };
        try {
          await sendEmail(userData.email, "You have a new message");
        } catch (error) {
          console.log("error sending email", error);
        }
        try {
          await admin.messaging().send(payload);
        } catch (err: any) {
          console.log("error sending notification", err);
        }
      }
    });
  }
});

