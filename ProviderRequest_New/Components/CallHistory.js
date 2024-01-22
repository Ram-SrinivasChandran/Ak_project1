import React, { Component } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { Util } from "../../Common/Actions/Util";
import { RequestModeIcon } from "../Store/Constants";
import { ActionTypes, ScreenType } from "../Store/Constants";
import { SortSelected } from "../../DenialReasonMaster/uievents";
import { filter } from "rxjs-compat/operator/filter";
import { showEmptyGrid } from "@syncfusion/ej2-react-grids";

function CallHistory({callHistory, onRowSelected}) {
  //MAPSTATETOPROPS()
  const {
    MasterData,
    Toast,
    CurrentScreen,
    SelectedRequestId,
    ShowCurrentCallRequests,
  } = useSelector((state) => {
    return {
      MasterData: state.MasterData,
      Toast: state.Toast,
      CurrentScreen: state.CurrentScreen,
      SelectedRequestId: state.RequestForm.RequestId,
      ShowCurrentCallRequests: state.ShowCurrentCallRequests,
    };
  });

  //MAPDISPATCHTOPROPS()
  const dispatch = useDispatch();

  const actions = {
    updateScreenState: (screen) => {
      dispatch({ type: ActionTypes.UPDATE_SCREENSTATE, screen });
    },
  };

  //METHOD
  const onCloseCallHistory = () => {
    if (CurrentScreen == ScreenType.GridWithCurrentRequests) {
      actions.updateScreenState(ScreenType.Grid);
    } else {
      actions.updateScreenState(ScreenType.EditForm);
    }
  };

  let previousCallId = "";

  const sortedCallHistory = callHistory?.sort(
    (a, b) => new Date(a.AttendedAt) - new Date(b.AttendedAt)
  );

  const filteredCallHistory = !ShowCurrentCallRequests
    ? sortedCallHistory?.filter((item) => item.RequestId !== SelectedRequestId)
    : sortedCallHistory;

  if (filteredCallHistory) {
    filteredCallHistory.map((callHistory) => {
      callHistory.previousCallId = previousCallId;
      previousCallId = callHistory.providerCall_Id;
    });
  }

  return (
    <>
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
                    ShowCurrentCallRequests
                      ? "/content/images/Current call requests.png"
                      : "/content/images/Call history.png"
                  }
                  alt=""
                />{" "}
                {ShowCurrentCallRequests
                  ? "Current Call Requests"
                  : "Call History"}
              </strong>
            </p>
          </div>
          <div className="col-md-6 pad10 rightCloseBtn_closechistory">
            <span
              onClick={onCloseCallHistory}
              className="closeicon glyphicon glyphicon-remove-circle pull-right"
            ></span>
          </div>
        </div>

        <div className="col-md-12">
          <ul
            className={
              "timeline " + (ShowCurrentCallRequests ? "currentcall" : "")
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
                          onClick={() => onRowSelected(callHistory?.RequestId)}
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
    </>
  );
}

export default CallHistory;
