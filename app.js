var express = require('express')
  , routes = require('./routes')
  , http = require('http')

var app = express()
  , port = process.env.PORT || 8000

app.set('view engine', 'hjs')

app.use(express.favicon());
app.use(express.logger('dev'))
app.use(express.bodyParser())
app.use(app.router)

app.get('/:vat', routes.index)


http.createServer(app).listen(port, function() {
  console.log('Express server listening on port ' + port)
})

