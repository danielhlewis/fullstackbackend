const mongoose = require('mongoose')

// Remove Deprecation Warnings
mongoose.set('useCreateIndex', true)
mongoose.set('useFindAndModify', false)

var uniqueValidator = require('mongoose-unique-validator')

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name:   {
    type: String,
    required: true,
    minlength: 3,
    unique: true
  },
  number: {
    type: String,
    validate: {
      validator: function(v) {
        return /(\d.*){8}/.test(v)
      },
      message: () => 'phone number must contain at least 8 digits'
    },
    required: true,
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

personSchema.plugin(uniqueValidator)

module.exports = mongoose.model('Person', personSchema)