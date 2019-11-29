const express = require('express');
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const Event = require("./models/event");
const User = require("./models/user");

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

        type User {
            _id: ID!
            email: String!
            password: String
        }


        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String! 
        }
        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]! 
        }

        type RootMutation{
            createEvent(eventInput: EventInput): Event 
            createUser(userInput: UserInput): User
        }


        
        schema {
            query: RootQuery
            mutation: RootMutation
        }

        `
    ), rootValue: { // Resolvers
        events: () => {
            return Event.find()
                .then(events => {
                    return events.map(event => {
                        return {
                            ...event._doc, _id: event.id
                        };
                    })
                })
                .catch(err => {
                    throw err
                })
        },
        createEvent: (args) => {

            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date),
                creator: "5de12b165a515519b12a110a"
            })
            
            // aux var 
            let createdEvent;

            return event
                .save()
                .then(result => {
                    createdEvent = {
                        ...result._doc, _id: event._doc._id.toString()
                    }
                    // add the event to the User 
                    return User.findById("5de12b165a515519b12a110a")
                })
                .then(user => {
                    if (!user) {
                        throw new Error("User already exist.")
                    }
                    // call createdEvent user method
                    user.createdEvent.push(event);

                    return user.save();
                })
                .then( result => {
                    return  createdEvent;
                    
                })
                .catch(err => {
                    console.log(`Error in mongo save${err}`)
                    throw err;
                });
        },
        createUser: (args) => {
            // look for a user in db
            return User
                .findOne({
                    email: args.userInput.email
                })
                .then(user => {
                    if (user) {
                        throw new Error("User exist already")
                    }
                    return bcrypt
                        .hash(args.userInput.password, 12)
                })
                .then(hashedPassword => {
                    const user = new User({ 
                        email: args.userInput.email,
                        password: hashedPassword
                    });
                    return user.save()
                })
                // the result from the user creation as a query
                .then(result => {
                    return {
                        ...result._doc, password: null, _id: result.id
                    }
                })
                .catch(err => {
                    throw err;

                })

        }
    },
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
