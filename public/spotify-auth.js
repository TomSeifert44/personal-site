export function authenticate() {
  // Your authentication code

  const fetch = require("node-fetch"); // Ensure you have node-fetch installed

  const client_id = "bbe174b6bc194beca6ed800b4b9409ea";
  const client_secret = "02d110f9286f4c7892cb5be8c807db69";
  const redirect_uri = "https://tom-seifert.netlify.app/callback"; // Update this for production

  exports.handler = async function (event, context) {
    const code = event.queryStringParameters.code;
    const state = event.queryStringParameters.state;

    if (!code || !state) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request" }),
      };
    }

    const authOptions = {
      url: "https://accounts.spotify.com/api/token",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(client_id + ":" + client_secret).toString("base64"),
      },
      body: new URLSearchParams({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      }),
    };

    try {
      const response = await fetch(authOptions.url, authOptions);
      const body = await response.json();

      if (response.ok) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            access_token: body.access_token,
            refresh_token: body.refresh_token,
          }),
        };
      } else {
        return {
          statusCode: response.status,
          body: JSON.stringify({ error: body.error }),
        };
      }
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }
  };
}
