const mongoose = require('mongoose');

const { app } = require('./app.js');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect("mongodb+srv://ahmed:rezik@cluster0.6t817.mongodb.net/test?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Main database connected successfully');
});
app.listen(5000, () => {
    console.log(`Server listening at port ${process.env.PORT}`);
});