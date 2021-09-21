const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(express.static('build'))

morgan.token('post-body', req => req.method === 'POST' ? JSON.stringify(req.body) : ' ')
morgan.format('tiny-with-post-body', ':method :url :status :res[content-length] - :response-time ms :post-body')

app.use(cors())
app.use(morgan('tiny-with-post-body'))

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
   "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const getTimeString = () => {
  const time = new Date()
  return `${time.toDateString()} ${time.toTimeString()}`
}

app.get('/api/persons', (request, response) => {
    response.json(persons)
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

  const person = {
    id: generateId(),
    name: newPerson.name,
    number: newPerson.number
  }

  persons = persons.concat(person)
  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})