import { Model, Types } from 'mongoose';

export interface ILoan {
  id: Types.ObjectId;
  user: Types.ObjectId;
  book: Types.ObjectId;
  dueDate: Date;
  returned: boolean;
}

export interface ILoanMethods {}

export type LoanModel = Model<ILoan, unknown, ILoanMethods>;

export interface LoanBookPayload {
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
}

export interface ReturnBookPayload {
  loanId: Types.ObjectId;
}