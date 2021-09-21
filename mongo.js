require('dotenv').config()
const mongoose = require('mongoose')

const SHOWALL = 3
const ADD = 5

const usageHelp = () => {
  console.log('Usage: node mongo.js <password>')
  console.log('list all entries - $ node mongo.js <password>')
  console.log('add new entry    - $ node mongo.js <password> <name> <number>')
  process.exit(1)
}

if(process.argv.length !== SHOWALL || process.argv.length !== ADD) {
  usageHelp()
}

const url = process.env.MONGODB_URI
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const addPerson = (name, number) => {
  const person = new Person({ name, number })

  person.save().then(result => {
    console.log('person saved!')
    mongoose.connection.close()
  })
}

const showAllPersons = () => {
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
}

switch(process.argv.length) {
  case SHOWALL:
    showAllPersons()
    break
  case ADD:
    addPerson(process.argv[3], process.argv[4])
    break
  default:
    usageHelp()
}
