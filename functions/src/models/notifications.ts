import {firestore} from "firebase-admin";

export interface INotification {
    uid: string;
    content: string;
    seen: boolean;
    deepLink: string;
    createdAt: firestore.FieldValue | Date;
}
