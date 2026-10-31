
const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    user => user.username === username && user.password === password
  );
};

// Login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: "Invalid username or password"
    });
  }

  const token = jwt.sign({ username }, "access", { expiresIn: "1h" });

  return res.status(200).json({
    message: "User successfully logged in",
    token: token
  });
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;
  const review = req.body.review;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (typeof review !== "string" || !review.trim()) {
    return res.status(400).json({ message: "Please provide a review" });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added or updated successfully",
    reviews: books[isbn].reviews
  });
});

// Delete the logged-in user's book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!Object.prototype.hasOwnProperty.call(books[isbn].reviews, username)) {
    return res.status(404).json({
      message: "No review found for this user"
    });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
