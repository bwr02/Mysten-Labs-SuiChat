// activeAddressStore.ts

// This variable holds the active address in memory.
let activeAddress: string = '';

// Setter: Update the active address.
export const setActiveAddress = (address: string): void => {
    activeAddress = address;
};

// Getter: Retrieve the active address.
export const getActiveAddress = (): string => activeAddress;