const Event = require("../../models/event");
const User = require("../../models/user");


const { transformEvent } = require("./merge")


module.exports = { // Resolvers
    events: async () => {
        try {
            const events = await Event.find()
            return events.map(event => {
                    return transformEvent(event);
                })
            
        }catch (err) {
            throw err

        }
    },
    createEvent: (args, req) => {

        if (!req.isAuth) {
            throw new Error("Unauthenticated!");
        }

        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: req.userId
        })

        // aux var 
        let createdEvent;

        return event
            .save()
            .then(result => {
                createdEvent = transformEvent(result);
                // add the event to the User 
                return User.findById( req.userId )
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
    }
}