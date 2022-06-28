import {firestore} from "firebase-admin";
import {ILocation} from "./location";
export interface IUser {
    uid: string;
    email: string;
    name: string;
    username: string;
    avatar?: string;
    bio?: string;
    createdAt: string;
    updatedAt?: firestore.FieldValue | Date;
    lastLoginTime: string;
    isEmailVerified: boolean;
    location?: ILocation;
    fcmToken?: string;
}
