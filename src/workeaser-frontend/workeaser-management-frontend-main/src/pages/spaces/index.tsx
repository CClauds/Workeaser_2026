import { CoworkingCard } from "@components/Coworking/CoworkingCard";
import { EmptyArrayResponse } from "@components/EmptyArrayResponse";
import { SpacesHeader } from "@components/Headers/SpacesHeader";
import { ClientLayout } from "@components/Layouts/ClientLayout";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { PulicLayout } from "@components/Layouts/PulicLayout";
import { Pin } from "@components/Pin";
import {
  SpacesActionType,
  SpacesContext,
  SpacesProvider,
} from "@contexts/SpacesContext";
import { getAPIClient } from "@services/apiClient";
import {
  Container,
  MapContainer,
  MapSection,
  PopupContainer,
  ResultContent,
  ResultHeader,
  Wrapper,
} from "@styles/pages/spaces";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { PagesProps } from "pages/_app";
import {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Skeleton from "react-loading-skeleton";
import Map, { MapboxEvent, Marker, Popup } from "react-map-gl";
import { useTheme } from "styled-components";
import { Space } from "types/client";
import { Amenity, Service } from "types/infos";
import { User, UserClient, UserCoworking, UserResponse } from "types/user";
import "react-loading-skeleton/dist/skeleton.css";
import Image from "next/legacy/image";
import Money from "dinero.js";
import { SelectComponent } from "@components/FormElements/Select";
import { OptionType } from "types";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);

  const userPromise = apiClient.get<UserResponse>("/me");
  const servicePromise = apiClient.get("/infos/services");
  const amenitiesPromise = apiClient.get("/infos/amenities");

  const [userResponse, servicesResponse, amenitiesResponse] =
    await Promise.allSettled([userPromise, servicePromise, amenitiesPromise]);

  let users: UserCoworking[] & UserClient[] = null;

  if (userResponse.status === "fulfilled") {
    users = userResponse.value.data.result;
  }
  // @ts-ignore
  // prettier-ignore
  const { data: { result: services } } = servicesResponse.value;
  // @ts-ignore
  // prettier-ignore
  const { data: { result: amenities } } = amenitiesResponse.value;

  return {
    props: {
      user: users ? users[0] : null,
      services,
      amenities,
    },
  };
};

interface SpaceProps {
  user: User;
  services: Service[];
  amenities: Amenity[];
}
const Spaces = ({ user, services, amenities }: SpaceProps) => {
  const theme = useTheme();
  const { state, dispatch } = useContext(SpacesContext);

  const [currentSpace, setCurrentSpace] = useState<Space>(null);

  useEffect(() => {
    setCurrentSpace(null);
  }, [state.serviceType]);

  const cards = state.result.map((space) => ({
    id: space.id,
    title: space.title,
    subTitle: space.coworking_name,
    photo: space?.cover_photo ?? null,
    services: space.coworking_services,
    priceType: space.price_type,
    price: space.price,
    type: state.serviceType,
    available: space?.available,
    qty_persons: space?.qty_persons,
    measure_size: space?.measure_size,
  }));

  const onMove = useCallback((evt) => {
    dispatch({
      type: SpacesActionType.SET_VIEWSTATE,
      payload: evt.viewState,
    });
  }, []);

  const onPinClick = (item: Space) => (e: MapboxEvent<MouseEvent>) => {
    const mapPayload = {
      longitude: item.address.longitude,
      latitude: item.address.latitude,
    };
    dispatch({
      type: SpacesActionType.SET_VIEWSTATE,
      payload: mapPayload,
    });
    setCurrentSpace(item);
    e.originalEvent.stopPropagation();
  };

  const SearchResult = () => {
    if (state.isFetching) {
      return (
        <>
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} height={220} />
          ))}
        </>
      );
    }
    if (state.result?.length === 0) {
      // HF-SPRINT-L-04: empty state com CTA (antes era so "No service found.")
      return (
        <EmptyArrayResponse
          item="services"
          icon="🪑"
          title="Nenhum espaço cadastrado"
          description="Adicione mesas, salas de reunião e escritórios virtuais pra começar a receber reservas."
          ctaLabel="Cadastrar primeira filial →"
          ctaHref="/locations/add"
        />
      );
    }
    return (
      <>
        {cards.map((card) => {
          let url = `/spaces/locations/${card.id}`;
          if (state.serviceType) {
            url = `/spaces/services/${card.id}?serviceType=${state.serviceType}`;
          }
          return (
            <CoworkingCard
              key={card.id}
              coworking={card}
              services={services}
              onClickLink={url}
              isActive={currentSpace?.id === card.id}
            />
          );
        })}
      </>
    );
  };

  const handleSortChange = (option: OptionType) => {
    dispatch({
      type: SpacesActionType.CHANGE_SORTING,
      payload: option.value,
    });
  };

  return (
    <>
      <Head>
        <title>Spaces | Workeaser</title>
      </Head>

      <Wrapper>
        <SpacesHeader amenities={amenities} />

        <Container heightOffSet={user?.role === "COWORKING" ? 100 : 70}>
          <section>
            <ResultHeader>
              <h3>
                Showing <strong>{state.result.length}</strong> Spaces
              </h3>

              <SelectComponent
                width={150}
                options={SORT_DATA.filter((sortDatum) =>
                  !sortDatum.type
                    ? true
                    : sortDatum.type.indexOf(state.serviceType) >= 0
                )}
                onChange={handleSortChange}
              />
            </ResultHeader>
            <ResultContent>
              <SearchResult />
            </ResultContent>
          </section>

          <MapSection>
            <MapContainer>
              <Map
                {...state.viewState}
                onMove={onMove}
                mapStyle="mapbox://styles/mapbox/streets-v9"
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_KEY}
              >
                {state.result.map((space) => (
                  <Marker
                    key={space.id}
                    longitude={space.address.longitude}
                    latitude={space.address.latitude}
                    anchor="top"
                    onClick={onPinClick(space)}
                  >
                    <Pin
                      color={
                        currentSpace?.id === space.id
                          ? theme.colors.blue200
                          : theme.colors.blue800
                      }
                    />
                  </Marker>
                ))}

                {currentSpace && (
                  <Popup
                    anchor="bottom"
                    longitude={currentSpace.address.longitude}
                    latitude={currentSpace.address.latitude}
                    onClose={() => setCurrentSpace(null)}
                    className="map__popup"
                  >
                    <PopupContainer>
                      <div>
                        <Image
                          src={currentSpace.cover_photo}
                          width={60}
                          height={60}
                          alt="service cover photo"
                          objectFit="cover"
                          objectPosition="center"
                        />
                        <div>
                          <h5>{currentSpace.title}</h5>
                          <div className="popup__infos">
                            <span>{currentSpace.coworking_name}</span>
                            {currentSpace?.price ? (
                              <span>
                                {Money({ amount: currentSpace.price }).toFormat(
                                  "$0,0.00"
                                )}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <footer>
                        <span>{currentSpace.address.fulltext}</span>
                      </footer>
                    </PopupContainer>
                  </Popup>
                )}
              </Map>
            </MapContainer>
          </MapSection>
        </Container>
      </Wrapper>
    </>
  );
};

Spaces.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  const {
    props: {
      children: { props },
    },
  } = page;
  const { user } = props;

  if (!user) {
    return <PulicLayout>{page}</PulicLayout>;
  }
  if (user?.role === "CLIENT") {
    return <ClientLayout componentProps={componentProps}>{page}</ClientLayout>;
  }
  return (
    <SpacesProvider>
      <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
    </SpacesProvider>
  );
};
export default Spaces;

const SORT_DATA = [
  {
    value: null,
    label: "Nearest",
  },
  {
    value: "lowest_prices",
    label: "Lowest prices",
    type: ["OPEN_DESK", "VIRTUAL_OFFICE", "PRIVATE_ROOM", "MEETING_ROOM"],
  },
  {
    value: "highest_prices",
    label: "Highest prices",
    type: ["OPEN_DESK", "VIRTUAL_OFFICE", "PRIVATE_ROOM", "MEETING_ROOM"],
  },
];
