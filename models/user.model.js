import {Schema, model} from 'mongoose';

const userSchema = new Schema({
    userId : {
        require: true,
        unique: true,
        type: String,
    },
    fullName : {
        require: true,
        type : String,
    },
    userName : {
        require: true,
        type: String
    },
    resumeText : String
}, {timestamps : true});

const userModel = model('user', userSchema);

export default userModel;