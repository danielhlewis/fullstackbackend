require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./models/person')

app.use(express.json())
app.use(express.static('build'))

const cors = require('cors')
app.use(cors())

// Morgan Setup
// ------------
var morgan = require('morgan')

app.use(morgan(function (tokens, req, res) {
  if (tokens.method(req, res) === "POST") {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      JSON.stringify(req.body)
    ].join(' ')
  } else {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms'
    ].join(' ')
  }
}))
// ------------

app.get('/info', (request, response, next) => {
  Person.countDocuments({}, (error, result) => {
    if (error) {
      next(error)
    } else {
      console.log(result)
      response.send(
        `<div>Phonebook has info for ${result} people</div>
        <div>${new Date().toString()}</div>`
      )
    }
  })
})

app.get('/api/persons', (request, response) => {
	console.log("Getting all persons")
	Person.find({}).then(persons => {
	  response.json(persons.map(person => person.toJSON()))
	});
});

app.post('/api/persons', (request, response) => {
	const body = request.body
  
	if (body.name === undefined) {
	  return response.status(400).json({ error: 'content missing' })
  }
  
  if (body.number === undefined) {
	  return response.status(400).json({ error: 'content missing' })
	}
  
	const person = new Person({
	  name: body.name,
	  number: body.number
	})
  
	person.save().then(savedPerson => {
	  response.json(savedPerson.toJSON())
	})
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person.toJSON())
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
	const body = request.body
  
	const person = {
	  number: body.number,
	}
  
	Person.findByIdAndUpdate(request.params.id, person, { new: true })
	  .then(updatedNote => {
		response.json(updatedNote.toJSON())
	  })
	.catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
	console.error(error.message)
  
	if (error.name === 'CastError') {
	  return response.status(400).send({ error: 'malformatted id' })
	} 
  
	next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})