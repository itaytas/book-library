import { NextFunction, Response } from 'express'
import { StatusCodes, ReasonPhrases } from 'http-status-codes'
import { IContextRequest, IUserRequest } from '../contracts/request'
import { UserRole } from '../contracts/user'

export const roleGuard = {
  hasRole: (requiredRole: UserRole) => {
    return (
      { context: { user, accessToken } }: IContextRequest<IUserRequest>, 
      res: Response,
      next: NextFunction
    ) => {
      
      if (!user || !accessToken) { 
        res.status(StatusCodes.UNAUTHORIZED).json({
          message: ReasonPhrases.UNAUTHORIZED,
          status: StatusCodes.UNAUTHORIZED,
        })
        return;
      }

      if (user.role === requiredRole) {
        return next() 
      }

      res.status(StatusCodes.FORBIDDEN).json({
        message: ReasonPhrases.FORBIDDEN,
        status: StatusCodes.FORBIDDEN,
      })
    }
  },

  isCustomer: (
    req: IContextRequest<IUserRequest>, 
    res: Response,
    next: NextFunction
  ) => {
    return roleGuard.hasRole(UserRole.CUSTOMER)(req, res, next) 
  },

  isEmployee: (
    req: IContextRequest<IUserRequest>, 
    res: Response,
    next: NextFunction
  ) => {
    return roleGuard.hasRole(UserRole.EMPLOYEE)(req, res, next) 
  },
}
