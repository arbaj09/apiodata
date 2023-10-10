
const { MongoClient } = require("mongodb");
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port =  process.env.PORT ||3001; // Choose a port for your API

// Middleware setup
app.use(express.json());
app.use(cors());

const db='mongodb+srv://shaikharbaj092:bELbjQIlk5bPxKU1@cluster0.wr4ujrv.mongodb.net/properties?'

// MongoDB connection 
mongoose.connect(db,{ useNewUrlParser: true,
  useUnifiedTopology: true,}).then(()=>{
  console.log("Connection Succesfull")
}).catch((err)=>{
  console.log("No conection Failed to conecting......." ,err)

})

// Define the property schema and model
const propertySchema = new mongoose.Schema({
  title: String,
  location: String,
  availableFromDate: Date,
  price: Number,
  propertyType: String,
});


const Property = mongoose.model('Property', propertySchema);


// Define API routes

// Create a new property listing
app.post('/api/property', (req, res) => {
  const newProperty = req.body;

  Property.create(newProperty)
  .then((property) => {
    res.status(201).json(property);

  })
  .catch((err) => {
    console.error('Error creating property listing:', err);
    res.status(500).json({ error: 'Error creating property listing' });
  });})

// Get all property listings
app.get('/api/list-properties', async (req, res) => {
  try {
    const properties = await Property.find({}).exec();
    res.send(properties)
   
  } catch (error) {
    console.error('Error fetching property listings:', error);
   
  }
});



// Update a property listing by ID
app.put('/api/property/:id', (req, res) => {
  const propertyId = req.params.id;
  const updatedProperty = req.body;
  Property.findByIdAndUpdate(propertyId, updatedProperty, { new: true }, (err, property) => {
    if (err) {
      return res.status(500).json({ error: 'Error updating property listing' });
    }
    res.json(property);
  });
});

// Delete a property listing by ID
app.delete('/api/property/:id', async(req, res) => {
  const propertyId = req.params.id;
  try {
    const deletedProperty = await Property.findByIdAndRemove(propertyId).exec();
    console.log( 'propety ID',deletedProperty)

    if (!deletedProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }


    res.json(deletedProperty);
  } catch (error) {
    console.error('Error deleting property listing:', error);
    res.status(500).json({ error: 'Error deleting property listing' });
  }
});
// //filter propert
app.get('/api/filter-properties', async (req, res) => {
  try {
    // Extract filter criteria from query parameters
    const { location, availableFromDate, price, propertyType } = req.query;
    console.log("query perameter",req.query)
 

    // Build the filter object based on the received query parameters
    const filters = {};

    if (location) {
      filters.location = location;
    }

    if (availableFromDate) {
      filters.availableFromDate = { $gte: new Date(availableFromDate).toISOString };
    }

    if (price) {
      filters.price = price
    }

    if (propertyType) {
      filters.propertyType = propertyType;
    }


    // Use the filter object to query the database and retrieve filtered properties
    const filteredProperties = await Property.find(filters).exec();
    console.log("filtersss" ,filters)
    console.log('Filtered Properties:', filteredProperties);

    // Send the filtered properties as the response
    res.send(filteredProperties)

  


  } catch (error) {
    console.error('Error filtering properties:', error);
    res.status(500).json({ error: 'Error filtering properties' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`API server is running on port ${port}`);
});
