const client_id = "bbe174b6bc194beca6ed800b4b9409ea";
const redirect_uri = "https://tom-seifert.netlify.app/callback";
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
  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(
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
}

document.getElementById("search-button").addEventListener("click", function () {
  const query = document.getElementById("song-query").value;
  searchSpotify(query);
});

function searchSpotify(query) {
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
            <button onclick="addToQueue('${track.uri}')">Add to Queue</button>
          `;
    resultsDiv.appendChild(trackElement);
  });
}

function addToQueue(uri) {
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
