const bcrypt = require("bcryptjs");
const User = require("../../models/user");
const jwt = require("jsonwebtoken");


// RESOLVERS
module.exports = { // Resolvers

    // Mutation
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
    // Query
    login: async ({ email, password }) => {
        const user = await User.findOne({email: email});

        if (!user){
            throw new Error("User does not exist!");
        }
        const isEqual = await bcrypt.compare(password, user.password);

        if (!isEqual){
            throw new Error("Password is incorrect!");
        }

        const token = jwt.sign({ userId: user.id, email: user.email}, 
                                "somesupersecretkey",
                                {expiresIn: "1h"}
        );

        // return like AuthData GraphQl schema
        return  { userId:  user.id, token: token, tokenExpiration: 1}

    }

}