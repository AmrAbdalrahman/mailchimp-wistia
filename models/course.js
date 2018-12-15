const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new  Schema({

    title: String,
    desc: String,
    wistiaId: String,
    price: Number,
    ownByTeacher: {type: Schema.Types.ObjectId, ref: 'User'},
    ownByStudent: {type: Schema.Types.ObjectId, ref: 'User'},
    totalStudents: Number

});


module.exports = mongoose.model('Course',CourseSchema);