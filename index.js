const express = require('express')
const app = express()

app.use(express.json())
app.use(express.static('build'))

const cors = require('cors')
app.use(cors())

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



let persons = [
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": 1
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": 2
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": 3
    },
    {
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
      "id": 4
    }
]

app.get('/info', (req, res) => {
  res.send(
    `<div>Phonebook has info for ${persons.length} people</div>
    <div>${new Date().toString()}</div>`
  )
})

app.get('/api/persons', (req, res) => {
	res.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	const person = persons.find(person => person.id === id)
	if (person) {
		response.json(person)
	} else {
		response.status(404).end()
	}
})

app.delete('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	persons = persons.filter(person => person.id !== id)
  
	response.status(204).end()
})

const generateId = () => {
  return Number.parseInt(Math.random() * Number.MAX_SAFE_INTEGER)
}

app.post('/api/persons', (request, response) => {
	const body = request.body
  
	if (!body.name) {
	  return response.status(400).json({ 
		  error: 'name is missing' 
	  })
  }

  if (!body.number) {
	  return response.status(400).json({ 
		  error: 'number is missing' 
	  })
  }
  
  if (persons.find(person => person.name === body.name)) {
	  return response.status(400).json({ 
      error: 'name must be unique' 
	  })
	}
  
  var id = generateId()
  while (persons.find(person => person.id === id)) {
    id = generateId()
  }

	const person = {
	  name: body.name,
	  number: body.number,
	  id: id
	}
  
	persons = persons.concat(person)
  
	response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})