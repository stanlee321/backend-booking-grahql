const express = require('express');
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const mongoose = require("mongoose");

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');

const app = express();




app.use(bodyParser.json());

app.use("/graphql", graphqlHttp({
    schema: graphQlSchema, 
    rootValue:  graphQlResolvers,
    graphiql: true
})
)

mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.MONGO_DB_NAME}`)
    .then(() => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(`Error is: ${err}`)
    });

app.listen(3001);
