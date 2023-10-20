const connection = require('./config'); // Import the connection object from config.js

const createUserTable = `
  CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

connection.query(createUserTable, (err, results) => {
  if (err) {
    console.error('Error creating the user table: ', err);
    return;
  }
  console.log('user table created successfully');
});

module.exports= createUserTable;
