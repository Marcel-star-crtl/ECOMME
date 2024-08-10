const FAQ = require('../models/faqModel');
const asyncHandler = require('express-async-handler');

// Create a new FAQ
const createFAQ = asyncHandler(async (req, res) => {
  const { question, answer } = req.body;
  const newFAQ = await FAQ.create({ question, answer });
  res.status(201).json(newFAQ);
});

// Get all FAQs
const getFAQs = asyncHandler(async (req, res) => {
  const faqs = await FAQ.find();
  res.json(faqs);
});

// Get a single FAQ
const getFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);
  if (faq) {
    res.json(faq);
  } else {
    res.status(404);
    throw new Error('FAQ not found');
  }
});

// Update an FAQ
const updateFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);
  if (faq) {
    faq.question = req.body.question || faq.question;
    faq.answer = req.body.answer || faq.answer;
    const updatedFAQ = await faq.save();
    res.json(updatedFAQ);
  } else {
    res.status(404);
    throw new Error('FAQ not found');
  }
});

// Delete an FAQ
const deleteFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);
  if (faq) {
    await faq.remove();
    res.json({ message: 'FAQ removed' });
  } else {
    res.status(404);
    throw new Error('FAQ not found');
  }
});

module.exports = { createFAQ, getFAQs, getFAQ, updateFAQ, deleteFAQ };
