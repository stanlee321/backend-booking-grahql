const Booking = require("../../models/booking");
const Event = require("../../models/event");
const { transformBooking, transformEvent } = require("./merge")


// RESOLVERS
module.exports = { // Resolvers

    bookings: async () => {
        try{
           const bookings = await  Booking.find();
           return bookings.map(booking => {
               return transformBooking(booking);
                } );
        }catch (err){
            throw err
        }
    },
    // Booking event resolver
    bookEvent: async args => {
        const fetchedEvent  = await Event.findOne({
            _id: args.eventId
        });

        const booking  = new Booking({
            user: "5de12b165a515519b12a110a",
            event: fetchedEvent
        });
        
        const result = await booking.save();

        return transformBooking(result);

    },
    cancelBooking: async  args => {
        try{
            const  booking = await Booking.findById(args.bookingId).populate('event');
            const event = transformEvent(booking.event);
            await Booking.deleteOne({ _id: args.bookingId})

            return event;
        }catch (err){
            throw err
        }
    }
}