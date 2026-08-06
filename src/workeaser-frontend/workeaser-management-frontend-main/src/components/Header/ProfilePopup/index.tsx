import { DoublelineCell } from "@components/Table/Cell/DoublelineCell";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { Thumbnail } from "@components/Thumbnail";
import { AuthContext } from "@contexts/AuthContext";
import { api } from "@services/api";
import React, { useContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { SubscriptionsResponse } from "types";
import {
  AssetsContainer,
  Container,
  Footer,
  Header,
  ResourceButton,
  ResourcesContainer,
} from "./styles";

interface ProfilePopupProps {
  isOpen: boolean;
}

export const ProfilePopup: React.FC<ProfilePopupProps> = ({ isOpen }) => {
  const { user, signOut } = useContext(AuthContext);
  const { photo } = user || {};
  const [subscriptions, setSubscriptions] = useState<{
    locations: number;
    customers: number;
  }>();

  const GetSubscriptions = async () => {
    const { data: { result: subscriptions } = {} } =
      await api.get<SubscriptionsResponse>("/cowork/settings/subscriptions");
    setSubscriptions(subscriptions);
  };

  useEffect(() => {
    GetSubscriptions();
  }, []);

  return (
    <Container isOpen={isOpen}>
      <Header>
        <div>
          <Thumbnail
            url={photo?.file}
            alt="profile picture"
            size={40}
            radius={20}
          />

          <section>
            <DoublelineCell
              title={user?.first_name}
              subtitle={user?.coworkUser.coworkAccount.name}
            />
          </section>
        </div>
      </Header>

      <AssetsContainer>
        <div>
          <p>Active Assets:</p>
          <StatusContainer bgColor="green">
            {String(subscriptions?.locations ?? 0)}
          </StatusContainer>
          <p>Locations</p>
          <StatusContainer bgColor="green">
            {String(subscriptions?.customers ?? 0)}
          </StatusContainer>
          <p>Customers</p>
        </div>
      </AssetsContainer>

      <ResourcesContainer>
        <h3>User Help &amp; Resouces:</h3>

        <div>
          <a
            href="https://workeaser.com/articles-insights/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <ResourceButton>
              <svg width="12" height="12" viewBox="0 0 12 12">
                <defs>
                  <clipPath>
                    <rect
                      width="12"
                      height="12"
                      transform="translate(1129 419)"
                      fill="#00a2dd"
                      stroke="#707070"
                      strokeWidth="1"
                    />
                  </clipPath>
                </defs>
                <g transform="translate(-1129 -419)" clipPath="url(#clip-path)">
                  <g transform="translate(1127.5 417.8)">
                    <path
                      d="M4.2,8.7a.3.3,0,0,1,.3-.3h6a.3.3,0,1,1,0,.6h-6A.3.3,0,0,1,4.2,8.7Z"
                      fill="#00a2dd"
                      fillRule="evenodd"
                    />
                    <path
                      d="M4.2,10.5a.3.3,0,0,1,.3-.3h6a.3.3,0,1,1,0,.6h-6A.3.3,0,0,1,4.2,10.5Z"
                      fill="#00a2dd"
                      fillRule="evenodd"
                    />
                    <path
                      d="M4.2,6.9a.3.3,0,0,1,.3-.3h6a.3.3,0,1,1,0,.6h-6A.3.3,0,0,1,4.2,6.9Z"
                      fill="#00a2dd"
                      fillRule="evenodd"
                    />
                    <path
                      d="M4.2,5.1a.3.3,0,0,1,.3-.3H6.9a.3.3,0,1,1,0,.6H4.5A.3.3,0,0,1,4.2,5.1Z"
                      fill="#00a2dd"
                      fillRule="evenodd"
                    />
                    <path
                      d="M3.3,1.8a.3.3,0,0,0-.3.3V12.3a.3.3,0,0,0,.3.3h8.4a.3.3,0,0,0,.3-.3V5.7a.3.3,0,0,0-.3-.3H9.3a.9.9,0,0,1-.9-.9V2.1a.3.3,0,0,0-.3-.3Zm-.9.3a.9.9,0,0,1,.9-.9H8.1a.9.9,0,0,1,.9.9V4.5a.3.3,0,0,0,.3.3h2.4a.9.9,0,0,1,.9.9v6.6a.9.9,0,0,1-.9.9H3.3a.9.9,0,0,1-.9-.9Z"
                      fill="#00a2dd"
                      fillRule="evenodd"
                    />
                    <path
                      d="M8.451,1.8H8.1V1.2h.351a.9.9,0,0,1,.636.264l3.249,3.249a.9.9,0,0,1,.264.636V5.7H12V5.349a.3.3,0,0,0-.088-.212L8.664,1.888A.3.3,0,0,0,8.451,1.8Z"
                      fill="#00a2dd"
                      fillRule="evenodd"
                    />
                  </g>
                </g>
              </svg>
              <span>Articles &amp; Insights</span>
            </ResourceButton>
          </a>
          <a
            href="https://workeaser.com/e-books/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <ResourceButton>
              <svg width="12" height="12" viewBox="0 0 12 12">
                <defs>
                  <clipPath>
                    <rect
                      width="12"
                      height="12"
                      transform="translate(1284 419)"
                      fill="#00a2dd"
                      stroke="#707070"
                      strokeWidth="1"
                    />
                  </clipPath>
                </defs>
                <g transform="translate(-1284 -419)" clipPath="url(#clip-path)">
                  <g transform="translate(1283.455 418.454)">
                    <path
                      d="M1.636,11.182A1.364,1.364,0,0,1,3,9.818h8.455v1.909a.818.818,0,0,1-.818.818H3A1.364,1.364,0,0,1,1.636,11.182ZM3,10.364A.818.818,0,1,0,3,12h7.636a.273.273,0,0,0,.273-.273V10.364Z"
                      fill="#00a2dd"
                      fillRule="evenodd"
                    />
                    <path
                      d="M2.455,1.091a.273.273,0,0,0-.273.273v9.818H1.636V1.364A.818.818,0,0,1,2.455.545h8.182a.818.818,0,0,1,.818.818v9.818h-.545V1.364a.273.273,0,0,0-.273-.273Z"
                      fill="#00a2dd"
                      fillRule="evenodd"
                    />
                    <path
                      d="M5.455,3a.273.273,0,0,1,.273-.273H9a.273.273,0,1,1,0,.545H5.727A.273.273,0,0,1,5.455,3Z"
                      fill="#00a2dd"
                      fillRule="evenodd"
                    />
                    <path
                      d="M5.455,5.182a.273.273,0,0,1,.273-.273H7.364a.273.273,0,1,1,0,.545H5.727A.273.273,0,0,1,5.455,5.182Z"
                      fill="#00a2dd"
                      fillRule="evenodd"
                    />
                    <path
                      d="M3.273,10.091V.818h.545v9.273Z"
                      fill="#00a2dd"
                      fillRule="evenodd"
                    />
                  </g>
                </g>
              </svg>
              E-Books &amp; Infographics
            </ResourceButton>
          </a>
          <a
            href="https://workeaser.com/user-guidelines/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <ResourceButton>
              <svg width="12" height="12" viewBox="0 0 12 12">
                <defs>
                  <clipPath>
                    <rect
                      width="12"
                      height="12"
                      transform="translate(1129 465)"
                      fill="#00a2dd"
                      stroke="#707070"
                      strokeWidth="1"
                    />
                  </clipPath>
                </defs>
                <g transform="translate(-1129 -465)" clipPath="url(#clip-path)">
                  <g transform="translate(1127.857 464.429)">
                    <path
                      d="M7.143,1.143a5.429,5.429,0,1,0,5.429,5.429A5.429,5.429,0,0,0,7.143,1.143Zm-6,5.429a6,6,0,1,1,6,6A6,6,0,0,1,1.143,6.571Z"
                      fill="#00a2dd"
                      fillRule="evenodd"
                    />
                    <path
                      d="M7.143,3.429a3.143,3.143,0,1,0,3.143,3.143A3.143,3.143,0,0,0,7.143,3.429ZM3.429,6.571a3.714,3.714,0,1,1,3.714,3.714A3.714,3.714,0,0,1,3.429,6.571Z"
                      fill="#00a2dd"
                      fillRule="evenodd"
                    />
                    <path
                      d="M7.143,9.714A.286.286,0,0,1,7.429,10v2.286a.286.286,0,1,1-.571,0V10A.286.286,0,0,1,7.143,9.714Z"
                      fill="#00a2dd"
                      fillRule="evenodd"
                    />
                    <path
                      d="M7.143.571a.286.286,0,0,1,.286.286V3.143a.286.286,0,1,1-.571,0V.857A.286.286,0,0,1,7.143.571Z"
                      fill="#00a2dd"
                      fillRule="evenodd"
                    />
                    <path
                      d="M10.286,6.571a.286.286,0,0,1,.286-.286h2.286a.286.286,0,0,1,0,.571H10.571A.286.286,0,0,1,10.286,6.571Z"
                      fill="#00a2dd"
                      fillRule="evenodd"
                    />
                    <path
                      d="M1.143,6.571a.286.286,0,0,1,.286-.286H3.714a.286.286,0,0,1,0,.571H1.429A.286.286,0,0,1,1.143,6.571Z"
                      fill="#00a2dd"
                      fillRule="evenodd"
                    />
                  </g>
                </g>
              </svg>
              User Guidelines
            </ResourceButton>
          </a>
          {/* <ResourceButton>
            <svg width="12" height="12" viewBox="0 0 12 12">
              <defs>
                <clipPath>
                  <rect
                    width="12"
                    height="12"
                    transform="translate(1284 465)"
                    fill="#00a2dd"
                    stroke="#707070"
                    strokeWidth="1"
                  />
                </clipPath>
              </defs>
              <g transform="translate(-1284 -465)" clipPath="url(#clip-path)">
                <path
                  d="M6.265,1.867a3.656,3.656,0,0,1,3.835-.8.28.28,0,0,1,.1.462L8.327,3.409l1.946,1.946,1.877-1.877a.28.28,0,0,1,.462.1A3.563,3.563,0,0,1,8.344,8.325a.337.337,0,0,0-.323.074l-4.2,4.2a.841.841,0,0,1-1.189,0l-1.55-1.55a.841.841,0,0,1,0-1.189l4.2-4.2a.337.337,0,0,0,.074-.323A3.622,3.622,0,0,1,6.265,1.867ZM9.47,1.473a3.049,3.049,0,0,0-2.809.791A3.061,3.061,0,0,0,5.9,5.2a.9.9,0,0,1-.222.856l-4.2,4.2a.28.28,0,0,0,0,.4l1.55,1.55a.28.28,0,0,0,.4,0L7.625,8a.9.9,0,0,1,.856-.222,3.061,3.061,0,0,0,2.938-.761,3.049,3.049,0,0,0,.791-2.809L10.472,5.949a.28.28,0,0,1-.4,0L7.733,3.607a.28.28,0,0,1,0-.4Z"
                  transform="translate(1283.159 464.159)"
                  fill="#00a2dd"
                  fillRule="evenodd"
                />
              </g>
            </svg>
            Developer Support
          </ResourceButton> */}
        </div>
      </ResourcesContainer>

      <Footer>
        <button onClick={signOut}>
          <svg width="14" height="14" viewBox="0 0 14 14">
            <defs>
              <clipPath>
                <rect
                  data-name="Retângulo 1086"
                  width="14"
                  height="14"
                  transform="translate(1129 465)"
                  fill="#00a2dd"
                  stroke="#707070"
                  strokeWidth="1"
                />
              </clipPath>
            </defs>
            <g transform="translate(-1129 -465)" clipPath="url(#clip-path)">
              <g transform="translate(1128.139 464.363)">
                <path
                  d="M1.909,1.909A1.273,1.273,0,0,1,3.182.636H9.545a1.273,1.273,0,0,1,1.273,1.273v3.5a.318.318,0,0,1-.636,0v-3.5a.636.636,0,0,0-.636-.636H3.182a.636.636,0,0,0-.636.636V13.364A.636.636,0,0,0,3.182,14H9.545a.636.636,0,0,0,.636-.636V10.5a.318.318,0,0,1,.636,0v2.864a1.273,1.273,0,0,1-1.273,1.273H3.182a1.273,1.273,0,0,1-1.273-1.273Z"
                  fill="#00a2dd"
                  fillRule="evenodd"
                />
                <path
                  d="M11.548,6.139a.318.318,0,0,1,.45,0l1.816,1.816L12,9.77a.318.318,0,0,1-.45-.45L12.6,8.273H9.864a.318.318,0,1,1,0-.636H12.6L11.548,6.589A.318.318,0,0,1,11.548,6.139Z"
                  fill="#00a2dd"
                  fillRule="evenodd"
                />
              </g>
            </g>
          </svg>

          <p>System Logout</p>
        </button>
      </Footer>
    </Container>
  );
};
