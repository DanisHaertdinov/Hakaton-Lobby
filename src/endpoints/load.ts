import { DOMAIN } from "../config";

type Methods = "GET" | "POST" | "PUT" | "DELETE";

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
  const domain = typeof window === 'undefined' ? DOMAIN : '';
  const url = `${domain}/api/${endpoint}`.replaceAll("//", "/");
  
  // TODO: вынести протокол в process.env.DOMAIN
  const response = await fetch(`http://${url}`, {
    ...params,
  });

  return response.json();
};
