import { getReverseGeoLocation } from "@services/map";
import { Tax, UnitsLocation } from "types";
import { Service } from "types/infos";
import { LocationType } from "types/locations";
import { v4 as uuid } from "uuid";

export const withDelay = async (fn: () => void, delay: number) => {
  let timeout: NodeJS.Timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
  };
};

export const trim = (text: string) => {
  return text.replace(/ /g, "").replace(/&/, "And");
};

export const trimLowerCase = (text: string) => {
  return trim(text).toLowerCase();
};

export const capitalizeFirstLetter = (value: string) => {
  if (!value) return "";
  const stringArray = value.split(" ");
  const capitalizedPhrase = stringArray.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
  return capitalizedPhrase.join(" ").trim();
};

export const toBase64 = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result?.toString() || "");
    reader.onerror = (error) => reject(error);
  });
};

export const getFileSize = (size: number) => {
  const fSExt = new Array("Bytes", "KB", "MB", "GB");
  let i = 0;
  while (size > 900) {
    size /= 1024;
    i++;
  }
  return `${Math.round(size * 100) / 100}${fSExt[i]}`;
};
export const getFileExactSize = (size: number) => {
  return `${Math.round(size * 100) / 100}`;
};

export const isObjEmpty = (obj: object) => {
  for (const _ in obj) {
    return false;
  }
  return true;
};

export const toLocalIsoDate = (date: Date) => {
  if (!date) return "";
  return `${date.getFullYear()}-${leadingZero(
    date.getMonth() + 1
  )}-${leadingZero(date.getDate())}`;
};
export const toLocalIsotime = (date: Date) =>
  `${leadingZero(date.getHours())}:${leadingZero(
    date.getMinutes()
  )}:${leadingZero(date.getSeconds())}`;

export const leadingZero = (value: string | number, n = 1) =>
  ("0".repeat(n) + value).slice(-(n + 1));

export const abbreviateName = (name: string): string => {
  if (!name) return "";
  const names = name.split(" ");
  return `${names[0].charAt(0).toUpperCase()}${names
    .at(-1)
    .charAt(0)
    .toUpperCase()}`;
};

export const formatServicesArray = (
  contractedservices: string[],
  services: Service[]
) =>
  contractedservices.map((item) => ({
    id: services.find((service) => service.slug === item)?.id,
  }));

export const ParseSmall = (uuid: string) => {
  return `#${uuid?.slice(0, 5) || "000"}`;
};

export const shiftPhotoArray = (
  array: string[],
  direction?: number,
  index = 1
): string[] => {
  const newArray = [...array];
  if (direction === 1) {
    for (let i = 0; i < index; i++) {
      const lastItem = newArray.pop();
      newArray.unshift(lastItem);
    }
  } else if (direction === -1) {
    for (let i = 0; i < index; i++) {
      const firstItem = newArray.shift();
      newArray.push(firstItem);
    }
  }

  return newArray;
};

type SuggestionProps = {
  location: LocationType;
  taxes_open_desk: Tax[];
  taxes_rooms: Tax[];
  taxes_meeting_room: Tax[];
  taxes_virtual_office: Tax[];
};
export const formatSuggestion = (locationRes: SuggestionProps) => {
  if (!locationRes) return [];

  const { location } = locationRes;

  const { desks, rooms, virtualOffices, meetrooms } = location;
  const desksSuggestions = desks?.map((service) => ({
    name: service.name,
    description: service.description,
    price: service.prices,
    taxes: formatTaxesCreatTaxesWithoutId(locationRes.taxes_open_desk),
    resource_id: service.id,
    service_type: service.service_type,
  }));
  const roomsSuggestions = rooms?.map((service) => ({
    name: service.name,
    description: service.description,
    price: service.prices,
    taxes: formatTaxesCreatTaxesWithoutId(locationRes.taxes_rooms),
    resource_id: service.id,
    service_type: service.service_type,
  }));
  const officesSuggestions = virtualOffices?.map((service) => ({
    name: service.name,
    description: service.description,
    price: service.prices,
    taxes: formatTaxesCreatTaxesWithoutId(locationRes.taxes_virtual_office),
    resource_id: service.id,
    service_type: service.service_type,
  }));
  const meetroomsSuggestions = meetrooms?.map((service) => ({
    name: service.name,
    description: service.description,
    price: service.price,
    taxes: formatTaxesCreatTaxesWithoutId(locationRes.taxes_meeting_room),
    resource_id: service.id,
    service_type: service.service_type,
  }));

  return [
    ...desksSuggestions,
    ...roomsSuggestions,
    ...officesSuggestions,
    ...meetroomsSuggestions,
  ];
};

const formatTaxesCreatTaxesWithoutId = (taxes: Tax[]) =>
  taxes.reduce(
    (formatedTaxes, tax) =>
      tax.recurring_type === "CREATED"
        ? [
            ...formatedTaxes,
            {
              id: uuid(),
              ...tax,
            },
          ]
        : formatedTaxes,

    []
  );

interface MapData {
  name: string;
  value?: number;
  children?: MapData[];
}

export const formatSunburstChartData = async (
  mapData: UnitsLocation[]
): Promise<MapData[]> => {
  let unitsData: MapData[] = [];
  for (let datum of mapData) {
    const { features } = await getReverseGeoLocation(
      datum.longitude,
      datum.latitude
    );
    // console.log(features);
    const country = features.find(
      (feature) => feature.id.indexOf("country") >= 0
    );
    const region = features.find(
      (feature) => feature.id.indexOf("region") >= 0
    );
    const city = features.find((feature) => feature.id.indexOf("place") >= 0);
    // console.log({
    //   country: country?.text,
    //   region: region?.text,
    //   city: city?.text,
    // });
    if (country && region && city) {
      const countryName = country.text;
      const regionName = region.text;
      const cityName = city.text;

      const countryInArray = unitsData.findIndex(
        (datum) => datum.name === countryName
      );
      if (countryInArray >= 0) {
        const regionInArray = unitsData[countryInArray].children.findIndex(
          (datum) => datum.name === regionName
        );

        if (regionInArray >= 0) {
          unitsData = unitsData.map((country, countryIndex) =>
            countryIndex === countryInArray
              ? {
                  ...country,
                  children: country.children.map((region, regionIndex) =>
                    regionIndex === regionInArray
                      ? {
                          ...region,
                          value: region.value + 1,
                        }
                      : region
                  ),
                }
              : country
          );

          const cityInArray = unitsData[countryInArray].children[
            regionInArray
          ].children.findIndex((datum) => datum.name === cityName);

          if (cityInArray >= 0) {
            unitsData = unitsData.map((country, countryIndex) =>
              countryIndex === countryInArray
                ? {
                    ...country,
                    children: country.children.map((region, regionIndex) =>
                      regionIndex === regionInArray
                        ? {
                            ...region,
                            children: region.children.map((city, cityIndex) =>
                              cityIndex === cityInArray
                                ? { ...city, value: city.value + 1 }
                                : city
                            ),
                          }
                        : region
                    ),
                  }
                : country
            );
          } else {
            unitsData[countryInArray].children[regionInArray].children.push({
              name: cityName,
              value: 1,
            });
          }
        } else {
          unitsData[countryInArray].children.push({
            name: regionName,
            value: 1,
            children: [
              {
                name: cityName,
                value: 1,
              },
            ],
          });
        }
      } else {
        unitsData.push({
          name: countryName,
          children: [
            {
              name: regionName,
              value: 1,
              children: [
                {
                  name: cityName,
                  value: 1,
                },
              ],
            },
          ],
        });
      }
    }
  }

  // console.log(unitsData);
  return unitsData;
};
