require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')

app.use(express.static('build'))
app.use(cors())
app.use(express.json())


// request logger
morgan.token('post-body', req => req.method === 'POST' ? JSON.stringify(req.body) : ' ')
morgan.format('tiny-with-post-body', ':method :url :status :res[content-length] - :response-time ms :post-body')
app.use(morgan('tiny-with-post-body'))

const getTimeString = () => {
  const time = new Date()
  return `${time.toDateString()} ${time.toTimeString()}`
}

// get all persons
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

// info page
app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    const infoString = `<p>Phonebook has info for ${persons.length} people</p><p>${getTimeString()}</p>`
    response.send(infoString)
  })
})

// get person by id
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if(person) {
        response.json(person)
      }
    })
    .catch(error => next(error))
})

// delete person
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// add a new person
app.post('/api/persons', (request, response, next) => {
  const body = request.body
  const newPerson = new Person({
    name: body.name,
    number: body.number,
  })

  newPerson.save()
    .then(savedPerson => response.json(savedPerson))
    .catch(error => next(error))
})

// update person data
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const newPerson = {
    name: body.name,
    number: body.number,
  }

  const opts = { new: true, runValidators: true }
  Person.findByIdAndUpdate(request.params.id, newPerson, opts)
    .then(updatedPerson => {
      if(updatedPerson) {
        response.json(updatedPerson)
      } else {
        throw new Error(`${newPerson.name} was already deleted from the database`)
      }
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if(error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if(error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if( error.name === 'Error') {
    return response.status(400).json({error: error.message })
  }
  next(error)
}
app.use(errorHandler)

// start the backend
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})