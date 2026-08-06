import { useDebounce } from "@hooks/useDebounce";
import { api } from "@services/api";
import { getGeoLocation } from "@services/map";
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { Space, SpacesResponse } from "types/client";
import { MeetingRoomType } from "types/cowork/locations/enum";
import { ServicesSlugEnum } from "types/enums";
import { AuthContext } from "./AuthContext";

interface SpacesProviderProps {
  children: ReactNode;
}

type ServiceType = keyof typeof ServicesSlugEnum;
type SearchAreaType = "MILES" | "KILOMETERS";
export type MeetingRoomCategories = keyof typeof MeetingRoomType;

interface MapViewState {
  longitude: number;
  latitude: number;
  zoom?: number;
}

export enum SpacesActionType {
  CHANGE_LOCATION = "CHANGE_LOCATION",
  CHANGE_SERVICE_TYPE = "CHANGE_SERVICE_TYPE",
  CHANGE_AREA_MEASUREMENT = "CHANGE_AREA_MEASUREMENT",
  CHANGE_AREA = "CHANGE_AREA",
  CHANGE_GEOLOCATION = "CHANGE_GEOLOCATION",
  CHANGE_PRICING_RANGE = "CHANGE_PRICING_RANGE",
  CHANGE_AMENITIES = "CHANGE_AMENITIES",
  CHANGE_SORTING = "CHANGE_SORTING",
  SET_VIEWSTATE = "SET_VIEWSTATE",
  SET_RESULT = "SET_RESULT",
  SET_IS_FETCHING = "SET_IS_FETCHING",
}
interface SpacesAction {
  type: SpacesActionType;
  payload: string | Space[] | any;
}
type Sort = "lowest_prices" | "highest_prices";

interface SpacesState {
  location: string;
  serviceType: ServiceType | "";
  searchAreaType: SearchAreaType;
  searchArea: string;
  geolocation: {
    lon: number;
    lat: number;
  };
  pricingRange: {
    start: number;
    end: number;
  };
  sort: Sort;
  amenities: number[];
  viewState: MapViewState;
  result: Space[];
  isFetching: boolean;
}

export enum VoFilterActionType {
  CHANGE_KEY_VALUE = "CHANGE_KEY_VALUE",
}
interface VoFilterAction {
  type: VoFilterActionType;
  payload: { key: string; value: string };
}
interface VoFilterState {
  directory: number;
  mailingHandling: number;
  phoneAnswering: number;
  voipService: number;
}

export enum OdFilterActionType {
  CHANGE_TYPE = "CHANGE_TYPE",
}
interface OdFilterAction {
  type: OdFilterActionType;
  payload: "EXCLUSIVE" | "SHAREABLE";
}
interface OdFilterState {
  type: "EXCLUSIVE" | "SHAREABLE";
}

export enum PrFilterActionType {
  CHANGE_SIZE = "CHANGE_SIZE",
}
interface PrFilterAction {
  type: PrFilterActionType;
  payload: number;
}
interface PrFilterState {
  size: number;
}

export enum MrFilterActionType {
  CHANGE_DATE = "CHANGE_DATE",
  CHANGE_GROUP_SIZE = "CHANGE_GROUP_SIZE",
  CHANGE_CATEGORIES = "CHANGE_CATEGORIES",
  CHANGE_KEY_VALUE = "CHANGE_KEY_VALUE",
}
interface MrFilterAction {
  type: MrFilterActionType;
  payload:
    | number
    | string
    | { key: string; value: string }
    | { checked: boolean; value: string };
}
interface MrFilterState {
  startDate: string;
  groupSize: number;
  categories: MeetingRoomCategories[];
  officeSupplies: 0 | 1;
  multimedia: 0 | 1;
  adaCompliant: 0 | 1;
  projector: 0 | 1;
  whiteboard: 0 | 1;
  eat: 0 | 1;
}

interface SpacesContextData {
  dispatch: Dispatch<SpacesAction>;
  state: SpacesState;
  voFilterDispatch: Dispatch<VoFilterAction>;
  voFilterState: VoFilterState;
  odFilterDispatch: Dispatch<OdFilterAction>;
  odFilterState: OdFilterState;
  prFilterDispatch: Dispatch<PrFilterAction>;
  prFilterState: PrFilterState;
  mrFilterDispatch: Dispatch<MrFilterAction>;
  mrFilterState: MrFilterState;
}

const SPACES_INITIAL_STATE: SpacesState = {
  location: "",
  serviceType: "",
  searchAreaType: "MILES",
  searchArea: "",
  geolocation: {
    lon: 0,
    lat: 0,
  },
  pricingRange: {
    start: 0,
    end: 0,
  },
  sort: null,
  amenities: [],
  viewState: {
    longitude: 0,
    latitude: 0,
    zoom: 13,
  },
  result: [],
  isFetching: false,
};

const VO_FILTERS_INITIAL_STATE = {
  directory: null,
  mailingHandling: null,
  phoneAnswering: null,
  voipService: null,
};
const OD_FILTERS_INITIAL_STATE = {
  type: null,
};
const PR_FILTERS_INITIAL_STATE = {
  size: 0,
};
const MR_FILTERS_INITIAL_STATE = {
  startDate: "",
  groupSize: 0,
  categories: [],
  officeSupplies: null,
  multimedia: null,
  adaCompliant: null,
  projector: null,
  whiteboard: null,
  eat: null,
};

export const SpacesContext = createContext({} as SpacesContextData);

export const SpacesProvider = ({ children }: SpacesProviderProps) => {
  const { user } = useContext(AuthContext);

  const [state, dispatch] = useReducer(spacesReducer, SPACES_INITIAL_STATE);
  const [voFilterState, voFilterDispatch] = useReducer(
    voFilterReducer,
    VO_FILTERS_INITIAL_STATE
  );
  const [odFilterState, odFilterDispatch] = useReducer(
    odFilterReducer,
    OD_FILTERS_INITIAL_STATE
  );
  const [mrFilterState, mrFilterDispatch] = useReducer(
    mrFilterReducer,
    MR_FILTERS_INITIAL_STATE
  );
  const [prFilterState, prFilterDispatch] = useReducer(
    prFilterReducer,
    PR_FILTERS_INITIAL_STATE
  );

  const debouncedSearchTerm = useDebounce(state.location, 500);
  let url = `/spaces?location=${debouncedSearchTerm}`;
  url += `&long=${state.geolocation.lon}`;
  url += `&lat=${state.geolocation.lat}`;
  url += `&search_area=${state.searchArea}`;
  url += `&search_area_type=${state.searchAreaType}`;
  url += `&service_type=${state.serviceType}`;
  if (state.sort) {
    url += `&${state.sort}=1`;
  }

  state.amenities.forEach((amenity) => {
    url += `&amenities[]=${amenity}`;
  });

  const fetchSpaces = async (fetchUrl: string) => {
    console.log(fetchUrl);
    dispatch({
      type: SpacesActionType.SET_IS_FETCHING,
      payload: true,
    });
    const { data: spaces } = await api.get<SpacesResponse>(fetchUrl);
    dispatch({ type: SpacesActionType.SET_RESULT, payload: spaces.result });
    dispatch({
      type: SpacesActionType.SET_IS_FETCHING,
      payload: false,
    });
  };

  useEffect(() => {
    const getUserLocation = async () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const text = `${position.coords.longitude},${position.coords.latitude}`;
          const location = await getGeoLocation(text);

          const place = location.features.find(
            (feature) => feature.id.indexOf("place") >= 0
          );
          dispatch({
            type: SpacesActionType.CHANGE_GEOLOCATION,
            payload: {
              lon: position.coords.longitude,
              lat: position.coords.latitude,
            },
          });
          const mapPayload: MapViewState = {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
          };
          dispatch({
            type: SpacesActionType.SET_VIEWSTATE,
            payload: mapPayload,
          });
          dispatch({
            type: SpacesActionType.CHANGE_LOCATION,
            payload: place.text,
          });
        },
        (e) => {}
      );
    };
    if (user) {
      getUserLocation();
    }
  }, [user]);

  useEffect(() => {
    const fetchLocations = async () => {
      const locations = await getGeoLocation(debouncedSearchTerm);
      if (!!locations?.features.length) {
        const [bestMatch] = locations.features;
        const [lon, lat] = bestMatch.center;
        const mapPayload: MapViewState = {
          longitude: lon,
          latitude: lat,
        };
        dispatch({
          type: SpacesActionType.SET_VIEWSTATE,
          payload: mapPayload,
        });
        dispatch({
          type: SpacesActionType.CHANGE_GEOLOCATION,
          payload: {
            lon,
            lat,
          },
        });
      }
    };

    if (debouncedSearchTerm) {
      fetchLocations();
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (!debouncedSearchTerm) {
      return dispatch({ type: SpacesActionType.SET_RESULT, payload: [] });
    }
    if (!state.serviceType) {
      fetchSpaces(url);
    }
  }, [
    debouncedSearchTerm,
    state.serviceType,
    state.searchAreaType,
    state.searchArea,
    state.geolocation,
    state.amenities,
  ]);

  useEffect(() => {
    if (state.serviceType === "VIRTUAL_OFFICE" && debouncedSearchTerm) {
      if (voFilterState.directory !== null) {
        url += `&vo_directory=${voFilterState.directory}`;
      }
      if (voFilterState.mailingHandling !== null) {
        url += `&vo_mailing_handling=${voFilterState.mailingHandling}`;
      }
      if (voFilterState.phoneAnswering !== null) {
        url += `&vo_phone_answering=${voFilterState.phoneAnswering}`;
      }
      if (voFilterState.voipService !== null) {
        url += `&vo_voip_service=${voFilterState.voipService}`;
      }
      if (state.pricingRange.end > 0) {
        url += `&vo_pricing_range_start=${state.pricingRange.start}`;
        url += `&vo_pricing_range_end=${state.pricingRange.end}`;
      }
      fetchSpaces(url);
    }
  }, [
    voFilterState,
    debouncedSearchTerm,
    state.sort,
    state.serviceType,
    state.searchAreaType,
    state.searchArea,
    state.geolocation,
    state.amenities,
    state.pricingRange,
  ]);
  useEffect(() => {
    if (state.serviceType === "OPEN_DESK" && debouncedSearchTerm) {
      if (odFilterState.type !== null) {
        url += `&od_desk_type=${odFilterState.type}`;
      }
      if (state.pricingRange.end > 0) {
        url += `&od_pricing_range_start=${state.pricingRange.start}`;
        url += `&od_pricing_range_end=${state.pricingRange.end}`;
      }
      fetchSpaces(url);
    }
  }, [
    odFilterState,
    debouncedSearchTerm,
    state.sort,
    state.serviceType,
    state.searchAreaType,
    state.searchArea,
    state.geolocation,
    state.amenities,
    state.pricingRange,
  ]);
  useEffect(() => {
    if (state.serviceType === "PRIVATE_ROOM" && debouncedSearchTerm) {
      url += `&pr_group_size=${prFilterState.size}`;
      if (state.pricingRange.end > 0) {
        url += `&pr_pricing_range_start=${state.pricingRange.start}`;
        url += `&pr_pricing_range_end=${state.pricingRange.end}`;
      }
      fetchSpaces(url);
    }
  }, [
    prFilterState,
    debouncedSearchTerm,
    state.sort,
    state.serviceType,
    state.searchAreaType,
    state.searchArea,
    state.geolocation,
    state.amenities,
    state.pricingRange,
  ]);
  useEffect(() => {
    if (state.serviceType === "MEETING_ROOM" && debouncedSearchTerm) {
      if (mrFilterState.officeSupplies !== null) {
        url += `&mr_office_supplies=${mrFilterState.officeSupplies}`;
      }
      if (mrFilterState.multimedia !== null) {
        url += `&mr_multimedia=${mrFilterState.multimedia}`;
      }
      if (mrFilterState.adaCompliant !== null) {
        url += `&mr_ada_compliant=${mrFilterState.adaCompliant}`;
      }
      if (mrFilterState.projector !== null) {
        url += `&mr_projector=${mrFilterState.projector}`;
      }
      if (mrFilterState.whiteboard !== null) {
        url += `&mr_whiteboard=${mrFilterState.whiteboard}`;
      }
      if (mrFilterState.eat !== null) {
        url += `&mr_eat=${mrFilterState.eat}`;
      }
      url += `&mr_start_date_time=${mrFilterState.startDate}`;
      url += `&mr_group_size=${mrFilterState.groupSize}`;
      mrFilterState.categories.forEach((category) => {
        url += `&mr_category[]=${category}`;
      });
      if (state.pricingRange.end > 0) {
        url += `&mr_pricing_range_start=${state.pricingRange.start}`;
        url += `&mr_pricing_range_end=${state.pricingRange.end}`;
      }
      fetchSpaces(url);
    }
  }, [
    mrFilterState,
    debouncedSearchTerm,
    state.sort,
    state.serviceType,
    state.searchAreaType,
    state.searchArea,
    state.geolocation,
    state.amenities,
    state.pricingRange,
  ]);

  const value = {
    dispatch,
    state,
    voFilterState,
    voFilterDispatch,
    odFilterState,
    odFilterDispatch,
    prFilterState,
    prFilterDispatch,
    mrFilterState,
    mrFilterDispatch,
  };

  return (
    <SpacesContext.Provider value={value}>{children}</SpacesContext.Provider>
  );
};

const spacesReducer = (state: SpacesState, action: SpacesAction) => {
  const { type, payload } = action;
  switch (type) {
    case SpacesActionType.CHANGE_LOCATION:
      return {
        ...state,
        location: payload as string,
      };
    case SpacesActionType.CHANGE_SERVICE_TYPE:
      return {
        ...state,
        serviceType: payload as ServiceType,
      };
    case SpacesActionType.CHANGE_AREA_MEASUREMENT:
      return {
        ...state,
        searchAreaType: payload as SearchAreaType,
      };
    case SpacesActionType.CHANGE_AREA:
      return {
        ...state,
        searchArea: payload as string,
      };
    case SpacesActionType.CHANGE_GEOLOCATION:
      return {
        ...state,
        geolocation: {
          lon: payload.lon,
          lat: payload.lat,
        },
      };
    case SpacesActionType.CHANGE_PRICING_RANGE:
      return {
        ...state,
        pricingRange: {
          start: payload.start,
          end: payload.end,
        },
      };
    case SpacesActionType.CHANGE_SORTING:
      return {
        ...state,
        sort: payload as Sort,
      };
    case SpacesActionType.CHANGE_AMENITIES:
      const { checked, id } = payload as { checked: boolean; id: number };
      let newAmenities = [...state.amenities];
      if (checked) {
        newAmenities = [...newAmenities, Number(id)];
      } else {
        newAmenities = newAmenities.filter(
          (amenityId) => amenityId !== Number(id)
        );
      }
      return {
        ...state,
        amenities: newAmenities,
      };
    case SpacesActionType.SET_VIEWSTATE:
      return {
        ...state,
        viewState: {
          ...state.viewState,
          ...payload,
        },
      };
    case SpacesActionType.SET_RESULT:
      return {
        ...state,
        result: payload as Space[],
      };
    case SpacesActionType.SET_IS_FETCHING:
      return {
        ...state,
        isFetching: payload as boolean,
      };
    default:
      return state;
  }
};
const voFilterReducer = (state: VoFilterState, action: VoFilterAction) => {
  const { type, payload } = action;
  switch (type) {
    case VoFilterActionType.CHANGE_KEY_VALUE:
      const { key, value } = payload;
      const newValue = value === null ? null : value === "yes" ? 1 : 0;

      return {
        ...state,
        [key]: newValue,
      };
    default:
      return state;
  }
};
const odFilterReducer = (state: OdFilterState, action: OdFilterAction) => {
  const { type, payload } = action;
  switch (type) {
    case OdFilterActionType.CHANGE_TYPE:
      return {
        ...state,
        type: payload,
      };
    default:
      return state;
  }
};
const prFilterReducer = (state: PrFilterState, action: PrFilterAction) => {
  const { type, payload } = action;
  switch (type) {
    case PrFilterActionType.CHANGE_SIZE:
      return {
        ...state,
        size: payload,
      };
    default:
      return state;
  }
};
const mrFilterReducer = (state: MrFilterState, action: MrFilterAction) => {
  const { type, payload } = action;
  switch (type) {
    case MrFilterActionType.CHANGE_KEY_VALUE:
      const { key, value } = payload as { key: string; value: string };
      const newValue = value === null ? null : value === "yes" ? 1 : 0;

      return {
        ...state,
        [key]: newValue,
      };
    case MrFilterActionType.CHANGE_GROUP_SIZE:
      return {
        ...state,
        groupSize: payload as number,
      };
    case MrFilterActionType.CHANGE_DATE:
      return {
        ...state,
        startDate: payload as string,
      };
    case MrFilterActionType.CHANGE_CATEGORIES:
      const { checked, value: category } = payload as {
        checked: boolean;
        value: MeetingRoomCategories;
      };
      let newCategories = [...state.categories];

      if (checked) {
        newCategories = [...newCategories, category];
      } else {
        newCategories = newCategories.filter(
          (cateogryName) => cateogryName !== category
        );
      }

      return {
        ...state,
        categories: newCategories,
      };
    default:
      return state;
  }
};
