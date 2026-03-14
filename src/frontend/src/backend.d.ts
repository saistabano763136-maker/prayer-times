import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface backendInterface {
    getPrayerTimesForCity(city: string): Promise<Array<string>>;
    getSelectedCity(): Promise<string>;
    getTodaysHijriDate(): Promise<string>;
    getUserPrayerTimes(): Promise<Array<string>>;
    setSelectedCity(city: string): Promise<void>;
}
