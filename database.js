const { MongoClient } = require("mongodb");

const url =
  "mongodb+srv://riteshyaaa:jhSEPD22Z7gj8NH7@cluster0.bwoqq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(url);

const dbName = "HelloWorld";

async function main() {
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  const collection = db.collection("user");

  const data = {
   firstName: "Ram",
    lastName: "singh",
     city: "London"
   
    
  }

  // insert a document
  const insertResult = await collection.insertMany([data]);
console.log('Inserted documents =>', insertResult);

  // find documents
  const findResult = await collection.find({firstName:"Om"}).toArray();
console.log('Found documents =>', findResult);

  return "done.";
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());








