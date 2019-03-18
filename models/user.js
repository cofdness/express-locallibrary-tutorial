const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')
const userSchema = new Schema({
    email: {type: String, unique: true, required: true, trim: true},
    name: {type: String, required: true, trim: true},
    password: {type: String, required: true}
})

userSchema.statics.authenticate = (email, password, callback) => {
    User.findOne({email: email})
        .exec((err, user) => {
            if (err) return callback(err)
            else if (!user) {
                const err = new Error('User not found')
                err.status = 401
                return callback(err)
            }
            bcrypt.compare(password, user.password, (error, result) => {
                if (result === true) {
                    return callback(null, user)
                }
                else {
                    return callback()
                }
            })
        })
}

// hash password before save
userSchema.pre('save', function(next) {
    const user = this
    console.log(user.password)
    bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) return next (err)
        user.password = hash
        next()
    })
})

const User = mongoose.model('User', userSchema)
module.exports = User
