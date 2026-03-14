import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

actor {
  let selectedCities = Map.empty<Principal, Text>();

  let prayerTimes = Map.fromIter(
    [
      ("Mecca", ["05:00", "12:15", "15:30", "18:45", "20:00"]),
      ("Medina", ["05:05", "12:20", "15:35", "18:50", "20:05"]),
      ("Cairo", ["04:50", "12:10", "15:25", "18:40", "19:55"]),
      ("Istanbul", ["04:40", "12:00", "15:15", "18:30", "19:45"]),
      ("London", ["04:30", "11:50", "15:05", "18:20", "19:35"]),
    ].values()
  );

  public shared ({ caller }) func setSelectedCity(city : Text) : async () {
    if (not prayerTimes.containsKey(city)) {
      Runtime.trap("City not supported with hardcoded prayer times");
    };
    selectedCities.add(caller, city);
  };

  public query ({ caller }) func getSelectedCity() : async Text {
    switch (selectedCities.get(caller)) {
      case (null) { Runtime.trap("No city selected for this user") };
      case (?city) { city };
    };
  };

  public query ({ caller }) func getPrayerTimesForCity(city : Text) : async [Text] {
    switch (prayerTimes.get(city)) {
      case (null) { Runtime.trap("City not found") };
      case (?times) { times };
    };
  };

  public query ({ caller }) func getUserPrayerTimes() : async [Text] {
    switch (selectedCities.get(caller)) {
      case (null) { Runtime.trap("No city selected for this user") };
      case (?city) {
        switch (prayerTimes.get(city)) {
          case (null) { Runtime.trap("Prayer times not found for selected city") };
          case (?times) { times };
        };
      };
    };
  };

  public query ({ caller }) func getTodaysHijriDate() : async Text {
    "1445-09-01";
  };
};
