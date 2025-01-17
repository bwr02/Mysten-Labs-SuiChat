import { suinsClient } from "../suinsClient";
import { suiClient } from "../suiClient";

export const getSuiNInfo = async (name: string) => {
    const nameRecord = await suinsClient.getNameRecord(name);
    console.log(nameRecord);
    return nameRecord;
}


interface ResolveNameServiceResponse {
    data: string[]; // Array of resolved names
    nextCursor?: string | null; // Cursor for pagination (optional)
    hasNextPage: boolean; // Whether there are more pages
}

export const reverseLookupSuiNS = async (address: string): Promise<string | null>  => {
    try {
    // Call the suix_resolveNameServiceNames method
    const response = await suiClient.call('suix_resolveNameServiceNames', [address]);

    // Cast the response to the expected type
    const resolvedNames = response as { result: ResolveNameServiceResponse };

    // Extract the list of names from the result
    const names = resolvedNames.result?.data;

    // Return the primary name (first in the list) or null if none exist
    return names && names.length > 0 ? names[0] : null;
  } catch (error) {
    console.error('Error performing reverse lookup:', error);
    return null;
  }
}


// Example usage
(async () => {
  const address = '0xcb4634806b80bfc969935294391fa38169b42da5d66303b2710d93af101c9509';
  const suiName = await reverseLookupSuiNS(address);

  if (suiName) {
    console.log(`The SuiNS name for the address is: ${suiName}`);
  } else {
    console.log('No SuiNS name found for the address.');
  }
})();



