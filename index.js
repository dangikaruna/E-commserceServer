const express = require("express");
const cors = require("cors");
const mysql = require('mysql');
const app = express();
const Jwt = require('jsonwebtoken')
const jwtKey = 'e-comm'
const  path=require ('path')
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));
const db = require("./db/config");
const User = require("./db/User"); // Corrected to uppercase "User"
const Product = require("./db/Product");



app.post('/signup', (req, res) => {
  const { username, email, password } = req.body; // Assuming you expect 'username', 'email', and 'password' in the request body
  // Create a SQL INSERT query
  const insertSql = 'INSERT INTO user (username, email, password) VALUES (?, ?, ?)'; // Change 'users' to your table name
  // Execute the INSERT query with the provided data
  db.query(insertSql, [username, email, password], (err, result) => {
    if (err) {
      console.error('Error inserting data: ', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    console.log('Data inserted successfully');
    // Assuming that you have an AUTO_INCREMENT primary key in your 'user' table, you can fetch the user details using the last inserted ID.
    const lastInsertedId = result.insertId;
    console.log("Insert id",lastInsertedId);
    // Create a SQL SELECT query to fetch the user details
    const selectSql = 'SELECT * FROM user WHERE id = ?';
    // Execute the SELECT query to fetch the user details
    db.query(selectSql, [lastInsertedId], (selectErr, user) => {
      if (selectErr) {
        console.error('Error fetching user details: ', selectErr);
        res.status(500).json({ message: 'Internal server error' });
        return;
      }
      console.log('User details fetched successfully');
      const userObject = user[0];
      delete userObject.password;
      console.log("userobject",user[0]);
      Jwt.sign({ user }, jwtKey, { expiresIn: "1hr" }, (err, token) => {
        if (err) {
          console.error('Error signing JWT: ', err);
          return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(200).json({ userObject, auth: token });
      });
    });
  });
});



app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide both email and password" });
  }

  const sql = 'SELECT * FROM user WHERE email = ? AND password = ?';
  const values = [email, password];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error during login: ', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length === 1) {
      const user = { ...results[0] };
      delete user.password;
      console.log(user)
      Jwt.sign({ user }, jwtKey, { expiresIn: "1hr" }, (err, token) => {
        if (err) {
          console.error('Error signing JWT: ', err);
          return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(200).json({ user, auth: token });
      });

      // User found, remove password before sending the user object
    } else {
      res.status(404).json({ message: "No user found" });
    }
  });
});


app.post('/add-product', verifyToken, (req, res) => {

  const { userid, name, price, category, company } = req.body; // Assuming you expect 'name' and 'email' in the request body

  // Create a SQL INSERT query
  const sql = 'INSERT INTO products (userid, name , price, category, company) VALUES (?, ?, ?, ?, ?)'; // Change 'users' to your table name

  // Execute the query with the provided data
  db.query(sql, [userid, name, price, category, company], (err, result) => {
    if (err) {
      console.error('Error inserting data: ', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    console.log('Data inserted successfully');
    res.status(201).send(result)
  });
});

app.get('/products', verifyToken, (req, res) => {
  const sql = 'SELECT * FROM products';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error in fetching data: ', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    console.log('Data data fetched successfully');
    //console.log(result)
    res.status(201).send(result)
  });

})
app.delete('/product/:id', verifyToken, (req, res) => {
  const productId = req.params.id; // Get the product_id from the URL parameter

  const sql = 'DELETE FROM products WHERE product_id = ?'; // Corrected typo from 'Delect' to 'DELETE'

  db.query(sql, [productId], (err, result) => {
    if (err) {
      console.error('Error deleting data: ', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }

    if (result.affectedRows === 0) {
      // No rows were affected, meaning no product with the given ID was found
      res.status(404).json({ message: 'Product not found' });
    } else {
      console.log('Data deleted successfully');
      res.status(200).json({ message: 'Product deleted successfully' });
    }
  });
});

app.get('/product/:id', verifyToken, (req, res) => {
  const productId = req.params.id; // Get the product_id from the URL parameter


  const newData = req.body;

  const sql = 'SELECT * FROM products WHERE product_id = ?';

  db.query(sql, [productId], (err, result) => {
    if (err) {
      console.error('Error updating data: ', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }

    if (result.length === 0) {
      // No rows were affected, meaning no product with the given ID was found
      res.status(404).json({ message: 'Product not found' });
    } else {
      console.log('Data fetched successfully');
      res.status(201).send(result)
    }
  });
});
app.put('/updateProduct/:id', verifyToken, (req, res) => {
  const productId = req.params.id; // Get the product_id from the URL parameter

  const newData = req.body;

  // Ensure that you have a valid SQL update statement
  const sql = 'UPDATE products SET name = ?, price = ?, category = ?, company = ? WHERE product_id = ?';

  // Make sure to provide the appropriate values in the array for updating
  db.query(sql, [newData.name, newData.price, newData.category, newData.company, productId], (err, result) => {
    if (err) {
      console.error('Error updating data: ', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }

    if (result.affectedRows === 0) {
      // No rows were affected, meaning no product with the given ID was found
      res.status(404).json({ message: 'Product not found' });
    } else {
      console.log('Data updated successfully');
      res.status(200).json({ message: 'Product updated successfully' });
    }
  });
});


app.get('/search/:key', verifyToken, (req, res) => {
  const query = req.params.key; // Get the search query from the request URL parameter

  if (!query) {
    return res.status(400).json({ message: 'Query parameter "key" is required.' });
  }

  const sql = 'SELECT * FROM products WHERE name LIKE ?';
  const searchKey = `%${query}%`;

  db.query(sql, [searchKey], (err, result) => {
    if (err) {
      console.error('Error searching data: ', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }

    if (result.length === 0) {
      res.status(404).json({ message: 'No products found' });
    } else {
      console.log('Data searched successfully');
      res.status(200).json(result);
    }
  });
});

function verifyToken(req, res, next) {
  let token = req.headers['authorization']
  if (token) {
    token = token.split(' ')[1];
    Jwt.verify(token, jwtKey, (err, verify) => {
      if (err) {
        res.status(401).send("please send valid token.")
      }
      else {
        next();

      }

    })

  }
  else {
    res.status(403).send("please send token in header.")
  }
  //console.warn("middleware called", token)

}

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
