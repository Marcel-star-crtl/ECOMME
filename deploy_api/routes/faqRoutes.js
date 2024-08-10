const express = require('express');
const { 
    createFAQ, 
    getFAQs,
    getFAQ,
    updateFAQ,
    deleteFAQ
} = require('../controller/faqController');
const router = express.Router();

router.post('/', createFAQ);
router.get('/', getFAQs);
router.get('/:id', getFAQ);
router.put('/:id', updateFAQ);
router.delete('/:id', deleteFAQ);

module.exports = router;
