const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../Models/User");
const Auth = require("../Services");

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/auth/google/callback",
        },

        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({
                    email: profile.emails[0].value,
                });

                if (!user) {
                    user = await User.create({
                        email: profile.emails[0].value,
                        oauthProvider: "google",
                        oauthId: profile.id,
                        emailVerified: true,
                    });
                } else if (!user.oauthId) {
                    user.oauthProvider = "google";
                    user.oauthId = profile.id;
                    await user.save();
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

module.exports = passport;
