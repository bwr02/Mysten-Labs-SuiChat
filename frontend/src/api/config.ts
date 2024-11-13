import { env } from '../config/env';

export const CONFIG = {
    MESSAGE_CONTRACT: {
        packageId: import.meta.env.VITE_PACKAGE_ID || '0x6f06ff51a46a11e1eacb086822eb42405a1c4636971a4d8b8eccdf55c3b39a9d',
    },
    NETWORK_URL: env.NETWORK_URL
};
