// basic ts node server with express

import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import  fightParamsRawSubmitsRoute  from './routes/fightParamsRawSubmits';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/fight-params-raw-submits', fightParamsRawSubmitsRoute);

app.get("/", (req, res) => {
    res.send("boss-game-api");
});

app.listen(process.env.PORT || 3420, () => {
    console.log("*****Server started*****");
});



