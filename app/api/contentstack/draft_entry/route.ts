import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

// Export POST handler
export async function POST(req: Request) {
  // Ensure only POST requests are processed
  if (req.method !== "POST") {
    return NextResponse.json(
      { error: "Method Not Allowed. Only POST requests are allowed." },
      { status: 405 }
    );
  }

  // Extract the metadata ID from the URL query parameters
  const url = new URL(req.url); // Create a URL object from the request URL
  const appToken = url.searchParams.get("app-token");
  const currentBranch = url.searchParams.get("branch");

  // Get the Stack API key from the environment variables
  const apiKey = process.env.CONTENTSTACK_API_KEY;

  if (appToken && currentBranch) {
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
        const { draftEntry } = await req.json(); // Parsing the JSON body
        console.log(draftEntry);

        if (!draftEntry) {
          return NextResponse.json(
            { error: "draftEntry parameter is missing in the request body." },
            { status: 400 }
          );
        }

        try {
          // Get the API URL
          const apiUrl = `${mgmtApiDomain}/v3/content_types/draft/entries?locale=en-us`;

          const postObject = {
            method: "POST", // We want to create a draft entry (POST request)
            headers: {
              "Content-Type": "application/json",
              api_key: apiKey, // API Key now guaranteed to be defined
              authorization: authorizationToken, // Access Token now guaranteed to be defined
              branch: currentBranch,
            },
            body: JSON.stringify({ entry: draftEntry }), // Send the draft entry as JSON in the body
          };

          // Make the API call to Contentstack to create the draft entry
          const createDraftEntryResponse = await fetch(apiUrl, postObject);

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
            console.info(createDraftEntryResponse);
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
      {
        error:
          "Missing required parameters. App Token is:" +
          appToken +
          " and Branch is: " +
          currentBranch,
      },
      { status: 400 }
    );
  }
}
