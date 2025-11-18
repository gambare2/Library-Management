import mongoose from "mongoose"

const connectDB = async () => {
    if(mongoose.connection.readyState>= 1) return;
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Mongo db connect");
    
}

export default connectDB;
