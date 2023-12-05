const { MongoClient, ObjectId } = require('mongodb');
const dbname = 'crud';
const url = 'mongodb://127.0.0.1:27017/';

const state = {
  db: null,
};

const connect = async () => {
  if (state.db) return;
  try {
    const client = await MongoClient.connect(url);
    state.db = client.db(dbname);
    //client.close();
  } catch (err) {
    throw new Error('Unable to connect to the database');
  }
};

const getPrimaryKey = (_id) => {
  return new ObjectId(_id);
};

const getDB = () => {
  return state.db;
};

module.exports = { getDB, connect, getPrimaryKey };
