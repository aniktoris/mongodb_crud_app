const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://127.0.0.1:27017/';

const client = new MongoClient(url);

async function main() {
  console.log('connecting...');
  const db = await client.connect(url);
  console.log('connected', db);

  db.close();
}

main()
  .then()
  .catch((err) => {
    console.error(err);
  });
