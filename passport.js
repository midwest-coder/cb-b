const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const User = require('./models/User')

const cookieExtractor = (req) => {
    let token = null
    if(req && req.cookies){
        token = req.cookies["access_token"]
    }
    return token
}

//authorization for any resources
passport.use(new JwtStrategy({
    jwtFromRequest: cookieExtractor,
    secretOrKey: "nh32899i32m908nvjkldmkjl8903f489fjnirefnvd90jdn3eyd8u9f0inrijofjrkcfid9j93"
}, (payload, done) => {
    User.findById({_id: payload.sub}, (err, user) => {
        if(err)
            return done(err)

        if(user)
            return done(null, user)
        else
            return done(null, false)
    })
}))

// authentication for login using local strategy
passport.use(new LocalStrategy((username, password, done) => {
    const lcUsername = username.toLowerCase()
    User.findOne({username: lcUsername},(err,user)=>{
        //potential database error
        if(err)
            return done(err)
        //no user exists
        if(!user)
            return done(null,false)

        //check that the password is correct
        user.comparePassword(password,done)
    })
}))