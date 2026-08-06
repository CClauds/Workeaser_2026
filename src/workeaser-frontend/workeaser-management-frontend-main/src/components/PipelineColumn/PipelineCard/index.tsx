import { ServiceTag } from "@components/Table/Row/ServiceTag";
import React from "react";
import { ServicesAbbrEnum } from "types/enums";
import { PipelineSteps } from "../PipelineSteps";
import styles from "./styles.module.scss";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Draggable = dynamic(
  async () => {
    const mod = await import("@hello-pangea/dnd");
    return mod.Draggable;
  },
  { ssr: false }
);

interface DealItem {
  id: number;
  name: string;
  type: string;
}

interface PipelineCardProps {
  index: number;
  item: DealItem;
  channelName?: string;
  contactMethod?: string;
  requestType?: string;
  step: number;
}
export const PipelineCard: React.FC<PipelineCardProps> = ({
  item,
  index,
  channelName,
  contactMethod,
  requestType,
  step,
}) => {
  // const channelAbrev = channelName?.split(" ");
  // const contactAbrev = contactMethod?.split(" ");
  // const requestAbrev = requestType?.split(" ");

  return (
    <Draggable draggableId={`draggable-${item.id}-${item.type}`} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          className={styles.container}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <header>
            <div className={styles.title}>
              <ServiceTag isActive>{ServicesAbbrEnum[item.type]}</ServiceTag>
              <h1>{item.name}</h1>
            </div>
          </header>
          <PipelineSteps currentStep={step} />
        </div>
      )}
    </Draggable>
  );
};
