const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
    let usersWithSameName = users.filter((user)=>{
        return user.username === username
    });
    if(usersWithSameName > 0){
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ 
    let validUsers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });
    if(validUsers.length > 0){
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username
  const password = req.body.password

  if(!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }
  if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
          data: password
      }, 'access', { expiresIn: 60 * 60 });
      
      req.session.authorization = {
          accessToken,username
  }
  return res.status(200).send("Successfully logged in");
} else {
    return res.status(208).json({message: "Invalid login. Check username and password"});
}});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const token = req.session.authorization.accessToken;
    const username = req.session.authorization.username;
    const review = req.query.review;
  
    let book = books[isbn];
    if (book) {
      if (book.reviews[username]) {
        book.reviews[username] = review;
        res.send(`${username}'s review updated for ISBN ${isbn}.`);
      } else {
        book.reviews[username] = review;
        res.send(`${username}'s review added for ISBN ${isbn}.`);
      }
    } else {
      res.status(404).json({ message: "Book not found." });
    }
  });

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    let book = books[isbn];

    if (book && book.reviews[username]) {
        book.reviews = Object.fromEntries(
            Object.entries(book.reviews).filter(([key]) => key !== username)
          );
          res.send(`Reviews for ${book.title} deleted.`);
        } else {
          res.status(404).json({ message: "Book or review not found." });
        }
      });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
