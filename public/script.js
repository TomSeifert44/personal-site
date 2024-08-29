const client_id = "bbe174b6bc194beca6ed800b4b9409ea";
const redirect_uri = "https://tom-seifert.netlify.app/callback"; // Ensure this matches exactly
const state = generateRandomString(16);

function generateRandomString(length) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}

function redirectToSpotifyAuth() {
  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=token&redirect_uri=${encodeURIComponent(
    redirect_uri
  )}&state=${state}`;
  window.location.href = spotifyAuthUrl;
}

function getAccessToken() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get("access_token");
}

// Automatically redirect to Spotify login if no access token is found
const accessToken = getAccessToken();
if (!accessToken) {
  redirectToSpotifyAuth();
} else {
  console.log("Access token:", accessToken);
  // You can proceed with API calls here now that the access token is available
}

// Function to handle search and queue functionality as before...
// Your existing search and add to queue code follows
