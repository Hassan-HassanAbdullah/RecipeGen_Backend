let express = require('express');
let mongoose = require('mongoose');
require('dotenv').config();
let axios = require('axios');
const cors = require('cors');
let Routs = require('./routes/Routes')
let authRouts = require('./routes/authRouts');
const  uploadRecipeRoute  = require('./routes/uploadRecipeRoute');



let app = express();



// Middleware
app.use(cors());
// app.use(express.json());

// Routes
// app.use('/api/auth',express.json(), Routs);
app.use('/api/auth',express.json(), authRouts);
app.use('/api/recipes',express.json(), Routs); 
app.use('/api/recipes', uploadRecipeRoute); 




// Connect to MongoDB
mongoose.connect(process.env.MONGO_DB_URI).then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT, () => {
        console.log('Server is running on http://localhost:'+ process.env.PORT);
    })

}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
});