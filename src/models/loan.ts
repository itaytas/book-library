import { Schema, model } from "mongoose";
import { ILoan, LoanModel } from "../contracts/loan";

const schema = new Schema<ILoan, LoanModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    dueDate: { type: Date, required: true },
    returned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

schema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};

export const Loan = model<ILoan, LoanModel>("Loan", schema);
