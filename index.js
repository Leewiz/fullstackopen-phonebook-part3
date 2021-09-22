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

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const getTimeString = () => {
  const time = new Date()
  return `${time.toDateString()} ${time.toTimeString()}`
}

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
    mongoose.connection.close()
  })
})

app.get('/info', (request, response) => {
  const infoString = `<p>Phonebook has info for ${persons.length} people</p><p>${getTimeString()}</p>`
  response.send(infoString)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(p => p.id === id)

  if(person) {
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
  return Math.floor(Math.random() * 1000000000)
}

app.post('/api/persons', (request, response) => {
  const newPerson = request.body
  if(!newPerson.name || !newPerson.number) {
    return response.status(400).json({
      error: 'content missing or incomplete'
    })
  }

  if(persons.find(p => p.name === newPerson.name)) {
    return response.status(409).json({
      error: 'person already exists in phonebook'
    })
  }

  const person = new Person({
    id: generateId(),
    name: newPerson.name,
    number: newPerson.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})