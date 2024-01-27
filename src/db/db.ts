 import { Mongoose } from "mongoose";
//37qrHBf7IuDfNLpI
//radialdapps
const uri = "mongodb+srv://radialdapps:37qrHBf7IuDfNLpI@cluster0.cnuvoi3.mongodb.net/solanaapi?retryWrites=true&w=majority";
const localUri = 'mongodb://localhost:27017/solanaapi';

const mongoose = new Mongoose();
// Connect to MongoDB
mongoose.connect(localUri, {
  autoCreate: true,
  autoIndex:true
}).catch((error)=>{
  console.log(error)
})

// Define the schema for your collection
const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  subscription: String,
  authtoken: { type: String, unique: true, required: true },
  enabled: Boolean,
});

const marketSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  owner:String,
  creationDate:{type:Date, default:Date.now()},
  tokenName: String,
  openTime:Date,
  baseMint: String,
  quoteMint: String,
  lpMint: String,
  baseDecimals: Number,
  quoteDecimals: Number,
  lpDecimals: Number,
  lpAmount: Number,
  baseLiquidity: Number,
  quoteLiquidity: Number, 
  lpBurned:Boolean,
  rugpulled:Boolean,
  burnedTime:Date,
  rugpulledTime:Date,
  burnedLpAmount:Number,
  mintable:Boolean,
  freezeAble:Boolean,
  tokenJson:String
});


const RayDiumPoolSchema = new mongoose.Schema({
  id: { type: String, required: true },
  baseMint: { type: String, required: true },
  quoteMint: { type: String, required: true },
  lpMint: { type: String, required: true },
  baseDecimals: { type: Number, required: true },
  quoteDecimals: { type: Number, required: true },
  lpDecimals: { type: Number, required: true },
  version: { type: Number, required: true },
  programId: { type: String, required: true },
  authority: { type: String, required: true },
  openOrders: { type: String, required: true },
  targetOrders: { type: String, required: true },
  baseVault: { type: String, required: true },
  quoteVault: { type: String, required: true },
  withdrawQueue: { type: String, required: true },
  lpVault: { type: String, required: true },
  marketVersion: { type: Number, required: true },
  marketProgramId: { type: String, required: true },
  marketId: { type: String, required: true },
  marketAuthority: { type: String, required: true },
  marketBaseVault: { type: String, required: true },
  marketQuoteVault: { type: String, required: true },
  marketBids: { type: String, required: true },
  marketAsks: { type: String, required: true },
  marketEventQueue: { type: String, required: true },
  lookupTableAccount: { type: String, required: true },
});

 

// Create the model
  const User = mongoose.model('User', userSchema);
  const Market = mongoose.model('Market', marketSchema);
  const RayDiumPool = mongoose.model('RayDiumPool', RayDiumPoolSchema);



export async function createUser(userId, subscription, authtoken, enabled) {
    try {
      const user = new User({
        userId,
        subscription,
        authtoken,
        enabled,
      });
      await user.save();
       console.log('User created successfully');
    } catch (error) {
      console.error('Error creating user:', error.message);
    }
  }
  
  export async function findUser(token) {
    try {
      const user = await User.findOne({authtoken: token });
      if (user) {
         console.log('User found:', user);
      } else {
        console.log('User not found');
      }

      return user;
    } catch (error) {
      console.error('Error finding user:', error.message);
    }
  }
  
  export async function updateUser(userId, updateFields) {
    try {
      const result = await User.updateOne({ userId }, { $set: updateFields });
      if (result.modifiedCount > 0) {
         console.log('User updated successfully');
      } else {
        console.log('User not found');
      }
    } catch (error) {
      console.error('Error updating user:', error.message);
    }
  }
  
  export async function deleteUser(userId) {
    try {
      const result = await User.deleteOne({ userId });
      if (result.deletedCount > 0) {
         console.log('User deleted successfully');
      } else {
         console.log('User not found');
      }
    } catch (error) {
      console.error('Error deleting user:', error.message);
    }
  }



  export async function createMarket(marketData) {
  try {
    const market = new Market(marketData);
    await market.save();
     console.log('Market created successfully');
  } catch (error) {
    console.error('Error creating market:', error.message);
  }
}

export async function findPool(id:any) {
  try {
    const market = await RayDiumPool.findOne({ lpMint: id });
    if (market) {
       console.log('Market found:', market);
       return market;
    } else {
      console.log('Market not found '+id);
      return null;
    }  
  } catch (error) {
    console.error('Error finding market:', error.message);
    return null;

  }
}

export async function findLpMint(id:any) {
  try {
    const market = await Market.findOne({ lpMint: id });
    if (market) {
       console.log('Market found:', market);
       return market;
    } else {
      console.log('Market not found '+id);
      return null;
    }  
  } catch (error) {
    console.error('Error finding market:', error.message);
    return null;

  }
}

  export async function findMarket(id) {
  try {
    const market = await Market.findOne({ id });
    if (market) {
       console.log('Market found:', market);
    } else {
       console.log('Market not found');
    }

    return market;

  } catch (error) {
    console.error('Error finding market:', error.message);
  }
}

export async function updateMarket(id, updateFields) {
  try {
    const result = await Market.updateOne({ id }, { $set: updateFields });
    if (result.modifiedCount > 0) {
       console.log('Market updated successfully');
      return true;
    } else {
       console.log('Market not found');
      return false;
    }
  } catch (error) {
    console.error('Error updating market:', error.message);
    return false;
  }
}