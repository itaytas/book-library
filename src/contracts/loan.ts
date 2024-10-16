import { Model, ObjectId } from 'mongoose';

export interface ILoan {
  id: ObjectId;
  user: ObjectId;
  book: ObjectId;
  dueDate: Date;
  returned: boolean;
}

export interface ILoanMethods {}

export type LoanModel = Model<ILoan, unknown, ILoanMethods>;

export interface LoanBookPayload {
  userId: ObjectId;
  bookId: ObjectId;
}

export interface ReturnBookPayload {
  loanId: ObjectId;
}