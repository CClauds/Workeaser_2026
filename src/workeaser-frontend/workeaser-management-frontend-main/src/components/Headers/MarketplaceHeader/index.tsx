// import { Input } from "@components/FormElements/Input";
import { withDelay } from "@utils/helpers";
import React, { ChangeEvent, useEffect, useState } from "react";
import { getGeoLocation } from "services/map";
import { Suggestion } from "types";
import { Feature } from "types/mapbox";
import styles from "./styles.module.scss";

let timeout: NodeJS.Timeout;

interface MarketplaceHeaderProps {}
export const MarketplaceHeader: React.FC<MarketplaceHeaderProps> = () => {
  const [searchLocations, setSearchLocations] = useState<Feature[]>();
  const [searchSuggestions, setSearchSuggestions] = useState<Suggestion[]>();

  useEffect(() => {
    renderSuggestionItem(searchLocations);
  }, [searchLocations]);

  const handleLocationTextChange = async (e: ChangeEvent<HTMLInputElement>) => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      const locations = await getGeoLocation(e.target.value);
      console.log("locations", locations);
      setSearchLocations(locations.features);
    }, 750);
  };

  const renderSuggestionItem = (locations: Feature[]) => {
    if (locations) {
      const array = locations.map((feature) => ({
        id: feature.id,
        fulltext: feature.place_name,
        longitude: feature.center[0],
        latitude: feature.center[1],
      }));
      setSearchSuggestions(array);
    }
  };

  return (
    <header className={styles.container}>
      {/* <Input
        label="What are you searching for?"
        icon="search"
        placeholder="Service or Product Name"
      />
      <Input
        label="Write the Location:"
        icon="location"
        placeholder="Address, City or Zip Code"
        onChange={handleLocationTextChange}
        suggestions={searchSuggestions}
      /> */}
    </header>
  );
};
