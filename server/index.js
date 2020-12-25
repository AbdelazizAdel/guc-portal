const mongoose = require('mongoose');

const { app } = require('./app.js');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.DB_URL_Test, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false 
}).then(() => {
    console.log('Main database connected successfully');
});
app.listen(process.env.PORT, () => {
    console.log(`Server listening at port ${process.env.PORT}`);
});