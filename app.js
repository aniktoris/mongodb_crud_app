const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Joi = require('joi');
const db = require('./db');

const collection = 'todo';

const app = express();

const schema = Joi.object().keys({
  todo: Joi.string().required(),
});

app.use(bodyParser.json());

app.get('/', async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'index.html'));
  } catch (err) {
    console.error(err);
  }
});

//read
app.get('/getTodos', async (req, res) => {
  try {
    const dbInstance = db.getDB();
    const documents = await dbInstance
      .collection(collection)
      .find({})
      .toArray();
    console.log(documents);
    res.json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

//update
app.put('/:id', async (req, res) => {
  try {
    const todoID = req.params.id;
    const userInput = req.body;

    const dbInstance = db.getDB();
    const result = await dbInstance
      .collection(collection)
      .findOneAndUpdate(
        { _id: db.getPrimaryKey(todoID) },
        { $set: { todo: userInput.todo } },
        { returnOriginal: false },
      );
    console.log(result);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

//create
app.post('/', async (req, res, next) => {
  try {
    const userInput = req.body;
    console.log('Incoming data from client:', userInput);
    const { error, value } = schema.validate(userInput);

    try {
      const dbInstance = db.getDB();
      const result = await dbInstance.collection(collection).insertOne(value);

      const updatedDocument = await dbInstance
        .collection(collection)
        .findOne({ _id: value._id });

      console.log(result);
      res.json({
        result: result,
        updatedDocument: updatedDocument,
        msg: 'Successfully inserted Todo!!!',
        error: null,
      });
    } catch (err) {
      console.error('Error inserting into database:', err);
      const error = new Error('Failed to insert Todo Document');
      error.status = 400;
      next(error);
    }
  } catch (err) {
    console.error('Validation error:', err);
    const error = new Error('Invalid Input');
    error.status = 400;
    next(error);
  }
});

//delete
app.delete('/:id', async (req, res) => {
  try {
    const todoID = req.params.id;

    const dbInstance = db.getDB();
    const result = await dbInstance
      .collection(collection)
      .findOneAndDelete({ _id: db.getPrimaryKey(todoID) });

    console.log(result);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.use((err, req, res, next) => {
  res.status(err.status).json({
    error: {
      message: err.message,
    },
  });
});

(async () => {
  try {
    await db.connect();

    app.listen(3000, () => {
      console.log('Connected to database, app listening on port 3000');
    });
  } catch (err) {
    console.error('Unable to connect to database:', err);
    process.exit(1);
  }
})();
