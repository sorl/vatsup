# VATsup

Use this service to lookup and validate a VAT number.

By default it will first check the VAT
number using pre defined patterns, if they indicate that it is valid then it
will validate properly using the [VIES service](http://ec.europa.eu/taxation_customs/vies/).

## Usage

To look up a VAT number just enter the number after the first slash for example:
```
http://vatsup.eu/XX001122334455
```

## Options

### JSON Response

If you want a JSON response, send a request `Accept` header starting with
`application/json` or a query parameter `json=1`.

### Simple validation

If you don't need to check against [VIES service](http://ec.europa.eu/taxation_customs/vies/) as done by default and only use
regexps pass the query parameter `simple=1`.
