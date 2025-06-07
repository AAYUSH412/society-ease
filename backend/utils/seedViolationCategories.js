import mongoose from 'mongoose';
import ViolationCategory from '../models/ViolationCategory.js';
import { connectDB } from '../config/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './.env.local' });

const violationCategories = [
  {
    name: 'Unauthorized Parking',
    description: 'Parking in areas not designated for the specific user or without proper authorization',
    defaultFineAmount: 500,
    severity: 'medium',
    societyName: 'Default Society'
  },
  {
    name: 'Blocking Fire Lane',
    description: 'Parking in emergency access routes, fire lanes, or blocking emergency equipment',
    defaultFineAmount: 1000,
    severity: 'critical',
    societyName: 'Default Society'
  },
  {
    name: 'Visitor Parking Misuse',
    description: 'Residents using visitor parking spaces or overstaying in visitor parking',
    defaultFineAmount: 300,
    severity: 'low',
    societyName: 'Default Society'
  },
  {
    name: 'Disabled Parking Violation',
    description: 'Parking in spaces reserved for persons with disabilities without proper permit',
    defaultFineAmount: 1500,
    severity: 'high',
    societyName: 'Default Society'
  },
  {
    name: 'Double Parking',
    description: 'Parking parallel to another vehicle, blocking access or traffic flow',
    defaultFineAmount: 400,
    severity: 'medium',
    societyName: 'Default Society'
  },
  {
    name: 'Parking Outside Lines',
    description: 'Parking outside designated lines or taking up multiple parking spaces',
    defaultFineAmount: 200,
    severity: 'low',
    societyName: 'Default Society'
  },
  {
    name: 'Blocking Entrance/Exit',
    description: 'Parking in a way that blocks entrances, exits, or driveways',
    defaultFineAmount: 800,
    severity: 'high',
    societyName: 'Default Society'
  },
  {
    name: 'Overstaying Time Limit',
    description: 'Exceeding permitted parking duration in time-restricted areas',
    defaultFineAmount: 250,
    severity: 'low',
    societyName: 'Default Society'
  }
];

const seedViolationCategories = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing categories
    await ViolationCategory.deleteMany({});
    console.log('Cleared existing violation categories');

    // Insert new categories
    const categories = await ViolationCategory.insertMany(violationCategories);
    console.log(`Successfully seeded ${categories.length} violation categories:`);
    
    categories.forEach(category => {
      console.log(`- ${category.name} (${category.severity}) - ₹${category.defaultFineAmount}`);
    });

  } catch (error) {
    console.error('Error seeding violation categories:', error);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the seeder
seedViolationCategories();
