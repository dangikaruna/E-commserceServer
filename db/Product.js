const connection = require('./config'); // Import the connection object from config.js

const createUserTable = `
  CREATE TABLE IF NOT EXISTS products (
    product_id Int AUTO_INCREMENT UNIQUE NOT NULL,
    userid INT ,
    name VARCHAR(255) NOT NULL,
    price INT,
    category VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL
    
  )
`;

connection.query(createUserTable, (err, results) => {
  if (err) {
    console.error('Error creating the products table: ', err);
    return;
  }
  console.log('Products table created successfully');
});

module.exports= createUserTable;
