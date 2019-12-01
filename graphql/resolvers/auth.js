const bcrypt = require("bcryptjs");
const User = require("../../models/user");


// RESOLVERS
module.exports = { // Resolvers
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

    },

}