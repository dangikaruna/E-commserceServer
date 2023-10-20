// config.js

const mysql = require('mysql');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Bulbul@23',
  database: 'E-commerce',
};

const connection = mysql.createConnection(dbConfig);

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ', err);
    return;
  }
  console.log('Connected to the database');
});
module.exports = connection;