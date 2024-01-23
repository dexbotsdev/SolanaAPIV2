 import { Mongoose } from "mongoose";
//37qrHBf7IuDfNLpI
//radialdapps
const uri = "mongodb+srv://radialdapps:37qrHBf7IuDfNLpI@cluster0.cnuvoi3.mongodb.net/?retryWrites=true&w=majority";
const localUri = 'mongodb://localhost:27017/solanaapi';

 const mongoose = new Mongoose();
// Connect to MongoDB
mongoose.connect(localUri, {
  autoCreate: true,
  autoIndex:true
});

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
// Create the model
  const User = mongoose.model('User', userSchema);
  const Market = mongoose.model('Market', marketSchema);



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

 

export async function findLpMint(id:any) {
  try {
    const market = await Market.findOne({ lpMint: id });
    if (market) {
       console.log('Market found:', market);
       return market;
    } else {
      console.log('Market not found');
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