import { suinsClient } from "../suinsClient";

export const getSuiNInfo = async (name: string) => {
    const nameRecord = await suinsClient.getNameRecord(name);
    console.log(nameRecord);
    return nameRecord;
}

console.log(getSuiNInfo('demo.sui'))

