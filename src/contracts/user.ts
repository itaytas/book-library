import { Model, ObjectId } from 'mongoose'


export enum UserRole {
    CUSTOMER = 'customer',
    EMPLOYEE = 'employee'
  }

export interface IUser {
  id: ObjectId
  email: string
  password: string
  role: UserRole
  firstName?: string
  lastName?: string
}

export interface IUserMethods {
  comparePassword: (password: string) => boolean
}

export type UserModel = Model<IUser, unknown, IUserMethods>

export type UpdateProfilePayload = Required<
  Pick<IUser, 'firstName' | 'lastName'>
>

export type UpdateEmailPayload = Pick<IUser, 'email' | 'password'>

export interface UpdatePasswordPayload {
  oldPassword: string
  newPassword: string
}

export interface DeleteProfilePayload {
  password: string
}
