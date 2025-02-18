const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: 'https://frontend-sigma-lime.vercel.app/', // Allow requests only from your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
}));
app.use(bodyParser.json());

// Connect to MongoDB
const connectDB = async() => {
  try {
    await mongoose.connect('mongodb+srv://Anurag:anurag@cluster0.ack3l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log("mongodb connected");
  } catch (error) {
    console.log("connection error ",error)
  }
}
connectDB()

// Mongoose Schemas
const tenantSchema = new mongoose.Schema({
  name: String,
  apartment: String,
  contact: String,
  status: { type: String, default: 'Active' },
});

const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  date: Date,
  house: String,
});

// Mongoose Models
const Tenant = mongoose.model('Tenant', tenantSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// Tenant management routes
app.get('/api/tenants', async (req, res) => {
  try {
    const tenants = await Tenant.find();
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

// Modify POST Route for Tenants
app.post('/api/tenants', async (req, res) => {  // Fix: removed extra URL in the post route
  const { name, apartment, status, contact } = req.body;
  const newTenant = new Tenant({ name, apartment, status, contact });
  try {
    await newTenant.save();
    res.status(201).json(newTenant);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

app.put('/api/tenants/:id/status', async (req, res) => {
  const { id } = req.params;
  try {
    const tenant = await Tenant.findById(id);
    if (tenant) {
      tenant.status = tenant.status === 'Active' ? 'Inactive' : 'Active';
      await tenant.save();
      res.json(tenant);
    } else {
      res.status(404).json({ message: 'Tenant not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

app.put('/api/tenants/:id', async (req, res) => {
  const { id } = req.params;
  const { name, apartment, contact } = req.body;
  try {
    const updatedTenant = await Tenant.findByIdAndUpdate(
      id,
      { name, apartment, contact },
      { new: true }
    );
    if (updatedTenant) {
      res.json(updatedTenant);
    } else {
      res.status(404).json({ message: 'Tenant not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update tenant' });
  }
});

app.delete('/api/tenants/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTenant = await Tenant.findByIdAndDelete(id);
    if (deletedTenant) {
      res.json({ message: 'Tenant deleted successfully' });
    } else {
      res.status(404).json({ message: 'Tenant not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete tenant' });
  }
});

// Booking management routes
app.post('/api/book-house', async (req, res) => {
  const { name, email, date, house } = req.body;
  if (!name || !email || !date || !house) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newBooking = new Booking({ name, email, date, house });
  try {
    await newBooking.save();
    res.status(201).json({ message: 'Booking confirmed!', booking: newBooking });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Contact form submission route
app.post('/api/contact', (req, res) => {
  const { name, email, phone, message } = req.body;
  console.log('Form Data Received:', { name, email, phone, message });
  res.status(200).json({ message: 'Form submitted successfully!' });
});

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Export the app as a Vercel function
module.exports = app;
