import {firestore} from "firebase-admin";
import {ILocation} from "./location";

export interface IItem {
    uid: string;
    name: string;
    location: ILocation;
    description: string;
    condition: itemCondition;
    yearManufactured: number;
    yearBought: number;
    images?: string[];
    itemToExchangeWith: string;
    ownerId: string;
    createdAt: firestore.FieldValue
}

export enum itemCondition {
    Used,
    New,
    Refurbished
}
