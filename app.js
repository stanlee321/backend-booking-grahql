const express = require('express');
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");

const Event  = require("./models/event");


const app = express();
const events = []; 


app.use(bodyParser.json()); 

app.use("/graphql", graphqlHttp({
    schema: buildSchema(
        // This is like 
        `
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String! 
        }
        type RootQuery {
            events: [Event!]! 
        }

        type RootMutation{
            createEvent(eventInput: EventInput): Event 
        }


        
        schema {
            query: RootQuery
            mutation: RootMutation
        }

        `
    ), rootValue: { // Resolvers
        events: ()=> {
            return Event.find()
            .then(events => {
                return  events.map( event =>  {
                    return  {
                        ...event._doc, _id: event.id
                    };
                })
            })
            .catch(err =>  {
                throw err
            })
        },
        createEvent: (args) => {
            // const event = {
            //     _id: Math.random().toString(),
            //     title: args.eventInput.title,
            //     description: args.eventInput.description,
            //     price: +args.eventInput.price,
            //     date: args.eventInput.date
            // }

            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date) 
            })  

            return event
            .save()
            .then( result => {
                console.log(`Response from save mongo ${result}`);
                return {
                    ...result._doc, _id: event._doc._id.toString()
                }

            })
            .catch( err => {
                console.log(`Error in mongo save${err}`)
            });
        }   
    },
    graphiql: true
}) 
)

mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.MONGO_DB_NAME}`)
    .then(() => {
        app.listen(3000);
    })
    .catch( err => {
        console.log(`Error is: ${err}`)
    });

app.listen(3001);
