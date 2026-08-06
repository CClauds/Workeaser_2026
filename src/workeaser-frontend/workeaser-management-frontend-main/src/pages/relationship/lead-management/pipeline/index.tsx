import Head from "next/head";
import { PageHeader } from "@components/Headers/PageHeader";
import { PipelineColumn } from "@components/PipelineColumn";
import { PipelineCard } from "@components/PipelineColumn/PipelineCard";
import styles from "./styles.module.scss";
import { ReactElement } from "react";
import { PagesProps } from "pages/_app";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { getAPIClient } from "@services/apiClient";
import { PipelineResponse } from "types/cowork/relationship";
import { Fallback } from "types";
import { useFetch } from "@hooks/useFetch";
import { DropResult, resetServerContext } from "@hello-pangea/dnd";
import dynamic from "next/dynamic";
import { api } from "@services/api";
import { toast } from "react-toastify";
import { PipelineStatusEnum } from "types/enums";

const DragDropContext = dynamic(
  async () => {
    const mod = await import("@hello-pangea/dnd");
    return mod.DragDropContext;
  },
  { ssr: false }
);
const Droppable = dynamic(
  async () => {
    const mod = await import("@hello-pangea/dnd");
    return mod.Droppable;
  },
  { ssr: false }
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { "user-token": token } = parseCookies(context);

  if (!token) {
    return {
      redirect: {
        destination: "/login?expired=true",
        permanent: false,
      },
    };
  }

  const apiClient = getAPIClient(context);
  const { data: pipeline } = await apiClient.get<PipelineResponse>(
    "/cowork/relationship/salespipeline"
  );

  resetServerContext();
  return {
    props: {
      fallback: {
        "/cowork/relationship/salespipeline": pipeline,
      },
    },
  };
};

interface PipelinePageProps {
  fallback: Fallback;
}
const PipelinePage = ({ fallback }: PipelinePageProps) => {
  const { data: { result: pipeline } = {}, mutate } =
    useFetch<PipelineResponse>("/cowork/relationship/salespipeline", {
      fallback,
    });

  const handleOnDragEnd = async (result: DropResult) => {
    const { destination, source } = result;

    if (!destination) return;

    const { droppableId: sourcePipe, index: sourceIndex } = source;
    const { droppableId: destinationPipe, index: destinationIndex } =
      destination;

    if (sourcePipe === destinationPipe) {
      return;
    }
    // if (destinationIndex === sourceIndex && sourcePipe === destinationPipe) {
    //   return;
    // }

    const sourceList = [...pipeline[PipelineStatusEnum[sourcePipe]]];
    const destinationList = [...pipeline[PipelineStatusEnum[destinationPipe]]];

    const [removed] = sourceList.splice(sourceIndex, 1);
    destinationList.splice(destinationIndex, 0, removed);

    mutate(
      {
        result: {
          ...pipeline,
          [PipelineStatusEnum[sourcePipe]]: sourceList,
          [PipelineStatusEnum[destinationPipe]]: destinationList,
        },
      },
      false
    );
    try {
      await api.put(`/cowork/relationship/salespipeline/${removed.id}`, {
        status: destinationPipe,
      });

      toast.success("Status updated.");
    } catch (error) {
      toast.error("Status updated failed.");
      sourceList.splice(sourceIndex, 0, removed);
      destinationList.splice(destinationIndex, 1);
      mutate({
        result: {
          ...pipeline,
          [PipelineStatusEnum[sourcePipe]]: sourceList,
          [PipelineStatusEnum[destinationPipe]]: destinationList,
        },
      });
    }
  };

  return (
    <>
      <Head>
        <title>Lead Management | Workeaser</title>
      </Head>

      <PageHeader>
        <div>
          <h1>Relationship</h1>
          <h2>Lead Management</h2>
          <h2>Sales Pipeline</h2>
        </div>
      </PageHeader>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <div className={styles.content}>
          <PipelineColumn title="Opportunity" color="gray">
            <Droppable droppableId="OPPORTUNITY">
              {(provided, _) => (
                <div
                  ref={provided.innerRef}
                  className={styles.droppable}
                  {...provided.droppableProps}
                >
                  {pipeline?.opportunity.map((item, index) => (
                    <PipelineCard
                      key={item.id}
                      item={item}
                      index={index}
                      step={0}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </PipelineColumn>

          <PipelineColumn title="Contacted" color="yellow">
            <Droppable droppableId="CONTACTED">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  className={styles.droppable}
                  {...provided.droppableProps}
                >
                  {pipeline?.contacted.map((item, index) => (
                    <PipelineCard
                      key={item.id}
                      item={item}
                      index={index}
                      step={1}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            {/* <PipelineCard
            service="VO"
            leadName="Lead Name"
            step={1}
            channelName="channel Name"
            contactMethod="contact Method"
          /> */}
          </PipelineColumn>

          <PipelineColumn title="Requested" color="red">
            <Droppable droppableId="REQUESTED">
              {(provided, _) => (
                <div
                  ref={provided.innerRef}
                  className={styles.droppable}
                  {...provided.droppableProps}
                >
                  {pipeline?.requested.map((item, index) => (
                    <PipelineCard
                      key={item.id}
                      item={item}
                      index={index}
                      step={2}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </PipelineColumn>

          <PipelineColumn title="Quoted" color="blue">
            <Droppable droppableId="QUOTED">
              {(provided, _) => (
                <div
                  ref={provided.innerRef}
                  className={styles.droppable}
                  {...provided.droppableProps}
                >
                  {pipeline?.quoted.map((item, index) => (
                    <PipelineCard
                      key={item.id}
                      item={item}
                      index={index}
                      step={3}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            {/* <PipelineCard
            service="MR"
            leadName="Lead Name"
            step={3}
            channelName="channel Name"
            contactMethod="contact Method"
          /> */}
          </PipelineColumn>

          <PipelineColumn title="Converted" color="green">
            <Droppable droppableId="CONVERTED">
              {(provided, _) => (
                <div
                  ref={provided.innerRef}
                  className={styles.droppable}
                  {...provided.droppableProps}
                >
                  {pipeline?.converted.map((item, index) => (
                    <PipelineCard
                      key={item.id}
                      item={item}
                      index={index}
                      step={4}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            {/* <PipelineCard
            service="MR"
            leadName="Lead Name"
            step={4}
            channelName="channel Name"
            contactMethod="contact Method"
            requestType="request Type"
          /> */}
          </PipelineColumn>
        </div>
      </DragDropContext>
    </>
  );
};

export default PipelinePage;
PipelinePage.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};

const reorder = (list, startIndex: number, endIndex: number) => {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};
