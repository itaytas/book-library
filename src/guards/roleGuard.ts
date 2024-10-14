import { NextFunction, Response } from 'express'
import { StatusCodes, ReasonPhrases } from 'http-status-codes'
import { IContextRequest, IUserRequest } from '../contracts/request'
import { UserRole } from '../contracts/user' // Assuming UserRole is defined in your user model

// The roleGuard middleware will provide functions to check user roles
export const roleGuard = {
  // Check if the user has a specific role
  hasRole: (requiredRole: UserRole) => {
    return (
      { context: { user, accessToken } }: IContextRequest<IUserRequest>, // Destructure accessToken as well
      res: Response,
      next: NextFunction
    ) => {
      // Check if the user is authenticated
      if (!user || !accessToken) { // Ensure user and accessToken are present
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: ReasonPhrases.UNAUTHORIZED,
          status: StatusCodes.UNAUTHORIZED,
        })
      }

      // Check if the user's role matches the required role
      if (user.role === requiredRole) {
        return next() 
      }

      // If the user does not have the required role, respond with a forbidden status
      return res.status(StatusCodes.FORBIDDEN).json({
        message: ReasonPhrases.FORBIDDEN,
        status: StatusCodes.FORBIDDEN,
      })
    }
  },

  // Check if the user is a Customer
  isCustomer: (
    req: IContextRequest<IUserRequest>, // Accept the request object
    res: Response,
    next: NextFunction
  ) => {
    return roleGuard.hasRole(UserRole.CUSTOMER)(req, res, next) 
  },

  // Check if the user is an Employee
  isEmployee: (
    req: IContextRequest<IUserRequest>, // Accept the request object
    res: Response,
    next: NextFunction
  ) => {
    return roleGuard.hasRole(UserRole.EMPLOYEE)(req, res, next) 
  },
}
