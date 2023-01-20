import { verifyPassword } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export default NextAuth({
  // Configure session options (for credentials you must use JWT)
  session: {
    strategy: 'jwt',
  },
  // Configure one or more authentication providers
  providers: [
    Credentials({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      //name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      //credentials: {
        //username: { label: "Username", type: "text", placeholder: "jsmith" },
        //password: {  label: "Password", type: "password" }
      //},
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        const client = await connectToDatabase();
        
        const usersCollection = await client.db().collection('users');

        const user = await usersCollection.findOne({ email: credentials.email });

        if (!user) {
          client.close()
          throw new Error('No user found!');
        }

        const isValid = await verifyPassword(credentials.password, user.password);

        if (!isValid) {
          client.close()
          throw new Error('Could not log you in!');
        }

        client.close();
        return { email: user.email };
      }
    })
  ],
});
