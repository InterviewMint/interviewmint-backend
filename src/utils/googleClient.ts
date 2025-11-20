import { OAuth2Client } from "google-auth-library";

export const googleClient = new OAuth2Client({
  client_id: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.OAUTH_CLIENT_SECRET!,
  redirectUri: process.env.OAUTH_REDIRECT_URI!,
});
