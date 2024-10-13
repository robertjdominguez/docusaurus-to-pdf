import { scrapeSidebar } from "../../src/sidebar/finder";

describe("Find the sidebar", () => {
  const baseUrl = "https://hasura.io";

  it("should return an empty array if there is no sidebar", async () => {
    const url = `https://www.google.com`;

    // Act
    const result = await scrapeSidebar(url, baseUrl);

    // Assert
    expect(result.length).toEqual(0);
  });

  it("should filter sidebars by required directories", async () => {
    const url = `https://hasura.io/docs/3.0`;
    const requiredDirs = ["support"];

    // Act
    const result = await scrapeSidebar(url, baseUrl, requiredDirs);

    // Assert
    expect(result.length).toBe(requiredDirs.length);
  });

  it("should expand subdirectories recursively", async () => {
    const url = `https://hasura.io/docs/3.0`;
    const requiredDirs = ["auth"];
    const expectedResult = [
      {
        text: "Auth",
        canonicalLink: "/docs/3.0/auth/overview/",
        path: "/docs/3.0/auth/overview/",
        subItems: [
          {
            text: "Authentication",
            canonicalLink: "/docs/3.0/auth/authentication/",
            path: "/docs/3.0/auth/authentication/",
            subItems: [
              {
                text: "JWT",
                canonicalLink: "/docs/3.0/auth/authentication/jwt/",
                path: "/docs/3.0/auth/authentication/jwt/",
                subItems: [
                  {
                    text: "Enabling JWT Authentication",
                    canonicalLink: "/docs/3.0/auth/authentication/jwt/setup",
                    path: "/docs/3.0/auth/authentication/jwt/setup",
                  },
                  {
                    text: "Providers",
                    canonicalLink:
                      "/docs/3.0/auth/authentication/jwt/providers",
                    path: "/docs/3.0/auth/authentication/jwt/providers",
                  },
                  {
                    text: "Set up a Test JWT",
                    canonicalLink:
                      "/docs/3.0/auth/authentication/jwt/setup-test-jwt",
                    path: "/docs/3.0/auth/authentication/jwt/setup-test-jwt",
                  },
                ],
              },
              {
                text: "Webhook",
                canonicalLink: "/docs/3.0/auth/authentication/webhook/",
                path: "/docs/3.0/auth/authentication/webhook/",
                subItems: [
                  {
                    text: "Enabling Webhook Authentication",
                    canonicalLink:
                      "/docs/3.0/auth/authentication/webhook/setup",
                    path: "/docs/3.0/auth/authentication/webhook/setup",
                  },
                  {
                    text: "Enabling Admin and Unauthenticated Requests",
                    canonicalLink:
                      "/docs/3.0/auth/authentication/webhook/special-roles",
                    path: "/docs/3.0/auth/authentication/webhook/special-roles",
                  },
                ],
              },
            ],
          },
          {
            text: "Authorization",
            canonicalLink: "/docs/3.0/auth/authorization/index",
            path: "/docs/3.0/auth/authorization/index",
          },
        ],
      },
    ];

    // Act
    const result = await scrapeSidebar(url, baseUrl, requiredDirs);

    // Assert
    expect(result).toStrictEqual(expectedResult);
  }, 20000);
});
