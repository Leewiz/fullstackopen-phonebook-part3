require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./models/person')

const morgan = require('morgan')
const cors = require('cors')

app.use(express.static('build'))
app.use(express.json())

morgan.token('post-body', req => req.method === 'POST' ? JSON.stringify(req.body) : ' ')
morgan.format('tiny-with-post-body', ':method :url :status :res[content-length] - :response-time ms :post-body')

app.use(cors())
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
app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
    .then(person => {
      if(person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      console.log(error)
      response.status(500).end()
    })
})

// delete person
app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// add a new person
app.post('/api/persons', (request, response) => {
  const body = request.body
  const newPerson = new Person({
    name: body.name,
    number: body.number,
  })

  if(!newPerson.name || !newPerson.number) {
    return response.status(400).json({
      error: 'content missing or incomplete'
    })
  }

  newPerson.save().then(savedPerson => {
    console.log('newPerson saved:', savedPerson)
    response.json(savedPerson)
  })
})

// update person data
app.put('/api/persons/:id', (request, response) => {
  const body = request.body
  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, {new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

// start the backend
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})