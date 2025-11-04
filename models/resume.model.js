import {Schema, model} from 'mongoose';

const jobSchema = new Schema({
    userId : Schema.Types.ObjectId,
    keyword : String,
    location : String,
    experienceLevel : String,
    remote : String,
    jobType : String, 
    easyApply : Boolean
}, {
    timestamps : true
})


const jobModel = model('JobDetails', jobSchema);


export default jobModel;