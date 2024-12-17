require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static(`${process.cwd()}/public`));

// Servire la pagina principale
app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/views/index.html');
});

// Database in-memory per la mappatura degli URL
let urlDatabase = [];
let idCounter = 1;

// Validazione URL
function isValidURL(url, callback) {
    const hostname = new URL(url).hostname;
    dns.lookup(hostname, (err) => callback(!err));
}

// API per accorciare l'URL
app.post('/api/shorturl', (req, res) => {
    const {url} = req.body;

    // Verifica formato URL
    if (!/^https?:\/\//.test(url)) {
        return res.json({error: 'invalid url'});
    }

    isValidURL(url, (isValid) => {
        if (!isValid) {
            return res.json({error: 'invalid url'});
        }

        // Salva l'URL nel database
        const short_url = idCounter++;
        urlDatabase.push({original_url: url, short_url});
        res.json({original_url: url, short_url});
    });
});

// Reindirizzamento URL
app.get('/api/shorturl/:short_url', (req, res) => {
    const short_url = parseInt(req.params.short_url);
    const entry = urlDatabase.find(item => item.short_url === short_url);

    if (entry) {
        return res.redirect(entry.original_url);
    } else {
        return res.json({error: 'No short URL found for the given input'});
    }
});

// Avvio del server
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
