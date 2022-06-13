/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {faker} from "@faker-js/faker";
import {Auth} from "firebase-admin/lib/auth/auth";
import * as admin from "firebase-admin";
import {IUser} from "../models/user";

interface ICollections {
    usersCollection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
    seedCollection: admin.firestore.CollectionReference<admin.firestore.DocumentData>
}

export async function createUser(auth: Auth, collections: ICollections): Promise<IUser> {
  try {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const createdUser = await auth.createUser({
      email: email,
      emailVerified: false,
      password: password,
      displayName: faker.name.firstName() + faker.name.lastName(),
      photoURL: faker.image.avatar(),
      disabled: false,
    });

    const toUpdateUser: IUser = {
      uid: createdUser.uid,
      email: createdUser.email as string,
      name: createdUser.displayName as string,
      username: faker.internet.userName(),
      createdAt: createdUser.metadata.creationTime,
      lastLoginTime: createdUser.metadata.lastSignInTime,
      avatar: createdUser.photoURL,
      isEmailVerified: false,
    };
    setTimeout(async () => {
      await collections.usersCollection.doc(toUpdateUser.uid).set(toUpdateUser);
      await collections.seedCollection.doc(toUpdateUser.uid).set({
        email: toUpdateUser.email, password: password,
      }
      );
    }, 5000);
    return toUpdateUser;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
}
