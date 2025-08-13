// Quick script to check existing users
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/stacks-finance')
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Get the User model
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
    });
    
    const User = mongoose.model('User', userSchema);
    
    // Find all users
    return User.find({}, 'name email').exec();
  })
  .then(users => {
    console.log('Existing users:');
    if (users.length === 0) {
      console.log('No users found. You need to register first!');
    } else {
      users.forEach(user => {
        console.log(`- Name: ${user.name}, Email: ${user.email}`);
      });
    }
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err);
    mongoose.connection.close();
  });
