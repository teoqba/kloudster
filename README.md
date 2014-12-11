node.js data service development

## MongoDB administration ##
To create user in MongoDB:<br>
1) Login as admin <br>
`mongo admin --username root --password PWD`

Find root PWD in Amazon EC2 console > Actions > Instance Setting > Get System Log

2) `db = db.getSiblingDB('testDB')` <br>
`db.createUser({user:"USER", pwd:"PWD", roles: ["readWrite"]})`

3) Login as new user<br>
`mongo testDB --username USER --password PWD`

## Starting and stopping the node.js server ##
Install forever package:
`npm install forever -g`

Start/stop:<br>
`forever start bin/www`<br>
`forever stop bin/www`
