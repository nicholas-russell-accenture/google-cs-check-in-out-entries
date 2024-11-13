import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

// Export DELETE handler (not DEL, as Next.js looks for a DELETE method handler)
export async function DELETE(req: Request) {
  // Ensure only DELETE requests are processed
  if (req.method !== "DELETE") {
    return NextResponse.json(
      { error: "Method Not Allowed. Only DELETE requests are allowed." },
      { status: 405 }
    );
  }

  // Extract the metadata ID from the URL query parameters
  const url = new URL(req.url); // Create a URL object from the request URL
  const metadataId = url.searchParams.get("metadataId"); // Get the 'metadataId' query parameter
  const appToken = url.searchParams.get("app-token");
  const currentBranch = url.searchParams.get("branch");

  // Get the Stack API key from the environment variables
  const apiKey = process.env.CONTENTSTACK_API_KEY;

  if (appToken && currentBranch) {
    try {
      // Decode the app-token (assuming it's a JWT)
      const decodedToken = jwt.decode(appToken); // Decodes without verification (just to read the payload)

      // Debugging.
      //console.log(decodedToken);

      if (!decodedToken) {
        return NextResponse.json({ error: "Invalid token" }, { status: 400 });
      }

      // Check if the decoded token contains a matching API key
      if ((decodedToken as JwtPayload).stack_api_key == apiKey) {
        // Validate metadataId
        if (!metadataId || typeof metadataId !== "string") {
          return NextResponse.json(
            { error: "Metadata ID is required and must be a valid string" },
            { status: 400 }
          );
        }

        // Ensure the API key and access token are defined
        const authorizationToken = process.env.CONTENTSTACK_MANAGEMENT_API_KEY;
        const mgmtApiDomain = process.env.CONTENTSTACK_MANAGEMENT_API_DOMAIN;

        if (!apiKey || !authorizationToken) {
          return NextResponse.json(
            { error: "API key or access token is missing" },
            { status: 400 }
          );
        }

        try {
          // Get the metatdata and ensure it is entry lock metadata.
          const apiUrl = `${mgmtApiDomain}/v3/metadata/${metadataId}?include_branch=false`;

          // Make the API call to Contentstack to delete the metadata (method set to DELETE)
          const getMetadataResponse = await fetch(apiUrl, {
            method: "GET", // We want to make a DELETE request to the Contentstack API
            headers: {
              "Content-Type": "application/json",
              api_key: apiKey, // API Key now guaranteed to be defined
              authorization: authorizationToken, // Access Token now guaranteed to be defined
              branch: currentBranch
            },
          });

          // Check if the request was successful
          if (getMetadataResponse.ok) {
            // Parse the response data
            const getMetadataResponseJson = await getMetadataResponse.json();

            if (getMetadataResponseJson.metadata.EntryLocked) {
              // Make the API call to Contentstack to delete the metadata (method set to DELETE)
              const response = await fetch(apiUrl, {
                method: "DELETE", // We want to make a DELETE request to the Contentstack API
                headers: {
                  "Content-Type": "application/json",
                  api_key: apiKey, // API Key now guaranteed to be defined
                  authorization: authorizationToken, // Access Token now guaranteed to be defined
                  branch: currentBranch
                },
              });

              // Check if the request was successful
              if (!response.ok) {
                return NextResponse.json(
                  { error: "Failed to delete metadata from Contentstack" },
                  { status: response.status }
                );
              }

              // Parse the response data
              const data = await response.json();

              // Return the metadata deletion result along with the extensionUid and contentstackAppDomain
              return NextResponse.json(
                {
                  result: data, // Assuming the response from Contentstack contains info about the deletion
                },
                { status: 200 }
              );
            }

            return NextResponse.json(
              {
                error:
                  "Failed to delete metadata or an internal error occurred: properties do not match.",
              },
              { status: 500 }
            );
          } else {
            return NextResponse.json(
              {
                error:
                  "Failed to delete metadata or an internal error occurred: could not get existing metadata.",
              },
              { status: 500 }
            );
          }
        } catch (error) {
          console.error(error);
          return NextResponse.json(
            {
              error: "Failed to delete metadata or an internal error occurred",
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
    return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
  }
}
