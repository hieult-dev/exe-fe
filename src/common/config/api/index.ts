const GATEWAY_URL = import.meta.env.VITE_GATEWAY;

const AUTH_URL = `${GATEWAY_URL}/api/auth`;
const USER_URL = `${GATEWAY_URL}/api/user`;
const REFRESH_TOKEN_URL = `${GATEWAY_URL}/api/auth/refreshToken`;

export { GATEWAY_URL, AUTH_URL, USER_URL, REFRESH_TOKEN_URL };