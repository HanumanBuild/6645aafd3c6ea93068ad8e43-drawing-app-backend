const express = require('express');
const router = express.Router();
const Drawing = require('../models/Drawing');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) {
    return res.status(401).send('Access Denied');
  }
  try {
    const verified = jwt.verify(token, 'your_jwt_secret');
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send('Invalid Token');
  }
};

// Create a new drawing
router.post('/', verifyToken, async (req, res) => {
  try {
    const drawing = new Drawing({
      userId: req.user.id,
      title: req.body.title,
      data: req.body.data
    });
    await drawing.save();
    res.status(201).send(drawing);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Get all drawings for a user
router.get('/', verifyToken, async (req, res) => {
  try {
    const drawings = await Drawing.find({ userId: req.user.id });
    res.status(200).send(drawings);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Get a specific drawing
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const drawing = await Drawing.findOne({ _id: req.params.id, userId: req.user.id });
    if (!drawing) {
      return res.status(404).send('Drawing not found');
    }
    res.status(200).send(drawing);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Update a drawing
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const drawing = await Drawing.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title: req.body.title, data: req.body.data },
      { new: true }
    );
    if (!drawing) {
      return res.status(404).send('Drawing not found');
    }
    res.status(200).send(drawing);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Delete a drawing
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const drawing = await Drawing.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!drawing) {
      return res.status(404).send('Drawing not found');
    }
    res.status(200).send('Drawing deleted');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
