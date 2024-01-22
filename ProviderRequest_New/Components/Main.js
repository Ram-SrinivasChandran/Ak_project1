import React, { useCallback, useEffect, useRef } from "react";
import Grid from "./Grid";
import FilterRow from "./FilterRow";
import CallHistory from "./CallHistory";
import { ActionTypes, ScreenType } from "../Store/Constants";
import "../../Common/css/SyncfusionCustom.css";
import { ToastComponent } from "@syncfusion/ej2-react-notifications";
import RequestForm from "./RequestForm";
import { ServerCalls } from "../Store/ServerCalls";
import { ToastProps } from "../../Common/Constants/CommonConstants";
import CallTracker from "./CallTracker";
import CustomDialog from "./CustomDialog";
import { PopUpTextEditor } from "../../Common/Components/PopUpTextEditor";
import { useSelector, useDispatch } from "react-redux";

function ProviderRequestNew() {
  const toastObjRef = useRef(null);
  const prevToastId = useRef(Toast.id);
  const prevActionnTriggeredId = useRef(ActionState.ActionTriggeredId);
  const gridObjRef = useRef(null);
  const popUpEditorRef = useRef(null);

  //MAPSTATETOPROPS()
  const {
    state,
    IsReadOnlyMode,
    ShowProgressPanel,
    GridDataLoadingId,
    CurrentScreen,
    SearchParameters,
    DisableSearchBtn,
    MasterData,
    Toast,
    callHistory,
    ShowLoader,
    ActionState,
    requestForm,
    CurrentCallRequests,
    ShowCurrentCallRequests,
    CallId,
    ResultCount,
    ConfirmationDialog,
  } = useSelector((state) => {
    return {
      state: state,
      IsReadOnlyMode: state.IsReadOnlyMode,
      ShowProgressPanel: state.ShowProgressPanel,
      GridDataLoadingId: state.GridDataLoadingId,
      CurrentScreen: state.CurrentScreen,
      SearchParameters: state.SearchParameters,
      DisableSearchBtn:
        state.SearchParameters.FromDate.Error.length > 0 ||
        state.SearchParameters.ToDate.Error.length > 0,
      MasterData: state.MasterData,
      Toast: state.Toast,
      CallHistory: state.RequestForm.CallHistory,
      ShowLoader: state.ShowLoader,
      ActionState: state.ActionState,
      RequestForm: state.RequestForm,
      CurrentCallRequests: state.CurrentCallRequests,
      ShowCurrentCallRequests: state.ShowCurrentCallRequests,
      CallId: state.CallId,
      ResultCount: state.ResultCount,
      ConfirmationDialog: state.ConfirmationDialog,
    };
  });

  //MAPDISPATCHTOPROPS()
  const dispatch = useDispatch();
  //access - actions.method
  const actions = {
    initApp: (message) => {
      dispatch({ type: ActionTypes.INIT_APP, payload: message });
    },
    initConnected: (message) => {
      dispatch({ type: ActionTypes.INIT_CONNECTED, payload: message });
    },
    updateSearchFieldsValue: (field, data) =>
      dispatch({
        type: ActionTypes.UPDATE_SEARCH_FIELDVALUE,
        payload: { field: field, data: data },
      }),
    validateSearchDates: () =>
      dispatch({ type: ActionTypes.VALIDATE_SEARCHDATES }),
    onSearchClick: () => {
      dispatch({ type: ActionTypes.ON_SEARCH_CLICK, payload: { dispatch } });
    },
    initServerCall: (data) =>
      dispatch({
        type: ActionTypes.INIT_SERVERCALL,
        payload: {
          action: ActionTypes.GET_PROVIDER_REQUEST_DETAILS,
          data: data,
        },
      }),
    onPopUpEditorValueChange: (parameter, data) => {
      dispatch({
        type: parameter.actionType,
        payload: { field: parameter.field, data: data },
      });
    },
  };

  const updateWindowSize = useCallback(() => {
    dispatch({
      type: ActionTypes.UPDATE_WINDOWSIZE,
      payload: {
        height: window.innerHeight,
        width: window.innerWidth,
      },
    });
  }, [dispatch]);

  //COMPONENTDIDMOUNT()
  useEffect(() => {
    if (window.RequestData) dispatch(actions.initApp(window.RequestData));

    if (window.IsConnected) dispatch(actions.initConnected(window.IsConnected));

    window.onresize(updateWindowSize);

    if (window.document.querySelector("#glbMsgDiv"))
      dispatch((window.document.querySelector("#glbMsgDiv").innerHTML = ""));

    window.addEventListener("beforeunload", beforeunload());

    //Remove sciomine notification content
    if (window.document.querySelector("#glbMsgDiv"))
      window.document.querySelector("#glbMsgDiv").innerHTML = "";

    window.addEventListener("beforeunload", beforeunload());
  }, [dispatch]);

  //COMPONENTDIDUPDATE()

  useEffect(() => {
    //Toast update
    if (Toast.id !== prevToastId.current) {
      prevToastId.current = Toast.id;

      const msgObj = {
        ...ToastProps[Toast.Message.type],
        content: Toast.Message.content,
      };

      if (toastObjRef.current) {
        toastObjRef.hide("All");
        toastObjRef.show(msgObj);
      }
    }
    //Action triggered update

    if (ActionState.ActionTriggeredId !== prevActionnTriggeredId.current) {
      ServerCalls.triggerAjax(state, dispatch);
    }
  }, [Toast, ActionState, state, dispatch]);

  //COMPONENTWILLUNMOUNT()
  useEffect(() => {
    window.removeEventListener("beforeunload", beforeunload);
  });

  const beforeunload = (e) => {
    if (
      ((RequestForm.HasChanges || RequestForm.ActiveQuery.HasChanges) &&
        CurrentScreen !== ScreenType.Grid) ||
      CallId !== ""
    ) {
      e.preventDefault();
      e.returnValue = true;
    }
  };

  //RETURN STATEMENT
  return (
    <>
      <div className={window.ApiRootUrl ? "mTop50" : ""}>
        <ToastComponent
          ref={toastObjRef}
          position={{ X: "Right" }}
          showCloseButton={true}
        ></ToastComponent>
        <div className="container-fluid" style={{ position: "relative" }}>
          {IsReadOnlyMode && <CallTracker />}

          <FilterRow grid={gridObjRef} />

          <Grid
            ref={gridObjRef}
            onRowSelected={actions.initServerCall}
            CurrentScreen={CurrentScreen}
          />

          <div className="row mar-pad-0">
            <div className="col-md-12">
              <span className="row-count">
                Total Number of Rows: {ResultCount}
              </span>
            </div>
          </div>
          <RequestForm ref={popUpEditorRef} />
          <CallHistory
            callHistory={
              !ShowCurrentCallRequests ? CallHistory : CurrentCallRequests
            }
            onRowSelected={actions.initServerCall}
          />
        </div>
        <div className={"overlay" + (ShowLoader ? " on" : "")}></div>
        <div
          className="loader"
          style={ShowLoader ? { display: "block" } : {}}
        ></div>
        <CustomDialog
          showDialog={ConfirmationDialog.visible}
          content={ConfirmationDialog.message}
          dispatch={dispatch}
        />

        <PopUpTextEditor
          popUpKey="popupTextEditor"
          ref={popUpEditorRef}
          onValueUpdate={actions.onPopUpEditorValueChange}
        />
      </div>
    </>
  );
}

export default ProviderRequestNew;
