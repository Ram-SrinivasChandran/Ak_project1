import React, { Component } from "react";
import { connect } from "react-redux";
import { ActionTypes, FieldNames } from "../Store/Constants";

class CallTracker extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      hours: 0,
      minutes: 0,
      seconds: 0,
      counterStart: false,
    };
  }

  clearIntervalRef = React.createRef();

  componentDidMount() {
    const time = localStorage.getItem("time");
    const callId = localStorage.getItem("callId");

    if (time && callId) {
      const parsedTime = JSON.parse(time);
      const { hours, minutes, seconds } = { ...parsedTime };
      this.props.initServerCall(ActionTypes.STOP_CALL, {
        time: `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        callId,
        isAutoCallStop: true,
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.callId === "" &&
      this.props.callId !== "" &&
      !this.props.IsAutoCallStop
    ) {
      this.onStartCounter();
    }
  }

  setTimerInLocalStorage = () => {
    localStorage.setItem(
      "time",
      JSON.stringify({
        hours: this.state.hours,
        minutes: this.state.minutes,
        seconds: this.state.seconds,
      })
    );
  };

  changeCounter = () => {
    const { counterStart, seconds, minutes, hours } = this.state;
    if (counterStart) {
      if (seconds === 59) {
        this.setState((prevState) => {
          return {
            ...prevState,
            seconds: 0,
            minutes: prevState.minutes + 1,
          };
        }, this.setTimerInLocalStorage);
      } else if (minutes === 59) {
        this.setState((prevState) => {
          return {
            ...prevState,
            seconds: 0,
            minutes: 0,
            hours: prevState.hours + 1,
          };
        }, this.setTimerInLocalStorage);
      } else if (hours === 24) {
        this.setState(
          {
            hours: 0,
            minutes: 0,
            seconds: 0,
            counterStart: false,
          },
          this.setTimerInLocalStorage
        );
      } else {
        this.setState((prevState) => {
          return {
            ...prevState,
            seconds: prevState.seconds + 1,
          };
        }, this.setTimerInLocalStorage);
      }
    }
  };

  onStartCounterApiCall = () => {
    this.props.initServerCall(ActionTypes.START_CALL);
  };

  onStartCounter = () => {
    this.setState({ counterStart: true });
    if (this.clearIntervalRef.current) {
      clearInterval(this.clearIntervalRef.current);
    }
    let interval = setInterval(() => {
      this.changeCounter();
    }, 1000);

    this.clearIntervalRef.current = interval;
  };

  onStopCounter = () => {
    const { hours, minutes, seconds } = this.state;
    this.props.initServerCall(ActionTypes.STOP_CALL, {
      time: `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
    });
    this.setState({ counterStart: false, hours: 0, minutes: 0, seconds: 0 });
  };

  onChangeCallHistoryOption = (value) => {
    this.props.updateRequestField(FieldNames.ShowCurrentCallRequests, value);
  };

  render() {
    const { counterStart, seconds, minutes, hours } = this.state;

    return (
      <div className="call-tracker-panel">
        {this.props.callId !== "" && (
          <div className="Querytitle">
            <span
              className="pull-right showcall_history"
              onClick={() => {
                this.onChangeCallHistoryOption(true);
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
          <>{hours.toString().padStart(2, "0")} : </>
          <>{minutes.toString().padStart(2, "0")} : </>
          <>{seconds.toString().padStart(2, "0")}</>
          {counterStart ? (
            <span
              onClick={this.onStopCounter}
              disabled={!counterStart}
              className="glyphicon glyphicon-stop timerimg1"
            ></span>
          ) : (
            <span
              className="glyphicon glyphicon-play timerimg"
              onClick={this.onStartCounterApiCall}
              disabled={counterStart}
            ></span>
          )}
        </span>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    callId: state.CallId,
    IsAutoCallStop: state.IsAutoCallStop,
  };
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
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
});

export default connect(mapStateToProps, mapDispatchToProps)(CallTracker);
