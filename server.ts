import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import fightParamsRawSubmitsRoute from './routes/fightParamsRawSubmits';
import cors from 'cors';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './.env' });


const app = express();
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/fight-params-raw-submits', fightParamsRawSubmitsRoute);


// Connect to MongoDB
const mongoConnection = process.env.DB_CONNECTION || "nonefound";
mongoose.connect(mongoConnection);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));


app.get("/", (req, res) => {
    res.send("boss-game-api");
});

const port = process.env.PORT || 3420;
app.listen(port, () => {
    console.log(`*****Server started on port ${port}*****`);
});