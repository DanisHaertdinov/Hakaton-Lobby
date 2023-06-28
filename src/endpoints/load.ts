type Methods = "GET" | "POST" | "PUT" | "DELETE";

const DOMAIN = process.env.VERCEL_URL || "localhost:3000";

type RequestParams =
  | {
      endpoint: string;
      method: Exclude<Methods, "GET">;
      body: Record<string, unknown>;
    }
  | {
      endpoint: string;
      method?: "GET";
      body?: never;
    };

export const load = async <T>({
  endpoint,
  method = "GET",
  body = {},
}: RequestParams): Promise<T> => {
  const params =
    method === "GET" ? { method } : { method, body: JSON.stringify(body) };

  const response = await (
    await fetch(`http://${DOMAIN}/api/${endpoint}`, {
      ...params,
    })
  ).json();

  return response;
};
