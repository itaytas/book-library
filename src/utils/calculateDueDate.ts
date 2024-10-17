import { LoanDueDate } from "../constants";

export const calculateDueDate = (rating: number): Date => {
    const currentDate = new Date();
    let days = 0;

    switch (rating) {
      case 5:
        days = LoanDueDate.Rating5;
        break;
      case 4:
        days = LoanDueDate.Rating4;
        break;
      default:
        days = LoanDueDate.DefaultRating;
        break;
    }

    currentDate.setDate(currentDate.getDate() + days);
    return currentDate;
  }