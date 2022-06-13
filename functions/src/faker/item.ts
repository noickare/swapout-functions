/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import {faker} from "@faker-js/faker";
import * as admin from "firebase-admin";
import {IItem, itemCondition} from "../models/item.";

function getRandomEnumValue<T>(anEnum: T): T[keyof T] {
  // save enums inside array
  const enumValues = Object.keys(anEnum) as Array<keyof T>;

  // Generate a random index (max is array length)
  const randomIndex = Math.floor(Math.random() * enumValues.length);
  // get the random enum value

  const randomEnumKey = enumValues[randomIndex];
  return anEnum[randomEnumKey];
  // if you want to have the key than return randomEnumKey
}

interface ICollections {
    itemsCollection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
    seedCollection: admin.firestore.CollectionReference<admin.firestore.DocumentData>
}

export async function createItem(collections: ICollections) {
  try {
    const users: any[] = [];
    const usersShot = await collections.seedCollection.get();

    usersShot.forEach((us) => {
      const userId = us.id;
      users.push({uid: userId, ...us.data()});
    });
    const owner = users[Math.floor(Math.random()*users.length)];
    const itemId = faker.datatype.uuid();
    const images: string[] = [];
    for (let index = 0; index < 5; index++) {
      images.push(faker.image.imageUrl());
    }

    const item: IItem = {
      uid: itemId,
      name: faker.commerce.productName(),
      location: {
        lat: parseFloat(faker.address.latitude()),
        lng: parseFloat(faker.address.longitude()),
        address: faker.address.streetAddress(),
      },
      description: faker.commerce.productDescription(),
      condition: getRandomEnumValue(itemCondition),
      yearManufactured: Math.floor(Math.random() * 16) + 2015,
      yearBought: Math.floor(Math.random() * 16) + 2025,
      itemToExchangeWith: faker.commerce.productName(),
      ownerId: owner.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      images: images,
    };
    await collections.itemsCollection.doc(itemId).set(item);
    return item;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
}
