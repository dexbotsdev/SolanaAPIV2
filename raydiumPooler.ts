import axios from 'axios';
import { MongoClient } from 'mongodb';

const API_URL = 'https://api.raydium.io/v2/sdk/liquidity/mainnet.json';
const MONGO_URL = 'mongodb://localhost:27017'; // Update with your MongoDB connection string
const uri = "mongodb+srv://radialdapps:37qrHBf7IuDfNLpI@cluster0.cnuvoi3.mongodb.net/?retryWrites=true&w=majority";

async function downloadData(): Promise<any> {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error: any) {
    throw new Error(`Error downloading data: ${error.message}`);
  }
}

async function insertDataIntoMongoDB(data: any): Promise<void> {
  const client = new MongoClient(MONGO_URL, {});

  try {
    await client.connect();
    const db = client.db('solanaapi'); // Change 'raydium' to your preferred database name

    const collection = db.collection('newraydiumpools');

    await collection.deleteMany({}).then(async (done) => {
      // Assuming you want to insert both official and unofficial pools
      await collection.insertMany([...data.official, ...data.unOfficial]).then((done2)=>{

        console.log('Data inserted into MongoDB successfully!');
        console.log(new Date().toString())

        
      })

     
    })


  } finally {
    await client.close();
  }
}

async function run(): Promise<void> {
  try {

    console.log(new Date().toString())
    const data = await downloadData();
    await insertDataIntoMongoDB(data);

  } catch (error: any) {
    console.error(error.message);
  }
}

// Run the script initially and then every hour using a scheduler like cron.
run()
//setInterval(() => , 120000);
