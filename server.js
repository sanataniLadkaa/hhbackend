const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
const allowedOrigins = [
  'https://67b5d9cee0388000082c83c6--housecapital.netlify.app',
  'http://localhost:3000'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://Anurag:anurag@cluster0.ack3l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Stop the app if the DB connection fails
  }
};
connectDB();
// Mongoose Schemas
const tenantSchema = new mongoose.Schema({
  name: String,
  apartment: String,
  contact: String,
  status: { type: String, default: 'Active' }
});

const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  date: Date,
  house: String
});

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String
});

// Mongoose Models
const Tenant = mongoose.model('Tenant', tenantSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Contact = mongoose.model('Contact', contactSchema);

// Routes
app.get('/tenants', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const tenants = await Tenant.find()
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    res.json(tenants);
  } catch (err) {
    console.error("Failed to fetch tenants:", err.message);
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

app.post('/tenants', async (req, res) => {
  const { name, apartment, status, contact } = req.body;
  const newTenant = new Tenant({ name, apartment, status, contact });
  try {
    await newTenant.save();
    res.status(201).json(newTenant);
  } catch (err) {
    console.error("Failed to create tenant:", err.message);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

app.put('/tenants/:id/status', async (req, res) => {
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
    console.error("Failed to update status:", err.message);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

app.put('/tenants/:id', async (req, res) => {
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
    console.error("Failed to update tenant:", err.message);
    res.status(500).json({ error: 'Failed to update tenant' });
  }
});

app.delete('/tenants/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTenant = await Tenant.findByIdAndDelete(id);
    if (deletedTenant) {
      res.json({ message: 'Tenant deleted successfully' });
    } else {
      res.status(404).json({ message: 'Tenant not found' });
    }
  } catch (err) {
    console.error("Failed to delete tenant:", err.message);
    res.status(500).json({ error: 'Failed to delete tenant' });
  }
});

app.post('/book-house', async (req, res) => {
  const { name, email, date, house } = req.body;
  if (!name || !email || !date || !house) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newBooking = new Booking({ name, email, date, house });
  try {
    await newBooking.save();
    res.status(201).json({ message: 'Booking confirmed!', booking: newBooking });
  } catch (err) {
    console.error("Failed to create booking:", err.message);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

app.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Failed to fetch bookings:", err.message);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

app.post('/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;
  try {
    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();
    res.status(201).json({ message: 'Form submitted successfully!' });
  } catch (err) {
    console.error("Failed to save contact:", err.message);
    res.status(500).json({ error: 'Failed to save contact' });
  }
});

app.get('/contact', async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (err) {
    console.error("Failed to fetch contacts:", err.message);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

app.get('/', (req, res) => {
  res.send('Backend is running!');
});


module.exports = app;
