import {REGION} from "../../../entities/enums";

export interface TeamDto {
    name: string;
    countryCode: string;
    flag: string;
    region: REGION
}