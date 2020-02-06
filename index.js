const bodyParser = require('body-parser')
const express = require('express')
const logger = require('morgan')
const app = express()

const {
  fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler
} = require('./handlers.js')

const createGraph = require('ngraph.graph')
const graph = createGraph()

// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set('port', (process.env.PORT || 9001))

app.enable('verbose errors')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(poweredByHandler)

// --- SNAKE LOGIC GOES BELOW THIS LINE ---
const plotFood = points => {
  let count = 0
  points.forEach(point => {
    graph.addNode(`food-${count}`, point);
    count++
  })
}

const plotMe = points => {
  let count = 0
  points.forEach(point => {
    graph.addNode(`me-${count}`, point);
    count++
  })
}

// Handle POST request to '/start'
app.post('/start', (request, response) => {
  // NOTE: Do something here to start the game

  // Response data
  const data = {
    color: '#DFFF00',
    headType: 'bendr',
    tailType: 'pixel'
  }

  return response.json(data)
})

// Handle POST request to '/move'
app.post('/move', (request, response) => {
  // NOTE: Do something here to generate your move
  plotFood(request.board.food)
  plotMe(request.you)

  const pathFinder = path.aStar(graph)
  const foundPath = pathFinder.find('me', 'food-1')
  console.log(foundPath[0])


  // Response data
  const data = {
    move: 'up', // one of: ['up','down','left','right']
  }

  return response.json(data)
})

app.post('/end', (request, response) => {
  // NOTE: Any cleanup when a game is complete.
  return response.json({})
})

app.post('/ping', (request, response) => {
  // Used for checking if this snake is still alive.
  return response.json({});
})

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})
