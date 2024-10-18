# Library Management System API

This README provides an overview of the Library Management System API, including information about users, books, and authentication routes.

## Running Instructions

### Using Docker

To run the application using Docker, follow these steps:

1. Install Docker:
   - For Windows and Mac: Download and install Docker Desktop from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
   - For Linux: Follow the instructions for your specific distribution at [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)

2. Install MongoDB Compass (GUI for MongoDB):
   - Download and install from [https://www.mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)

3. Install RedisInsight (GUI for Redis):
   - Download and install from [https://redis.com/redis-enterprise/redis-insight/](https://redis.com/redis-enterprise/redis-insight/)

4. Clone the repository and navigate to the project directory.

5. Run the following command to build and start the containers:

```sh 
docker-compose up --build
```
This command does the following:
- Builds the Docker images defined in the `docker-compose.yml` file
- Creates and starts containers for the application, MongoDB, and Redis
- Sets up the necessary network connections between containers
- Mounts volumes for persistent data storage

The application should now be running and accessible at `http://localhost:8000`.


### Running Tests

To run the tests for the application, use the following command:

```sh 
npm test
```

Make sure you have all the necessary dependencies installed by running `npm install` before running the tests.


## Existing Data

The system is pre-populated with some default data to facilitate testing and development.

### Users

The system has four default users:

1. Customer One
   - Email: customer1@example.com 
   - Password: customer123
   - Role: customer

2. Customer Two
   - Email: customer2@example.com
   - Password: customer123
   - Role: customer

3. Employee One
   - Email: employee1@example.com
   - Password: employee123
   - Role: employee

4. Employee Two
   - Email: employee2@example.com
   - Password: employee123
   - Role: employee

All users have their passwords hashed and stored securely in the database.

### Books

The system is initialized with four books:

1. The Great Gatsby
   - Author: F. Scott Fitzgerald
   - Genre: Fiction
   - Rating: 5
   - Total Copies: 5
   - Available Copies: 5

2. 1984
   - Author: George Orwell
   - Genre: Dystopian
   - Rating: 4
   - Total Copies: 3
   - Available Copies: 3

3. To Kill a Mockingbird
   - Author: Harper Lee
   - Genre: Fiction
   - Rating: 5
   - Total Copies: 4
   - Available Copies: 4

4. Moby Dick
   - Author: Herman Melville
   - Genre: Adventure
   - Rating: 3
   - Total Copies: 2
   - Available Copies: 2

These books are available for loan operations within the system.

# Authentication API

## Routes

### Sign In

**POST** `/api/auth/sign-in`

- **Description**: Authenticates a user with their email and password.
- **Request Body**: 
  ```json
  {
    "email": "user@example.com",
    "password": "userPassword"
  }
- **Response**:
    - 200 OK: Returns an access token.
    ```json
  {
      "data": {
        "accessToken": "yourAccessToken"
      },
      "message": "OK",
      "status": 200
  } 
  ```
    - 404 Not Found: If the user is not found or the password is incorrect.
    ```json
  {
    "message": "Not Found",
    "status": 404
  }
    ```
    - 400 Bad Request: If there is an error during the request
    ```json
  {
    "message": "Bad Request",
    "status": 400 
  }
  ```

### Sign Out

**GET** `/api/auth/sign-out`

- **Description**: Logs out a user and invalidates their access token.
- **Response**:
    - 200 OK: Returns an access token.
    ```json
    {
        "message": "OK",
        "status": 200
    }
    ```
    - 404 Not Found: If there is an error during the request
    ```json
  {
        "message": "Bad Request",
        "status": 400
  }
    ```

# Books API

## Routes

### View All Books

**GET** `/api/books`

- **Description**: Retrieves a list of all books with availability details for customers and complete details for employees.
- **Query Parameters**:
  - `page` (optional): The page number of the results (default is 1).
  - `limit` (optional): The number of results per page (default is 10).
- **Response**:
  - **200 OK**: Successfully retrieved the list of books.
    ```json
    {
      "data": [
        {
          // Book details or availability information
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalBooks": 50,
        "limit": 10
      },
      "message": "Books retrieved successfully",
      "status": 200
    }
    ```
  - **500 Internal Server Error**: If there is an error during the request.
    ```json
    {
      "message": "An error occurred",
      "status": 500
    }
    ```

### View Book Details

**GET** `/api/books/:id`

- **Description**: Retrieves detailed information about a specific book.
- **Path Parameters**:
  - `id`: The ID of the book.
- **Response**:
  - **200 OK**: Successfully retrieved the book details.
    ```json
    {
      // Book details or availability information
    }
    ```
  - **404 Not Found**: If the book is not found or the ID is invalid.
    ```json
    {
      "message": "Book not found",
      "status": 404
    }
    ```
  - **500 Internal Server Error**: If there is an error during the request.
    ```json
    {
      "message": "An error occurred",
      "status": 500
    }
    ```

### Edit Book Details

**PUT** `/api/books/:id`

- **Description**: Updates the details of a specific book (accessible only to employees).
- **Path Parameters**:
  - `id`: The ID of the book.
- **Request Body**:
  ```json
  {
    "title": "New Book Title",
    "author": "New Author Name",
    "genre": "Fiction",
    "rating": 4.5,
    "availableCopies": 5
  }
  - **Response**:
  - **200 OK**: Successfully updated the book details
    ```json
    {
        "data": {
            "id": "bookId",
            "title": "New Book Title",
            "author": "New Author Name",
            "genre": "Fiction",
            "rating": 4.5,
            "availableCopies": 5
    },
        "message": "Book updated successfully",
        "status": 200
    }
    ```
  - **404 Not Found**: If the book is not found or the ID is invalid.
    ```json
    {
      "message": "Book not found",
      "status": 404
    }
    ```
  - **500 Internal Server Error**: If there is an error during the request.
    ```json
    {
      "message": "An error occurred",
      "status": 500
    }
    ```
### Delete Book

**DELETE** `/api/books/:id`

- **Description**: Deletes a specific book (accessible only to employees).
- **Path Parameters**:
  - `id`: The ID of the book to be deleted.
- **Response**:
  - **204 No Content**: Successfully deleted the book.
  - **404 Not Found**: If the book is not found.
    ```json
    {
      "message": "Book not found",
      "status": 404
    }
    ```
  - **409 Conflict**: If the book is currently loaned and cannot be deleted.
    ```json
    {
      "message": "Cannot delete loaned book",
      "status": 409
    }
    ```
  - **400 Bad Request**: If the book ID is invalid.
    ```json
    {
      "message": "Invalid book ID",
      "status": 400
    }
    ```
  - **500 Internal Server Error**: If there is an error during the request.
    ```json
    {
      "message": "An error occurred",
      "status": 500
    }
    ```



# Loan API

## Routes
### Loan Book

**POST** `/api/loans/loan`

- **Description**: Allows a customer to loan a book.
- **Request Body**:
  ```json
  {
    "bookId": "theBookId"
  }
  ```
- **Response**:
  - **200 OK**: Successfully loaned the book.
    ```json
    {
      "data": {
        "loanId": "theLoanId",
        "user": "userId",
        "bookId": "theBookId",
        "returned": false
      },
      "message": "Book loaned successfully",
      "status": 200
    }
    ```
  - **400 Bad Request**: If there is an error during the request, such as attempting to loan a book that is already loaned or does not exist.
    ```json
    {
      "message": "An error occurred",
      "status": 400
    }
    ```

### Return Book

**POST** `/api/loans/return`

- **Description**: Allows a customer to return a loaned book.
- **Request Body**:
  ```json
  {
    "loanId": "theLoanId"
  }
  ```
- **Response**:
  - **200 OK**: Successfully returned the book.
    ```json
    {
      "data": {
        "loanId": "theLoanId",
        "user": "userId",
        "returned": true
      },
      "message": "Book returned successfully",
      "status": 200
    }
    ```
  - **400 Bad Request**: If there is an error during the request, such as if the loan ID does not exist.
    ```json
    {
      "message": "An error occurred",
      "status": 400
    }
    ```

### View My Loans

**GET** `/api/loans/my`

- **Description**: Allows customers to view only their loaned books.
- **Response**:
  - **200 OK**: Successfully retrieved loaned books.
    ```json
    [
      {
        "loanId": "theLoanId1",
        "user": "userId",
        "bookId": "theBookId1",
        "returned": false
      },
      {
        "loanId": "theLoanId2",
        "user": "userId",
        "bookId": "theBookId2",
        "returned": true
      }
    ]
    ```
  - **500 Internal Server Error**: If there is an error during the request.
    ```json
    {
      "message": "An error occurred",
      "status": 500
    }
    ```

### View All Loans

**GET** `/api/loans`

- **Description**: Allows employees to view all loaned books.
- **Response**:
  - **200 OK**: Successfully retrieved all loans.
    ```json
    [
      {
        "loanId": "theLoanId1",
        "user": "userId1",
        "bookId": "theBookId1",
        "returned": false
      },
      {
        "loanId": "theLoanId2",
        "user": "userId2",
        "bookId": "theBookId2",
        "returned": true
      }
    ]
    ```
  - **500 Internal Server Error**: If there is an error during the request.
    ```json
    {
      "message": "An error occurred",
      "status": 500
    }
    ```
