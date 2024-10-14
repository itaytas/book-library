import { Request } from 'express'
import { ParamsDictionary } from 'express-serve-static-core' // Provides types for URL parameters in Express routes
import { Document } from 'mongoose' // Mongoose's Document interface to handle MongoDB documents

import { IUser } from './user' // The IUser interface defines the structure of the user object in your app

// IContextRequest defines a custom type that extends Express's Request object.
// It omits the default 'context' property (if any) and replaces it with a generic 'context' property.
// This allows adding a specific context type to the request, such as user information or tokens.
export interface IContextRequest<T> extends Omit<Request, 'context'> {
  context: T // 'T' is a generic type representing the type of the context (e.g., user data, token).
}

// IBodyRequest defines a custom type that extends Express's Request object.
// It omits the 'body' property (which holds the HTTP request body) and replaces it with a generic type 'T'.
// This allows you to strongly type the request body based on the needs of your application.
export interface IBodyRequest<T> extends Omit<Request, 'body'> {
  body: T // 'T' represents the type of the request body (e.g., a data payload).
}

// IParamsRequest extends the Express Request object but ensures that 'params' (URL route parameters) 
// are typed with a generic 'T' and 'ParamsDictionary', which is a type provided by Express for URL parameters.
export interface IParamsRequest<T> extends Request {
  params: T & ParamsDictionary // 'T' can be any custom type, and it's combined with Express's ParamsDictionary.
}

// IQueryRequest extends the Request object but ensures that the 'query' (URL query parameters) 
// are typed with a generic 'T', which is combined with ParamsDictionary.
export interface IQueryRequest<T> extends Request {
  query: T & ParamsDictionary // 'T' can be any custom type for query parameters, with support for standard URL params.
}

// ICombinedRequest is a utility type that combines context, body, params, and query into a single request type.
// It uses TypeScript's 'Pick' utility to select the 'context', 'body', 'params', and 'query' from the above interfaces.
// You can customize this type to create requests that handle all these aspects simultaneously.
export interface ICombinedRequest<
  Context, // Type for the context (e.g., user information)
  Body,    // Type for the request body (e.g., form data)
  Params = Record<string, unknown>, // Default type for URL route parameters (optional)
  Query = Record<string, unknown>   // Default type for query parameters (optional)
> extends Pick<IContextRequest<Context>, 'context'>, // Picks the 'context' property from IContextRequest
    Pick<IBodyRequest<Body>, 'body'>,               // Picks the 'body' property from IBodyRequest
    Pick<IParamsRequest<Params>, 'params'>,         // Picks the 'params' property from IParamsRequest
    Pick<IQueryRequest<Query>, 'query'> {}          // Picks the 'query' property from IQueryRequest

// IUserRequest defines a user-specific request type.
// It includes a 'user' object, which combines the IUser interface (representing user properties) 
// and the Mongoose Document type, as well as an 'accessToken' string for authentication.
export interface IUserRequest {
  user: Omit<IUser, 'id'> & Document // The user object excludes 'id' and includes Mongoose's Document interface
  accessToken: string // The accessToken is a string used for authentication purposes
}
