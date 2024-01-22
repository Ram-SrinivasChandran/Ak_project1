import React, { Component } from "react";
import { connect } from "react-redux";
import { Util } from "../../Common/Actions/Util";
import { RequestModeIcon } from "../Store/Constants";
import { ActionTypes, ScreenType } from "../Store/Constants";

class CallHistory extends Component {
  onCloseCallHistory = () => {
    if (this.props.CurrentScreen == ScreenType.GridWithCurrentRequests) {
      this.props.updateScreenState(ScreenType.Grid);
    } else {
      this.props.updateScreenState(ScreenType.EditForm);
    }
  };

  render() {
    let { CurrentScreen, SelectedRequestId } = this.props;
    let previousCallId = "";
    const sortedCallHistory = this.props.callHistory?.sort(
      (a, b) => new Date(a.AttendedAt) - new Date(b.AttendedAt)
    );

    const filteredCallHistory = !this.props.ShowCurrentCallRequests
      ? sortedCallHistory?.filter(
          (item) => item.RequestId !== SelectedRequestId
        )
      : sortedCallHistory;
    if (filteredCallHistory) {
      filteredCallHistory.map((callHistory) => {
        callHistory.PreviousCallId = previousCallId;
        previousCallId = callHistory.ProviderCall_Id;
      });
    }

    return (
      <div
        id="rightPane_psq_view_callhistory"
        style={
          CurrentScreen == ScreenType.AddFormWithHistory ||
          CurrentScreen == ScreenType.EditFormWithHistory ||
          CurrentScreen == ScreenType.GridWithCurrentRequests
            ? { width: "42.5%", marginRight: "-98.5%" }
            : { width: "0", marginRight: "-1px" }
        }
      >
        <div className="sticky_head col-md-12 p0">
          <div className="col-md-6 pad10">
            <p className="serv-titlepsq">
              <strong>
                <img
                  src={
                    this.props.ShowCurrentCallRequests
                      ? "/content/images/Current call requests.png"
                      : "/content/images/Call history.png"
                  }
                  alt=""
                />{" "}
                {this.props.ShowCurrentCallRequests
                  ? "Current Call Requests"
                  : "Call History"}
              </strong>
            </p>
          </div>
          <div className="col-md-6 pad10 rightCloseBtn_closechistory">
            <span
              onClick={this.onCloseCallHistory}
              className="closeicon glyphicon glyphicon-remove-circle pull-right"
            ></span>
          </div>
        </div>

        <div className="col-md-12">
          <ul
            className={
              "timeline " +
              (this.props.ShowCurrentCallRequests ? "currentcall" : "")
            }
          >
            {filteredCallHistory?.map((callHistory) => (
              <li
                key={callHistory.Id}
                className={
                  "timeline-item bg-white rounded ml-3 p-4 shadow" +
                  (!callHistory.ProviderCall_Id ||
                  callHistory.ProviderCall_Id != callHistory.PreviousCallId
                    ? ""
                    : " samecall")
                }
              >
                <div>
                  <p className="det_card_header">
                    <img
                      src={RequestModeIcon.get(callHistory.RequestMode)}
                      alt="request mode"
                      className="Icnclr"
                    />
                    <span className="serv_request">
                      {Util.getCustomDateTimeFormat(callHistory.AttendedAt)}
                    </span>{" "}
                    <span className="pull-right ronlytxt">
                      {callHistory.RequestId}
                    </span>
                  </p>
                </div>
                <div className="detailsCard">
                  <h3 className="detailsCardheader">
                    {callHistory.RequestTypeName}
                    <span className="pull-right ronlytxt">
                      {callHistory.AttendedByFullName}
                    </span>
                  </h3>
                  <div className="detailscardbody">
                    <div className="col-md-12 p0">
                      <div className="col-md-11 p0">
                        <p className="txtQuery">
                          <span className="Icnclr">
                            <img
                              className="v_align_bot"
                              src="/content/images/query.png"
                              alt=""
                            />
                          </span>
                          {callHistory.Query}
                        </p>
                      </div>
                      <div className="col-md-1">
                        <p
                          className="Editinc"
                          data-toggle="modal"
                          data-target="#tblhtritpane"
                          onClick={() =>
                            this.props.onRowSelected(callHistory?.RequestId)
                          }
                        >
                          <span className="glyphicon glyphicon-edit"></span>
                        </p>
                      </div>
                    </div>
                    <p className="txtResponse">
                      <span className="Icnclr">
                        <img
                          className="v_align_bot"
                          src="/content/images/response.png"
                          alt=""
                        />
                      </span>
                      {callHistory.Response}
                    </p>
                    <p className="verfied">
                      {callHistory.VerifiedUsing ? (
                        <span className="verifiedicn glyphicon glyphicon-ok-sign mRight5"></span>
                      ) : (
                        ""
                      )}
                      {callHistory.VerifiedUsing}
                    </p>
                    {!callHistory.UpdatedByFullName ||
                    !callHistory.UpdatedAt ? (
                      ""
                    ) : (
                      <p className="updatedet">
                        Last Updated by:{" "}
                        <span className="bluetxt">
                          {callHistory.UpdatedByFullName}
                        </span>
                        <span> On </span>
                        <span className="bluetxt">
                          {Util.getCustomDateTimeFormat(callHistory.UpdatedAt)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  let props = {
    MasterData: state.MasterData,
    Toast: state.Toast,
    CurrentScreen: state.CurrentScreen,
    SelectedRequestId: state.RequestForm.RequestId,
    ShowCurrentCallRequests: state.ShowCurrentCallRequests,
  };
  return props;
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  updateScreenState: (screen) => {
    dispatch({ type: ActionTypes.UPDATE_SCREENSTATE, screen });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(CallHistory);
