import React, { useContext, useEffect, useState } from "react";
import { Alert, Button, Col, Row, Space, Spin, Tooltip } from "@components/antd-client";
import { ServicesButtonContainer } from "./style";
import Image from "next/legacy/image";
import { CheckCircleTwoTone, IssuesCloseOutlined } from "@components/antd-client/icons";
import { getAPIClient } from "@services/apiClient";
import { api } from "@services/api";
import { toast } from "react-toastify";
import { useFetch } from "@hooks/useFetch";
import axios, { AxiosError } from "axios";
import { mutate } from "swr";
interface ExternalServicesProps {
  identity: Identity;
}

interface Identity {
  name: string;
  email: string;
  status: IdentityStatus;
  createdBy: string;
  approvedDate: string;
}

export enum IdentityStatus {
  PENDING = "Pending",
  APPROVED = "Verified",
  REVOKED = "Revoked",
  DENIED = "Denied",
}
export interface IdentityResponse {
  name: string;
  email: string;
  status: string;
  createdBy: string;
  approvedDate: string;
}

interface AxiosResponse<T> {
  result: T | null;
  error: {
    message: string;
  };
}
export const ExternalServices: React.FC = () => {
  const [identity, setIdentity] = useState<AxiosResponse<IdentityResponse>>({
    result: null,
    error: null,
  });
  const [isLoading, setIsloading] = useState<boolean>(true);

  useEffect(() => {
    FetchIdentityMe();
  }, []);

  function AlertComponent() {
    const { error, result } = identity;
    if (!isLoading && result && !error) {
      switch (result?.status) {
        case IdentityStatus.APPROVED:
          return (
            <Tooltip title="You are successfully integrated.">
              <CheckCircleTwoTone color="#52c41a" twoToneColor="#52c41a" />
            </Tooltip>
          );
        case IdentityStatus.PENDING:
          return (
            <Alert
              message="Pending"
              type="warning"
              showIcon={true}
              action={
                <div
                  style={{
                    borderLeft: "1px solid #000",
                    marginLeft: "10px",
                  }}
                >
                  <Tooltip title="If you would like to receive the email again to authorize us to use your name to create the contracts, click here.">
                    <Button
                      size="small"
                      type="text"
                      onClick={() => ResendIdentity()}
                    >
                      Resend
                    </Button>
                  </Tooltip>
                </div>
              }
            />
          );
        case IdentityStatus.REVOKED:
          return (
            <Tooltip title="Permissions required to send contract from your company side are revoked.">
              <Button
                size="small"
                icon={<IssuesCloseOutlined />}
                danger
                onClick={() => ResendRevokedIdentity()}
              >
                Resend
              </Button>
            </Tooltip>
          );
        case IdentityStatus.DENIED:
          return (
            <Tooltip title="You denied our permission to send contract behalf your company.">
              <Button
                size="small"
                icon={<IssuesCloseOutlined />}
                danger
                onClick={() => ResendDeniedIdentity()}
              >
                Resend
              </Button>
            </Tooltip>
          );
        default:
          return (
            <Alert message="Failed to fetch" type="error" showIcon={true} />
          );
      }
    }
    return error ? (
      <Alert
        message={error?.message || "We failed when try to get identity status"}
        type="error"
      />
    ) : (
      <></>
    );
  }
  return (
    <Row gutter={16}>
      <Col span={12}>
        <ServicesButtonContainer isActive={true}>
          <Image
            src="/boldsign_logo.png"
            alt="BoldSignLogo"
            width="40"
            height="40"
          />
          <span>BoldSign</span>
          <Spin spinning={isLoading}>
            <AlertComponent />
          </Spin>
        </ServicesButtonContainer>
      </Col>
    </Row>
  );

  async function FetchIdentityMe() {
    setIsloading(true);
    try {
      const {
        data: { result, error },
      } = await api.get<{
        result: IdentityResponse;
        error: {
          message: string;
        };
      }>("/cowork/boldsign/identities/me");

      console.log("error messsa", error);
      if (error) {
        setIdentity({
          result: null,
          error: error,
        });
      }
      if (result) {
        setIdentity({
          result: result,
          error: null,
        });
        return;
      }
      toast.error("Something unexpected happended here.");
    } catch (error) {
      console.log("error1", error);
      if (error.response) {
        setIdentity({
          result: null,
          error: error?.response?.data?.error,
        });
      }
      toast.warn(
        error?.response?.data?.error?.message || "An unexpected error occurred."
      );
    } finally {
      setIsloading(false);
    }
  }

  async function ResendRevokedIdentity() {
    try {
      setIsloading(true);
      const { data: { result: resend } = {} } = await api.post<{
        result: IdentityResponse;
      }>("/cowork/boldsign/identities/resend-revoked");
      console.log("ResendRevokedIdentity -> ", resend);
      FetchIdentityMe();
    } catch (error) {
      toast.warning("An unexpected error occurred when we tried this.");
    }
  }

  async function ResendDeniedIdentity() {
    try {
      setIsloading(true);
      const { data: { result: resend } = {} } = await api.post<{
        result: IdentityResponse;
      }>("/cowork/boldsign/identities/resend-denied");
      console.log("ResendDenied -> ", resend);
      FetchIdentityMe();
    } catch (error) {
      toast.warning("An unexpected error occurred when we tried this.");
    }
  }

  async function ResendIdentity() {
    try {
      setIsloading(true);

      await api.post<{
        result: IdentityResponse;
      }>("/cowork/boldsign/identities/resend");
      setIsloading(false);
    } catch (error) {
      toast.warning("An unexpected error occurred when we tried this.");
    }
  }
};
