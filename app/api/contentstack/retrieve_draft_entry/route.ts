import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

// Export POST handler
export async function GET(req: Request) {
  // Ensure only POST requests are processed
  if (req.method !== "GET") {
    return NextResponse.json(
      { error: "Method Not Allowed. Only GET requests are allowed." },
      { status: 405 }
    );
  }

  // Extract the metadata ID from the URL query parameters
  const url = new URL(req.url); // Create a URL object from the request URL
  const appToken = url.searchParams.get("app-token");
  const currentBranch = url.searchParams.get("branch");

  // Get the Stack API key from the environment variables
  const apiKey = process.env.CONTENTSTACK_API_KEY;
  let appTokenIsValid = false;

  if (appToken !== null && appToken !== "") {
    // try {
    // Fetch the public keys from Contentstack
    const response = await fetch(
      "https://app.contentstack.com/.well-known/public-keys.json"
    );
    const publicKey = await response.json();
    console.log("Public Key", publicKey);

    // Verify the appToken using the Contentstack signing key
    const decodedToken = jwt.verify(
      appToken,
      publicKey["signing-key"]
    ) as JwtPayload;

    // Now you can safely access the decoded token's properties
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
      app_uid,
      installation_uid,
      organization_uid,
      user_uid,
      stack_api_key,
    } = decodedToken;

    console.log("Decoded Token", decodedToken);
    console.info("App token is valid!");

    // Set the appTokenIsValid flag to true if the token is valid
    appTokenIsValid = true;
  }

  if (appToken && currentBranch && appTokenIsValid) {
    try {
      // Decode the app-token (assuming it's a JWT)
      const decodedToken = jwt.decode(appToken) as JwtPayload | null;

      if (!decodedToken) {
        return NextResponse.json({ error: "Invalid token" }, { status: 400 });
      }

      // Check if the decoded token contains a matching API key
      if (decodedToken.stack_api_key === apiKey) {
        // Ensure the API key and access token are defined
        const authorizationToken = process.env.CONTENTSTACK_MANAGEMENT_API_KEY;
        const mgmtApiDomain = process.env.CONTENTSTACK_MANAGEMENT_API_DOMAIN;

        if (!apiKey || !authorizationToken) {
          return NextResponse.json(
            { error: "API key or access token is missing" },
            { status: 400 }
          );
        }

        // Extract the draftEntry from the request body
        try {
          //let entryUidToQuery = url.searchParams.get("entry-uid");
          let entryUidToQuery = "Test";
          
          // Get the API URL
          const apiUrl = `${mgmtApiDomain}/v3/content_types/draft/entries?locale=en-us&query={"entry_uid":"${entryUidToQuery}"}`;

          const headers = {
            method: "GET", // We want to create a draft entry (POST request)
            headers: {
              "Content-Type": "application/json",
              api_key: apiKey, // API Key now guaranteed to be defined
              authorization: authorizationToken, // Access Token now guaranteed to be defined
              branch: currentBranch,
            },
          };

          // Make the API call to Contentstack to create the draft entry
          const createDraftEntryResponse = await fetch(apiUrl, headers);

          // Check if the request was successful
          if (createDraftEntryResponse.ok) {
            // Log to server console.
            console.log(createDraftEntryResponse);

            // Parse the response data
            const createDraftEntryResponseJson =
              await createDraftEntryResponse.json();

            return NextResponse.json(
              {
                result: createDraftEntryResponseJson, // Assuming the response from Contentstack contains info about the draft entry creation
              },
              { status: 200 }
            );
          } else {
            return NextResponse.json(
              {
                error:
                  "Response was not OK. Failed to create draft entry or an internal error occurred.",
              },
              { status: 500 }
            );
          }
        } catch (error) {
          console.error(error);
          return NextResponse.json(
            {
              error:
                "Failed to create draft entry or an internal error occurred",
            },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "API Key does not match the token's API key" },
          { status: 403 }
        );
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      return NextResponse.json(
        { error: "Failed to decode token" },
        { status: 400 }
      );
    }
  } else {
    return NextResponse.json(
      { error: "Missing required parameters." },
      { status: 400 }
    );
  }
}
