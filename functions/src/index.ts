/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable require-jsdoc */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import {IUser} from "./models/user";
import {createUser} from "./faker/users";
import {createItem} from "./faker/item";
import {IItem} from "./models/item.";

admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

const app = express();
app.use(cors());
app.use(express.urlencoded());

const usersCollection = db.collection("users");
const seedCollection = db.collection("seeds");
const itemsCollection = db.collection("items");

app.get("/fake-users/:count", async (request, response) => {
  const count = parseInt(request.params.count);
  const users: IUser[] = [];
  if (count >= 1) {
    for (let index = 0; index < count; index++) {
      const u = await createUser(auth, {usersCollection, seedCollection});
      users.push(u);
    }
    response.send(users);
  } else {
    response.send({error: "invalid count"});
  }
});

app.get("/fake-items/:count", async (request, response) => {
  const count = parseInt(request.params.count);
  const items: IItem[] = [];
  if (count >= 1) {
    for (let index = 0; index < count; index++) {
      const u = await createItem({itemsCollection, seedCollection});
      items.push(u);
    }
    response.send(items);
  } else {
    response.send({error: "invalid count"});
  }
});

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
