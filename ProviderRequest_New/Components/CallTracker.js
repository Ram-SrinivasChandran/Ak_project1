import React, { useEffect, useRef, useState } from "react";
import { ActionTypes, FieldNames } from "../Store/Constants";
import { useDispatch, useSelector } from "react-redux";

const CallTracker = ({}) => {
  const [time, setTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    counterStart: false,
  });
  // const [minutes, setMinutes] = useState(0);
  // const [seconds, setSeconds] = useState(0);
  // const [counterStart, setCounterStart] = useState(false);

  const clearIntervalRef = useRef(null);

  const { callId, IsAutoCallStop } = useSelector((state) => {
    return {
      callId: state.CallId,
      IsAutoCallStop: state.IsAutoCallStop,
    };
  });

  const dispatch = useDispatch();

  const actions = {
    initServerCall: (action, data) =>
      dispatch({
        type: ActionTypes.INIT_SERVERCALL,
        payload: { action: action, data },
      }),
    updateRequestField: (field, data) =>
      dispatch({
        type: ActionTypes.UPDATE_REQUEST_FIELD,
        payload: { field: field, data: data },
      }),
  };

  //COMPONENTDIDMOUNT()
  useEffect(() => {
    const time = localStorage.getItem("time");
    const callId = localStorage.getItem("callId");

    if (time && callId) {
      const parsedTime = JSON.parse(time);
      const { hours, minutes, seconds } = { ...parsedTime };
      actions.initServerCall(ActionTypes.STOP_CALL, {
        time: `${hours.toString().padStart(2, "0")}: ${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        callId,
        isAutoCallStop: true,
      });
    }
  });

  //COMPONENTDIDUPDATE
  const prevCallIdRef = useRef();
  useEffect(() => {
    if (prevCallIdRef === "" && callId !== "" && !IsAutoCallStop) {
      onStartCounter();
    }
    prevCallIdRef.current = callId;
  }, [callId]);

  const setTimerInLocalStorage = () => {
    localStorage.setItem(
      "time",
      JSON.stringify({
        hours: time.hours,
        minutes: time.minutes,
        seconds: time.seconds,
      })
    );
  };

  const changeCounter = () => {
    if (time.counterStart) {
      if (time.seconds === 59) {
        setTime((prevTime) => {
          return {
            ...prevTime,
            seconds: 0,
            minutes: prevTime.minutes + 1,
          };
        }, setTimerInLocalStorage);
      } else if (time.minutes === 59) {
        setTime((prevTime) => {
          return {
            ...prevTime,
            seconds: 0,
            minutes: 0,
            hours: prevTime.hours + 1,
          };
        }, setTimerInLocalStorage);
      } else if (time.hours === 24) {
        setTime(
          {
            hours: 0,
            minutes: 0,
            seconds: 0,
            counterStart: false,
          },
          setTimerInLocalStorage
        );
      } else {
        setTime((prevTime) => {
          return {
            ...prevTime,
            seconds: prevTime.seconds + 1,
          };
        }, setTimerInLocalStorage);
      }
    }
  };

  const onStartCounterApiCall = () => {
    actions.initServerCall(ActionTypes.START_CALL);
  };

  const onStartCounter = () => {
    setTime({ counterStart: true });
    if (clearIntervalRef.current) {
      clearInterval(clearIntervalRef.current);
    }

    let interval = setInterval(() => {
      changeCounter();
    }, 1000);

    clearIntervalRef.current = interval;
  };

  const onStopCounter = () => {
    actions.initServerCall(ActionTypes.STOP_CALL, {
      time: `${time.hours.toString().padStart(2, "0")}:${time.minutes
        .toString()
        .padStart(2, "0")}:${time.seconds.toString().padStart(2, "0")}`,
    });
    setTime({
      hours: 0,
      minutes: 0,
      seconds: 0,
      counterStart: false,
    });
  };

  const onChangeCallHistoryOption = (value) => {
    actions.updateRequestField(FieldNames.ShowCurrentCallRequests, value);
  };

  return (
    <>
      <div className="call-tracker-panel">
        {callId !== "" && (
          <div className="Querytitle">
            <span
              className="pull-right showcall_history"
              onClick={() => {
                onChangeCallHistoryOption(true);
              }}
            >
              <img
                src="/content/images/Current call requests.png"
                alt="Current call requests"
              />
              Current Call Requests
            </span>
          </div>
        )}
        <span className="timer">
          <>{time.hours.toString().padStart(2, "0")} : </>
          <>{time.minutes.toString().padStart(2, "0")} : </>
          <>{time.seconds.toString().padStart(2, "0")}</>
          {time.counterStart ? (
            <span
              onClick={onStopCounter()}
              disabled={!time.counterStart}
              className="glyphicon glyphicon-stop timerimg1"
            ></span>
          ) : (
            <span
              className="glyphicon glyphicon-play timerimg"
              onClick={onStartCounterApiCall()}
              disabled={time.counterStart}
            ></span>
          )}
        </span>
      </div>
    </>
  );
}

export default CallTracker;
