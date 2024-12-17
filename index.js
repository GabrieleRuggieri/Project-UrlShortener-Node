require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware per validare l'URL
function validateUrl(req, res, next) {
    const {url} = req.body;

    // Se l'URL è assente
    if (!url) {
        return res.json({error: 'invalid url'});
    }

    // Parse dell'URL
    const parsedUrl = urlParser.parse(url);
    if (!parsedUrl.protocol || !parsedUrl.hostname) {
        return res.json({error: 'invalid url'});
    }

    // Verifica se il dominio esiste
    dns.lookup(parsedUrl.hostname, (err) => {
        if (err) {
            return res.json({error: 'invalid url'});
        }
        req.validatedUrl = url; // Passa l'URL validato al prossimo middleware
        next();
    });
}

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
    res.json({greeting: 'hello API'});
});

// Endpoint per POST /api/shorturl
app.post('/api/shorturl', validateUrl, handleUrl, function (req, res) {
    // Risposta JSON con l'URL abbreviato
    res.json({
        original_url: req.shortUrlEntry.original_url,
        short_url: req.shortUrlEntry.short_url,
    });
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
