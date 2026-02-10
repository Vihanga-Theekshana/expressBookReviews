const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");



public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;


  // Check if both username and password are provided
  if (username && password) {
      // Check if the user does not already exist
      if (!isValid(username)) {
          // Add the new user to the users array
          users.push({"username": username, "password": password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(404).json({message: "User already exists!"});
      }
  }
  // Return error if username or password is missing
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.send(JSON.stringify(books,null,4));
});

public_users.get('/async/books',async(req,res)=>{
    try{
        const response = await axios.get("http://localhost:5000/");
        return res.status(200).json(response.data);
    }catch(err){
        return res.status(500).json({ message: "Error fetching books" });

    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
      return res.status(200).json(book);
    }
    return res.status(404).json({ message: "Book not found" });
 });

 public_users.get('/async/isbn/:isbn',async(req,res)=>{
    try{
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        return res.status(200).json(response.data);

    }catch(err){
        return res.status(404).json({ message: "Book not found" });
    }
 })
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;
  const result = Object.values(books).filter((b) => b.author === author);

  if (result.length > 0) {
    return res.status(200).json(result);
  }
  return res.status(404).json({ message: "Book not found" });

});

public_users.get("/promise/author/:author",async(req,res)=>{
    const author = req.params.author;

    try{
        const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
          return res.status(200).json(response.data);
    }catch(err){
        return res.status(404).json({ message: "Book not found" });
    }

})

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;
  const result = Object.values(books).filter((b) => b.title === title);

  if (result.length > 0) {
    return res.status(200).json(result);
  }
  return res.status(404).json({ message: "Book not found" });
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  }
  return res.status(404).json({ message: "book not found" });

});

module.exports.general = public_users;
