node.js data service development

## MongoDB administration ##
To create user in MongoDB:
# Login as admin<br>
`mongo admin --username root --password PWD`

Find root PWD in Amazon EC2 console > Actions > Instance Setting > Get System Log

# `db = db.getSiblingDB('testDB')`
`db.createUser({user:"USER", pwd:"PWD", roles: ["readWrite"]})`

# Login as new user
mongo testDB --username USER --password PWD

## Starting and stopping the node.js server ##
Install forever package:
`npm install forever -g`

Start/stop:<br>
`forever start bin/www`<br>
`forever stop bin/www`
