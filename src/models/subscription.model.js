import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({

    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"user"
    },
    channel:{
        type:Schema.Types.ObjectId,//channel
        ref:"user"
    }

},{timestamps:true})



























export const Subscription = mongoose.model("Subscription",subscriptionSchema)