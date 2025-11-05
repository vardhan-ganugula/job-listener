import { Schema, model } from "mongoose";

const jobSchema = new Schema({
    link : String,
    userId : {
        type : Schema.Types.ObjectId,
        ref : 'user'
    },
    jobTitle: String,
    companyName: String,
    location:String,
    description:String,
    applicants:String,
    postedTime: String
}, {
    timestamps: true
});

const jobModel = model('job', jobSchema);

export default jobModel;