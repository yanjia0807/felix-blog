import { useMutation } from "@tanstack/react-query";
import client from "./client";

export async function register(data: any) {
  const url = "/api/auth/local/register";
  const params = {
    username: data.username,
    email: data.email,
    password: data.password,
  };
  const response = await client.post(url, params);
  return response.data;
}

export async function login(data: any) {
  const url = "/api/auth/local";
  const params = {
    identifier: data.identifier,
    password: data.password,
  };
  const response = await client.post(url, params);
  return response.data;
}
