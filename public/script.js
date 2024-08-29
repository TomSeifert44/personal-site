// Spotify Client Information
const client_id = "bbe174b6bc194beca6ed800b4b9409ea";
const redirect_uri = "https://tom-seifert.netlify.app/callback";
const state = generateRandomString(16); // You can generate this dynamically for security

// Function to generate a random string (used for state)
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

// Event listener for the login button
document.getElementById("login-button").addEventListener("click", function () {
  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(
    redirect_uri
  )}&state=${state}`;
  window.location.href = spotifyAuthUrl;
});

// Function to get the OAuth code from the URL query string
function getOAuthCode() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("code");
}

// Function to call Netlify function to exchange the code for an access token
function fetchAccessToken(oauthCode) {
  const url = `/.netlify/functions/spotify-auth?code=${oauthCode}&state=${state}`;

  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.access_token) {
        localStorage.setItem("spotify_access_token", data.access_token);
        return data.access_token;
      } else {
        console.error("Failed to get access token:", data.error);
        return null;
      }
    })
    .catch((error) => {
      console.error("Error fetching access token:", error);
      return null;
    });
}

// Function to get the access token from localStorage or fetch it using OAuth code
function getAccessToken() {
  const storedToken = localStorage.getItem("spotify_access_token");
  if (storedToken) {
    return Promise.resolve(storedToken);
  } else {
    const oauthCode = getOAuthCode();
    if (oauthCode) {
      return fetchAccessToken(oauthCode);
    } else {
      console.error("OAuth code not found.");
      return Promise.resolve(null);
    }
  }
}

// Use the access token
getAccessToken().then((accessToken) => {
  if (accessToken) {
    console.log("Access token:", accessToken);
    // Attach event listener for search button only after getting the token
    document
      .getElementById("search-button")
      .addEventListener("click", function () {
        const query = document.getElementById("song-query").value;
        searchSpotify(query, accessToken);
      });
  } else {
    console.error("Access token not found.");
  }
});

function searchSpotify(query, accessToken) {
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
    query
  )}&type=track`;

  fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      displaySearchResults(data.tracks.items);
    })
    .catch((error) => console.error("Error:", error));
}

function addToQueue(uri, accessToken) {
  const url = `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(
    uri
  )}`;

  fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => {
      if (response.ok) {
        alert("Song added to queue!");
      } else {
        return response.json().then((errorData) => {
          console.error("Failed to add song to queue:", errorData);
          alert(`Failed to add song to queue: ${errorData.error.message}`);
        });
      }
    })
    .catch((error) => console.error("Error:", error));
}

function displaySearchResults(tracks) {
  const resultsDiv = document.getElementById("search-results");
  resultsDiv.innerHTML = ""; // Clear previous results

  tracks.forEach((track) => {
    const trackElement = document.createElement("div");
    trackElement.className = "track";
    trackElement.innerHTML = `
            <p>${track.name} by ${track.artists
      .map((artist) => artist.name)
      .join(", ")}</p>
            <button onclick="addToQueue('${
              track.uri
            }', getAccessToken())">Add to Queue</button>
          `;
    resultsDiv.appendChild(trackElement);
  });
}
