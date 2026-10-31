
const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const isValid = require('./auth_users.js').isValid;
const users = require('./auth_users.js').users;

const public_users = express.Router();

const API = 'https://openlibrary.org';

// Register user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  users.push({ username, password });
  return res.status(201).json({ message: 'User successfully registered' });
});

// Get all books using Axios
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${API}/subjects/fiction.json?limit=10`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books' });
  }
});

// Get book by ISBN using Axios
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const response = await axios.get(
      `${API}/isbn/${encodeURIComponent(req.params.isbn)}.json`
    );
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(error.response?.status || 500).json({
      message: 'Book not found'
    });
  }
});

// Get books by author using Axios
public_users.get('/author/:author', async (req, res) => {
  try {
    const response = await axios.get(
      `${API}/search.json?author=${encodeURIComponent(req.params.author)}`
    );
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books by author' });
  }
});

// Get books by title using Axios
public_users.get('/title/:title', async (req, res) => {
  try {
    const response = await axios.get(
      `${API}/search.json?title=${encodeURIComponent(req.params.title)}`
    );
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books by title' });
  }
});

// Get reviews from local book database
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }

  return res.status(404).json({ message: 'Book not found' });
});

module.exports.general = public_users;
