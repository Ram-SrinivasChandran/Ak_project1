import React, { Component, useEffect } from "react";
import { connect } from "react-redux";
import { Util } from "../../Common/Actions/Util";
import { ActionTypes, RequestModeIcon, Status, RequestMode, RequestTypeCode } from "../Store/Constants";
import ContactChangeRequest from "./ContactChangeRequest";
import ReactHtmlParser from "react-html-parser";
import RequestForm from "../../OutboundCall/Components/RequestForm";
import { useDispatch, useSelector } from "react-redux";

function RequestCard(){ 

  const {ActiveQuery, RequestForm } = useSelector((state) => {
    return{
      ActiveQuery: state.RequestForm.ActiveQuery,
      RequestForm: state.RequestForm,
    }
  })

  const dispatch = useDispatch();

  const actions = {
    updateActiveQuerySelection: (selectedId) => {
      dispatch({
        type: ActionTypes.UPDATE_ACTIVEQUERY_SELECTION,
        payload: { selectedId },
      });
  }
}

  const onEditRequestCard = () => {
    openActiveQuery();
  };

  //COMPONENTDIDMOUNT
  useEffect(() => {
    let requestMode = queryDetail.RequestMode.toUpperCase();
    let status = RequestForm?.StatusCode?.toUpperCase();
    if(requestMode == RequestMode.PORTAL && status != Status.RESOLVED && status != Status.AUTORESOLVED){
      openActiveQuery();
    }
  })

  const openActiveQuery = () => {
    requestDetailsRef.current.scrollTop = 0;
    if (!ActiveQuery.HasChanges || window.confirm("Current Changes will be lost. Are you sure to proceed?")) 
    {
      actions.updateActiveQuerySelection(queryDetail.Id);
    }
  }

  const hideEdit = RequestForm.IsReadOnly;
  const queryDetail = queryDetail;
  const requestTypeCode = RequestForm.RequestTypeCode;

  return(<>
  <div className="detailsCard">
        <h3 className="detailsCardheader">
          <img
            src={RequestModeIcon.get(queryDetail.RequestMode)}
            alt="request mode"
            className="Icnclr"
            title={queryDetail.RequestMode}
          />
          {Util.getCustomDateTimeFormat(queryDetail.AttendedAt)}
          <span className="pull-right ronlytxt">
            {queryDetail.AttendedByFullName}
          </span>
        </h3>
        <div className="detailscardbody">
          <div>
            {queryDetail.NotificationStatus === "QUEUED" &&
              <p class="text-maroon"> Email notification to the provider has been Queued </p> 
            } 
            {queryDetail.NotificationStatus === "NOTIFIED" && 
              <p class="text-green"> 
                Email notification to the provider has been sent at {Util.getCustomDateTimeFormat(queryDetail.NotifiedAt)}
              </p> 
            }
             {queryDetail.NotificationStatus === "ERROR" && 
              <p class="text-maroon"> Email notification to the provider has been Failed </p>  
            }
          </div>
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
                {ReactHtmlParser(queryDetail.Query)}
              </p>
            </div>
            <div className="col-md-1">
              {!hideEdit ? (
                <p className="Editinc">
                  <span
                    className="glyphicon glyphicon-edit"
                    onClick={onEditRequestCard()}
                  ></span>
                </p>
              ) : null
              }
            </div>
          </div>
          { (queryDetail.RequestMode).toUpperCase() == RequestMode.PORTAL && 
            requestTypeCode == RequestTypeCode.ADDRESS_CHANGE_REQUEST &&
              <ContactChangeRequest 
                    queryDetail={queryDetail}
                    statusCode={RequestForm.StatusCode}
              />
          }
          <p className="txtResponse">
            <span className="Icnclr">
              <img
                className="v_align_bot"
                src="/content/images/response.png"
                alt=""
              />
            </span>
            {ReactHtmlParser(queryDetail.Response)}
          </p>
          <p className="verfied">
            {queryDetail.VerifiedUsing ? (
              <span
                className="verifiedicn glyphicon glyphicon-ok-sign"
                title="Requester Verified Using"
              ></span>
            ) : (
              ""
            )}
            {queryDetail.VerifiedUsing}
          </p>
          {queryDetail.UpdatedByFullName && (
            <p className="updatedet">
              Last Updated by:
              <span className="bluetxt">
                {queryDetail.UpdatedByFullName}
              </span>
              <span> On </span>
              <span className="bluetxt">
                {Util.getCustomDateTimeFormat(queryDetail.UpdatedAt)}
              </span>
            </p>
          )}
        </div>
      </div>

  </>)


}

export default RequestCard;
