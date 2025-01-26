D-1
create a repositiory
Intialize the repositiory npm init -y
node_modules, package.json and package-losk.json
install express
create a srever
Listen to a port number like 3000
Write request handlers for /test and /hello
install nodemon update script inside package.json

D-2

Two type of export and import followed in Node js

1. Common js module :- module.exports
   Common js module :- require ()
   By defsult used in Node js
   Older way
   synchronously
2. ES module : - export keyword is used
   ES module : -import keyword is used
   BY deafault used in React js
   Newer way
   Async

 
 NOTES:how can setup mongodb in your project

 - go to mongodb website
 - create a Mo cluster
 - create a user
 - get connection string
- download mongodb compass
  Create a database
 INstall mongodb package
 Create a connection from code
 Documents CRUD - CReate, REad, Update, Delete

//Homework

Create a repository

Initialize the repository

node_modules, package.json, package-lock.json

Install express

Create a server

Listen to port 7777

Write request handlers for /test , /hello

Install nodemon and update scripts inside package.json

What are dependencies

What is the use of "-g" while npm install

Difference between caret and tilde ( ^ vs ~ )

initialize git

.gitignore

Create a remote repo on github

Push all code to remote origin

Play with routes and route extensions ex. /hello, / , hello/2, /xyz

Order of the routes matter a lot

Install Postman app and make a workspace/collectio > test API call

Write logic to handle GET, POST, PATCH, DELETE API Calls and test them on Postman

Explore routing and use of ?, + , (), * in the routes

Use of regex in routes /a/ , /.*fly$/

Reading the query params in the routes

Reading the dynamic routes

Create a free cluster on mongoDb official website (Mongo Atlas)

install mongoose library

connect your application to database - "connection-url"/devTinder 

call the ConnectDb function and connect to your database before your application is started on server 7777

Create a UserSchema and To use this schema in your application, you would require it and use it with mongoose.model()

create a post /signup api to add data to your database

Push some documents using api calls from postman 

Error handling with try and catch
JS object and json (difference)
add express.json middleware to your application 

Make your sign up api dynamic to recieve data from postman (request)

create get /feed api to get user information from database

find user from database by using email query 

find One user from database

find all users from database by passing empty {} query

find user by findByid me

findByIdAndUpdate

explore mongoose models and use them in your application

what are the option in model.findOneAndUpdate. Explore more about it 

api - update the user by email

Explore schematype from the documentation

add required, max, min, maxLength, minLength, trim, lowercase, 

add default
created custom validation function for gender 

Imporove the Db schema - Put all the appropriate validations on each field schema 

Add timStamp to the user schema 

Data sanitizing - Add Api validation for each field

install validator library 

-explore validator library and use validator function for password, photoUrl and email fields

-add findOne for checking if user email already exists then don't register

- Validate the Sign Up Api 
- install the bcrypt library
- encrypt the password and store user with encrypted password
- created login api 
- compare the password and throw error if email and password are invalid
- install cookie parser
- send a dummy cookie to the server 
- create a Get /profile api and check that if you get cookie back as req.cookie
- install jsonWebToken libarary and explore the library
- In login api, after email and password validation, create a JWT token and send it to the user cookie 
- read the cookie inside the user and find looged in user 
- userAuth middleware
- add userAuth middleware to /profile api and sedconnectionRequest api 
- set  the expiry jwt token and cookies to 7 Days
- created a UserSchema method for getJWT and validatePassword 
- Explore the Tinder Api
- create a list of api you think in tinder 
- group multiple routes with their related router
- Read documentation of express.router 
- create routes folder for managing  auth, profile,and request routers
- create authRouter, profileRouter and requestRouter 
- import router in app.js
