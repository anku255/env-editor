import NextAuth from "next-auth";
import Providers from "next-auth/providers";

const options = {
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn(user, account, profile) {
      if (account.provider === 'google' &&
          profile.verified_email === true &&
          profile.email.endsWith('@ivypods.com')) {
        return true
      } else {
        return false
      }
    },
  }
};

export default (req, res) => NextAuth(req, res, options);
