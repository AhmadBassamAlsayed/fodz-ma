const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/apple-app-site-association', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, '../../public/.well-known/apple-app-site-association'));
});

router.get('/assetlinks.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, '../../public/.well-known/assetlinks.json'));
});

module.exports = router;
