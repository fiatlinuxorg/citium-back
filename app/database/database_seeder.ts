import User from '#models/user_model'
import ConstructionSite from '#models/construction_site_model'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'


dotenv.config()

mongoose.connect(process.env.MONGO_URI || '') as mongoose.ConnectOptions

// Seed the database with some data
export default class DatabaseSeeder {
  public async run() {
    // Create users
    const admin = new User({
      email: 'admin@citium.it',
      password: bcrypt.hash('Admin123', 10),
      firstName: 'Admin',
      lastName: 'Citium',
      role: 'admin',
    })
    await admin.save()

    const user = new User({
      email: 'mariorossi@mail.com',
      password: bcrypt.hash('Password123', 10),
      firstName: 'Mario',
      lastName: 'Rossi',
    })
    await user.save()
    // Create construction sites
    for (let i = 0; i < 10; i++) {
      const constructionSite = new ConstructionSite({
        name: `Cantiere ${i}`,
        street: `Via Cantiere`,
        number: `${i}`,
        description: `Costruzione di un nuovo cantiere ${i}`,
        impacts_road: Math.random() >= 0.5,
        impacts_cycling_lane: Math.random() >= 0.5,
        impacts_public_transport: Math.random() >= 0.5,
        impacts_sidewalk: Math.random() >= 0.5,
        initial_budget: Math.floor(Math.random() * 1000000),
        size: 1,
        // Start date is random between 1 month before and 1 month after the current date
        start_date: new Date(new Date().setMonth(new Date().getMonth() - 1 + Math.random() * 2)),
        // End date is random between 1 week before and 6 months after now
        end_date: new Date(new Date().setDate(new Date().getDate() - 7 + Math.random() * 180)),
      })
      await constructionSite.save()
    }

    // Close the connection
    mongoose.connection.close()
  }
}
