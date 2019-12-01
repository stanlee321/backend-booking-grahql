const bcrypt = require("bcryptjs");
const Event = require("../../models/event");
const User = require("../../models/user");

// Function handlers

// const events = eventIds => {
//     return Event.find({ _id: { $in: eventIds } })
//         .then(events => {
//             return events.map(event => {
//                 return {
//                     ...event._doc,
//                     _id: event.id, 
//                     date: new Date(event._doc.date).toISOString(),
//                     creator: user.bind(this, event.creator)
//                 }
//             })
//         }).catch(err => {
//             throw err;
//         })
// } 

const events = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } });

        return events.map(event => {
            return {
                ...event._doc,
                _id: event.id, 
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event.creator)
            }
        });

    }catch (err) {
        throw err;
    }

} 


const user = userId => {
    return User.findById(userId)
        .then(user => {
            return { ...user._doc, 
                    _id: user.id, 
                    //date: new Date(user._doc.date).toISOString(),
                    createdEvents: events.bind(this, user._doc.createdEvents) }
        })  
        .catch(err => {
            throw err
        })
}





module.exports = { // Resolvers
    events: async () => {
        try {
            const events = await Event.find()
            return events.map(event => {
                    return {
                        ...event._doc,
                        _id: event.id,
                        date: new Date(event._doc.date).toISOString(),
                        creator: user.bind(this, event._doc.creator)
                    };
                })
            
        }catch (err) {
            throw err

        }


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
                    ...result._doc, 
                    _id: event._doc._id.toString(),
                    creator: user.bind(this, result._doc.creator)
                } 
                // add the event to the User 
                return User.findById("5de12b165a515519b12a110a")
            })
            .then(user => {
                if (!user) {
                    throw new Error("User already exist.")
                }
                // call createdEvent user method
                user.createdEvents.push(event);

                return user.save();
            })
            .then(result => {
                return createdEvent;

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
}