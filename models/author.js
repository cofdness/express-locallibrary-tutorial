const mongoose = require('mongoose')
const Schema = mongoose.Schema
const authorSchema = new Schema(
    {
        first_name: {type: String, required: true, max: 100},
        family_name: {type: String, required: true, max: 100},
        date_of_birth: {type: Date},
        date_of_death: {type: Date}
    }
)

authorSchema.virtual('name')
    .get(function(){
        return `${this.family_name}, ${this.first_name}`
    })
authorSchema.virtual('lifespan')
    .get(function () {
        return (this.date_of_death.getFullYear() - this.date_of_birth.getFullYear()).toString()
    })

authorSchema.virtual('url')
    .get(function () {
        return `/catalog/author/${this._id}`
    })

module.exports = mongoose.model('Author', authorSchema)
