const Course = require('../models/course');
const User = require('../models/user');

const async = require('async');

module.exports = function(app) {


    app.get('/', function(req, res, next) {
        res.render('main/home');
    });

    app.get('/courses', function(req, res, next) {
        Course.find({}, function(err, courses) {
            res.render('courses/courses', { courses: courses });
        });
    });

    app.get('/courses/:id', function(req, res, next) {
        async.parallel([
            function(callback) {

                Course.findOne({ _id: req.params.id })
                    .populate('ownByStudent.user')
                    .exec(function(err, foundCourse) {
                        callback(err, foundCourse);
                    });
            },

            function(callback) {
                User.findOne({ _id: req.user._id, 'coursesTaken.course': req.params.id})
                    .populate('coursesTaken.course')
                    .exec(function(err, foundUserCourse) {
                        callback(err, foundUserCourse);
                    });
            },

            function(callback) {
                User.findOne({ _id: req.user._id, 'coursesTeach.course': req.params.id})
                    .populate('coursesTeach.course')
                    .exec(function(err, foundUserCourse) {
                        callback(err, foundUserCourse);
                    });
            },
        ], function(err, results) {
            let course = results[0];
            let userCourse = results[1];
            let teacherCourse = results[2];
            if (userCourse === null && teacherCourse === null) {
                res.render('courses/courseDesc', { course: course });
            } else if (userCourse === null && teacherCourse != null) {
                res.render('courses/course', { course: course });
            } else {
                res.render('courses/course', { course: course });
            }
        });
    });


}
