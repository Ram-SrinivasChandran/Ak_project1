import React, { Component } from "react";
import { connect } from "react-redux";
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

class ProviderRequest extends Component {
  constructor() {
    super(...arguments);
    this.grid = null;

    this.updateWindowSize = this.updateWindowSize.bind(this);
  }
  updateWindowSize() {
    this.props.dispatch({
      type: ActionTypes.UPDATE_WINDOWSIZE,
      payload: {
        height: window.innerHeight,
        width: window.innerWidth,
      },
    });
  }

  componentDidMount() {
    if (window.RequestData) this.props.initApp(window.RequestData);

    if (window.IsConnected) this.props.initConnected(window.IsConnected);

    window.onresize = this.updateWindowSize.bind(this);

    //Remove sciomine notification content
    if (window.document.querySelector("#glbMsgDiv"))
      window.document.querySelector("#glbMsgDiv").innerHTML = "";

    window.addEventListener("beforeunload", this.beforeunload.bind(this));
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.Toast.Id !== this.props.Toast.Id) {
      let toast = this.props.Toast;

      let msgObj = {
        ...ToastProps[toast.Message.type],
        content: toast.Message.content,
      };

      this.toastObj.hide("All"); //preventDuplicate toast
      this.toastObj.show(msgObj);
    }

    if (
      prevProps.ActionState.ActionTriggerId !==
      this.props.ActionState.ActionTriggerId
    )
      ServerCalls.triggerAjax(this.props.state, this.props.dispatch);
  }
  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.beforeunload.bind(this));
    // clearInterval(this.timer);
  }

  beforeunload(e) {
    if (
      ((this.props.RequestForm.HasChanges ||
        this.props.RequestForm.ActiveQuery.HasChanges) &&
        this.props.CurrentScreen !== ScreenType.Grid) ||
      this.props.CallId !== ""
    ) {
      e.preventDefault();
      e.returnValue = true;
    }
  }

  render() {
    return (
      <div className={window.ApiRootUrl ? "mTop50" : ""}>
        <ToastComponent
          ref={(toast) => {
            this.toastObj = toast;
          }}
          position={{ X: "Right" }}
          showCloseButton={true}
        ></ToastComponent>
        <div className="container-fluid" style={{ position: "relative" }}>
          {!this.props.IsReadOnlyMode && <CallTracker />}
          <FilterRow grid={this.grid} />
          <Grid
            ref={(grid) => (this.grid = grid)}
            onRowSelected={this.props.initServerCall}
            CurrentScreen={this.props.CurrentScreen}
          />
          <div className="row mar-pad-0">
            <div className="col-md-12">
              <span className="row-count">
                Total Number of Rows: {this.props.ResultCount}
              </span>
            </div>
          </div>
          <RequestForm popUpEditorRef={this.popUpEditor} />
          <CallHistory
            callHistory={
              !this.props.ShowCurrentCallRequests
                ? this.props.CallHistory
                : this.props.CurrentCallRequests
            }
            onRowSelected={this.props.initServerCall}
          />
        </div>
        <div className={"overlay" + (this.props.ShowLoader ? " on" : "")}></div>
        <div
          className="loader"
          style={this.props.ShowLoader ? { display: "block" } : {}}
        ></div>
        <CustomDialog
          showDialog={this.props.ConfirmationDialog.visible}
          content={this.props.ConfirmationDialog.message}
          dispatch={this.props.dispatch}
        />
        <PopUpTextEditor
          popUpKey="popupTextEditor"
          ref={(Obj) => (this.popUpEditor = Obj)}
          onValueUpdate={this.props.onPopUpEditorValueChange}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let props = {
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
  return props;
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
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
      payload: { action: ActionTypes.GET_PROVIDER_REQUEST_DETAILS, data: data },
    }),
  onPopUpEditorValueChange: (parameter, data) => {
    dispatch({
      type: parameter.actionType,
      payload: { field: parameter.field, data: data },
    });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ProviderRequest);
