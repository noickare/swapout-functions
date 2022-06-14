/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import {faker} from "@faker-js/faker";
import * as admin from "firebase-admin";
import {IItem, itemCondition} from "../models/item.";

function getRandomEnumValue<T>(anEnum: T): string {
  const allValues = Object.keys(anEnum) as Array<keyof T>;

  const newArray = allValues.filter(function(value) {
    return Number.isNaN(parseInt(value.toString()));
  });
  const randomIndex = Math.floor(Math.random() * newArray.length);

  const randomEnumKey = newArray[randomIndex];
  return randomEnumKey.toString();
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
      const department = faker.commerce.department();
      images.push(`https://loremflickr.com/640/480/${department}`);
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
      condition: getRandomEnumValue(itemCondition) as unknown as itemCondition,
      yearManufactured: Math.floor(Math.random() * 16) + 2015,
      yearBought: Math.floor(Math.random() * 16) + 2025,
      itemToExchangeWith: faker.commerce.productName(),
      ownerId: owner.uid,
      createdAt: faker.date.recent(),
      images: images,
      category: faker.commerce.department(),
    };
    await collections.itemsCollection.doc(itemId).set(item);
    return item;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
}
