const express = require('express')
const morgan = require('morgan')

const app = express()
app.use(express.json())

morgan.token('body', (request) => {
    return request.method === 'POST' ? JSON.stringify(request.body) : ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


let persons = [
    { 
        id: "1",
        name: "Arto Hellas", 
        number: "040-123456"
      },
      { 
        id: "2",
        name: "Ada Lovelace", 
        number: "39-44-5323523"
      },
      { 
        id: "3",
        name: "Dan Abramov", 
        number: "12-43-234345"
      },
      { 
        id: "4",
        name: "Mary Poppendieck", 
        number: "39-23-6423122"
      }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has started for ${persons.length} people </p> <p>${new Date().toLocaleString()}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

const generateId = () => {
    const maxId = persons.length > 0 
    ? Math.max(...persons.map(n => Number(n.id)))
    : 0
    return(maxId + 1)
}

app.post('/api/persons', (request, response) => {
    const {name, number} = request.body

    if (!name){
        return response.status(400).json({error: 'Name Missing'})
    } 
    if (!number) {
        return response.status(400).json({error: 'Number Missing'})
    }
    if (persons.some(person => person.name === name)){
        return response.status(400).json({error: 'Name must be unique'})
    }

    const person = {
        name,
        number,
        id: generateId()
    }

    persons = persons.concat(person)

    response.json(person)
})

const PORT = 3001
app.listen(PORT, ()=> {
    console.log(`App running in port ${PORT}`);
})
