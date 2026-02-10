const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
});
// Return true if any valid user is found, otherwise false
if (validusers.length > 0) {
    return true;
} else {
    return false;
}
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60});

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;                        // get ISBN
  const review = req.query.review;                    // get review from query
  const username = req.session.authorization.username; // get logged-in username

  // If review not provided
  if (!review) {
    return res.status(400).json({
      message: "Please add a review using ?review=YourReview"
    });
  }

  // Get the book
  let book = books[isbn];

  // If book does not exist
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Make sure reviews object exists
  if (!book.reviews) {
    book.reviews = {};
  }

  // Add or update review
  book.reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated",
    reviews: book.reviews
  });

});

regd_users.delete("/auth/review/:isbn", (req, res) => {
const isbn = req.params.isbn;
const username = req.session.authorization.username;
let book = books[isbn];
if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!book.reviews) {
    return res.status(404).json({ message: "No reviews for this book" });
  }
  if (!book.reviews[username]) {
    return res.status(400).json({ message: "You have not posted any review to delete" });
  }


  delete book.reviews[username];
  return res.status(200).json({ message: "Review deleted", reviews: book.reviews });


});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
