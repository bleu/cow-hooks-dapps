import { GraphQLClient } from "graphql-request";

const BASE_URL = "https://blue-api.morpho.org/graphql";

export const MORPHO_GQL_CLIENT = new GraphQLClient(BASE_URL);
