# Google OAuth Setup Guide

This guide will help you configure Google OAuth authentication for your LearnStream AI application.

## Prerequisites

- A Supabase project (already set up)
- A Google Cloud account (free to create)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "LearnStream AI")
5. Click "Create"

## Step 2: Configure OAuth Consent Screen

1. In the Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type (unless you have a Google Workspace)
3. Click **Create**

### Fill in the required information:

**App information:**
- **App name**: LearnStream AI (or your app name)
- **User support email**: Your email address
- **App logo**: (Optional) Upload your app logo

**App domain:**
- **Application home page**: `https://your-domain.com` (or `http://localhost:5173` for development)
- **Privacy policy**: (Optional for development)
- **Terms of service**: (Optional for development)

**Authorized domains:**
- Add your domain (e.g., `your-domain.com`)
- For development, you can skip this

**Developer contact information:**
- Add your email address

4. Click **Save and Continue**

### Scopes:
5. Click **Add or Remove Scopes**
6. Add these scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
7. Click **Update** → **Save and Continue**

### Test users (for development):
8. Click **Add Users**
9. Add your test email addresses
10. Click **Save and Continue**

11. Review and go back to dashboard

## Step 3: Create OAuth 2.0 Client ID

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application** as the application type
4. Enter a name (e.g., "LearnStream AI Web Client")

### Configure the OAuth client:

**Authorized JavaScript origins:**
Add these URLs:
```
http://localhost:5173
https://your-production-domain.com
```

**Authorized redirect URIs:**
Add your Supabase callback URL:
```
https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
```

To find your exact callback URL:
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Click on **Google** provider
4. Copy the **Callback URL (for OAuth)** shown there

5. Click **Create**
6. A dialog will show your **Client ID** and **Client Secret**
7. **Important**: Copy both values - you'll need them for Supabase

## Step 4: Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google** in the list and click to expand it

### Enable and configure Google provider:

1. Toggle **Enable Sign in with Google** to ON
2. Fill in the credentials:
   - **Client ID**: Paste the Client ID from Google Cloud
   - **Client Secret**: Paste the Client Secret from Google Cloud
3. (Optional) Configure additional settings:
   - **Skip nonce check**: Leave unchecked for better security
   - **Authorized Client IDs**: Leave empty unless you have mobile apps
4. Click **Save**

## Step 5: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/auth`

3. Click the "Continue with Google" button

4. You should be redirected to Google's sign-in page

5. Sign in with your Google account (use a test user if in development mode)

6. After successful authentication, you'll be redirected back to your dashboard

## Step 6: Production Deployment

### Update Google OAuth URLs:

1. Go to Google Cloud Console → **APIs & Services** → **Credentials**
2. Click on your OAuth 2.0 Client ID
3. Add your production URLs:

**Authorized JavaScript origins:**
```
https://your-production-domain.com
```

**Authorized redirect URIs:**
```
https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
```

4. Click **Save**

### Verify OAuth Consent Screen:

1. Go to **OAuth consent screen**
2. Click **Publish App** to make it available to all users
3. (Optional) Submit for verification if you need more than 100 users

## Troubleshooting

### "Access blocked: This app's request is invalid"

**Problem**: OAuth consent screen not properly configured

**Solution**:
- Ensure you've added authorized domains in Google Cloud Console
- Verify the redirect URI matches exactly with Supabase callback URL
- Check that the OAuth consent screen is published

### "redirect_uri_mismatch" error

**Problem**: The redirect URI doesn't match

**Solution**:
1. Copy the exact callback URL from Supabase Dashboard
2. Add it to Authorized redirect URIs in Google Cloud Console
3. Make sure there are no trailing slashes or typos

### User stuck on loading screen

**Problem**: Authentication callback not handled properly

**Solution**:
- Check browser console for errors
- Verify Supabase URL and keys in your `.env` file
- Clear browser cache and cookies

### "Email not verified" error

**Problem**: Google account email not verified

**Solution**:
- Ask user to verify their Google email
- Or disable email verification in Supabase temporarily (not recommended)

### In development mode: "This app is blocked"

**Problem**: OAuth app is in testing mode

**Solution**:
- Add test users in Google Cloud Console → OAuth consent screen → Test users
- Or publish the app (for production)

## Security Best Practices

### 1. Restrict API Keys
In Google Cloud Console:
- Go to **APIs & Services** → **Credentials**
- Click on your API key
- Set **Application restrictions**
- Set **API restrictions**

### 2. Use HTTPS in Production
- Always use HTTPS for production URLs
- Never use HTTP for OAuth redirects in production

### 3. Keep Secrets Secure
- Never commit Client Secret to version control
- Store secrets in environment variables
- Use Supabase's secure storage for credentials

### 4. Monitor Usage
- Check Google Cloud Console for authentication usage
- Review Supabase Auth logs regularly
- Set up alerts for unusual activity

### 5. Token Refresh
- Supabase automatically handles token refresh
- Tokens expire after 1 hour by default
- Session refresh happens automatically

## Additional Features

### Get User Profile Data

After Google sign-in, you can access Google profile data:

```typescript
import { useUser } from '@/hooks/useUser';

function UserProfile() {
  const { user } = useUser();
  
  // Access Google profile data
  const googleAvatar = user?.user_metadata?.avatar_url;
  const googleName = user?.user_metadata?.full_name;
  const googleEmail = user?.email;
  
  return (
    <div>
      <img src={googleAvatar} alt={googleName} />
      <h2>{googleName}</h2>
      <p>{googleEmail}</p>
    </div>
  );
}
```

### Link Multiple Providers

Users can link both email and Google accounts:

```typescript
// User signs up with email first
await signUp(email, password);

// Later, they can link Google
await signInWithGoogle();

// Now they can sign in with either method
```

### Unlink Google Account

```typescript
const { data, error } = await supabase.auth.unlink({
  provider: 'google'
});
```

## Testing Checklist

- [ ] Google OAuth credentials configured in Supabase
- [ ] "Continue with Google" button appears on auth page
- [ ] Clicking button redirects to Google sign-in
- [ ] After Google sign-in, user is redirected to dashboard
- [ ] User profile created in database
- [ ] User can sign out and sign in again
- [ ] Protected routes work correctly
- [ ] User metadata (name, avatar) is saved

## Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google Auth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [OAuth 2.0 Best Practices](https://tools.ietf.org/html/rfc6749)

## Support

If you encounter issues:
1. Check Supabase Auth logs in Dashboard → Authentication → Logs
2. Check browser console for JavaScript errors
3. Verify all URLs match exactly
4. Review Google Cloud Console credentials

---

**Next Steps**: Once Google authentication is working, you can add more providers like GitHub, Facebook, or Microsoft by following similar steps in Supabase.


