import axios from "axios";
import { MongoClient } from "mongodb";

const mongoDBConnectionString = 'mongodb://localhost:27017/solanaapi';

const jsonDataUrl='https://api.raydium.io/v2/sdk/liquidity/mainnet.json';

async function downloadAndInsert() {
    try {
      // Download JSON file
      const response = await axios.get(jsonDataUrl);
      const jsonData = response.data.official;
  
      // Connect to MongoDB
      const client = new MongoClient(mongoDBConnectionString);
      await client.connect();
  
      // Select the appropriate database and collection
      const database = client.db('solanaapi');
      const collection = database.collection('raydiumpools');
  
      // Insert records into MongoDB
      await collection.insertMany(jsonData);
  
      // Close the MongoDB connection
      await client.close();
  
      console.log('Records inserted successfully.');
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
  
  // Call the function to start the process
  downloadAndInsert();
