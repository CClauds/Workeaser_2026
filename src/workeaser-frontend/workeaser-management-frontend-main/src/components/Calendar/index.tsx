import FullCalendar, { CalendarOptions } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import React, { useContext, useEffect, useRef } from "react";
import { Container } from "./styles";
import { MenuContext } from "@contexts/MenuContext";

interface CalendarProps extends CalendarOptions {}

export const Calendar: React.FC<CalendarProps> = ({ ...props }) => {
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen } = useContext(MenuContext);

  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    resize();
  }, [isOpen]);

  const resize = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();

      const interval = setInterval(() => {
        calendarApi.updateSize();
      }, 50);
      setTimeout(() => {
        clearInterval(interval);
      }, 350);
    }
  };

  return (
    <Container>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        initialView="dayGridMonth"
        nowIndicator={true}
        editable={true}
        droppable={true}
        // weekends={false}
        allDaySlot={false}
        handleWindowResize={true}
        {...props}
      />
    </Container>
  );
};
