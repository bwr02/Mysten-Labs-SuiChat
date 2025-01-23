import { suinsClient } from "../suinsClient";
import { suiClient } from "../suiClient";

export const getSuiNInfo = async (name: string) => {
    const nameRecord = await suinsClient.getNameRecord(name);
    console.log(nameRecord?.targetAddress);
    return nameRecord?.targetAddress;
}
