var check = require('../jsvat').check
  , request = require('request')
  , xmlparse = require('xml2js').parseString
  , _ = require('underscore')
  , Hogan = require('hjs')
  , fs = require('fs')
  , marked = require('marked')


exports.info = function(req, res, next) {
  fs.readFile(__dirname + '/../README.md', 'utf8', function(err, text) {
    var content = marked.parser( marked.lexer(text) )
    return res.render('info', {content: content})
  })
}


exports.index = function(req, res, next) {
  // function to serve ctx to client
  var serve = function(ctx) {
    if ( req.headers.accept.match(/^application\/json/) || req.query.json ) {
      return res.json(ctx)
    }
    if ( ctx.address ) {
      ctx.address = ctx.address.replace('\n', '<br>')
    }
    ctx.valid = ctx.valid ? 'Yes' : 'No'
    if ( ctx.simple ) {
      ctx.simple = 'Yes'
    }
    return res.render('index', ctx)
  }

  var vat = req.params.vat.toUpperCase().replace(/[^0-9A-Z]/g, '')
    , ctx = {
        valid: !!check(vat)
      , countryCode: vat.slice(0, 2)
      , vatNumber: vat.slice(2)
    }
  if (!ctx.valid || req.query.simple) {
    if ( req.query.simple ) {
      ctx.simple = true
    }
    return serve(ctx)
  }
  ctx.valid = false // this will be set properly by calling vies
  var opts = {
      uri: 'http://ec.europa.eu/taxation_customs/vies/services/checkVatService'
    , method: 'POST'
    , timeout: 15000 //(ms)
    , body: Hogan.fcompile(__dirname + '/../views/vies.hjs').render(ctx)
  }
  request(opts, function(err, response, body) {
    if (err) {
      ctx.error = err.code
      return serve(ctx)
    }
    xmlparse(body, {explicitRoot: false, explicitArray: false}, function(err, response) {
      if ( !err && response &&
                   response['soap:Body'] && 
                   response['soap:Body']['checkVatResponse'] ) {
        var data = response['soap:Body']['checkVatResponse']
        delete data['$']
        ctx = _.extend(ctx, data)
        ctx.valid = ctx.valid == 'true'
        return serve(ctx)
      }
      // error response
      if ( !err && response &&
                   response['soap:Body'] &&
                   response['soap:Body']['soap:Fault'] &&
                   response['soap:Body']['soap:Fault']['faultstring'] ) {
        ctx.error = response['soap:Body']['soap:Fault']['faultstring']
      }
      ctx.error = ctx.error || 'UNEXPECTED_RESPONSE_FROM_VIES'
      return serve(ctx)
    })
  })

}
