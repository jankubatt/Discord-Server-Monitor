require('dotenv').config()
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const server = require('http').createServer(app);

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());

const general = require('./api/general')
app.use('/api/general', general)

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});

// app.use(express.static(path.join(__dirname, 'build')));

// app.get('*', (req, res) => {
// 	res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });
