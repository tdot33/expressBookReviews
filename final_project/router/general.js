const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if(username && password) {
      if(!isValid(username)) {
          users.push({"username":username,"password":password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(404).json({message: "User already exists!"});
      }
  }
  return res.status(300).json({message: "Must provide username and password."});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const books = await getBooks();
        res.send(JSON.stringify(books, null, 4));
    } catch (err) {
        res.status(500).json({message: "Error retrieving books."});
    }
});

function getBooks() {
    return new Promise((resolve, reject) => {

        if (books) {
            resolve(books);
        } else {
            reject("Error retrieving books");
        }
    });
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = parseInt(req.params.isbn);

  findBookByISBN(isbn, (err, foundBook) => {
      if (err) {
          return res.status(500).json({message: "Error finding book."});
      }

      if (foundBook) {
          res.send(JSON.stringify(foundBook));
      } else {
          res.status(404).json({message: "Couldn't find book."});
      }
  });
});

function findBookByISBN(isbn, callback) {
    const bookKeys = Object.keys(books);
    for (const key of bookKeys) {
        const book = books[key];
        if (parseInt(key) === isbn) {
            return callback(null, book);
        }
    }

    callback(null,null);
}
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author.toLowerCase();

    try {
        const foundBook = await findBookByAuthor(author);

        if (foundBook) {
            res.send(JSON.stringify(foundBook));
        } else {
            res.status(404).json({message: "Book not foundeth"});
        }
    } catch (err) {
        res.status(500).json({message: "Error retrieving book."});
    }
});

function findBookByAuthor(author) {
    return new Promise((resolve, reject) => {
        const bookKeys = Object.keys(books);
        for (const key of bookKeys) {
            const book = books[key];
            const bookAuthor = book.author.toLowerCase();
            if (bookAuthor.includes(author)) {
                return resolve(book);
            }
        }
    
    resolve(null);
    });
}

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title.toLowerCase();

    try {
        const foundBook = await findBookByTitle(title);

        if (foundBook) {
            res.send(JSON.stringify(foundBook));
        } else {
            res.status(404).json({message: "Can't find it, chief."});
        }
    } catch (err) {
        res.status(500).json({message: "Sorry, having trouble finding your book."});
    }
});

function findBookByTitle(title) {
    return new Promise((resolve, reject) => {    
    const bookKeys = Object.keys(books);
    for (const key of bookKeys) {
        const book = books[key];
        const bookTitle = book.title.toLowerCase();
        if (bookTitle.includes(title)) {
            return resolve(book);
        }
    }

    resolve(null);
})};

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = parseInt(req.params.isbn);
    if((isbn-1) > Object.keys(books).length) {
        res.status(404).json({message: "Not a valid number"});
    } else {
    res.send(books[isbn].reviews)
    }
  });

module.exports.general = public_users;
