import React from "react";
import { Redirect } from "expo-router";

export default function HomeScreen() {
  console.log("Home screen (iOS) redirecting to Discover");
  // Redirect to the Discover tab which is the main home feed
  return <Redirect href="/(tabs)/discover" />;
}
