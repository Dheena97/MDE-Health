import React, { createContext, useContext, useReducer, type Dispatch } from 'react';
import type { AppState, AppAction } from '../types';

const initialState: AppState = {
  intuneUpload: { file: null, fileName: '', status: 'idle', recordCount: 0, detectedColumns: [] },
  mdeUpload: { file: null, fileName: '', status: 'idle', recordCount: 0, detectedColumns: [] },
  intuneDevices: [],
  mdeDevices: [],
  mergedDevices: [],
  activityWindow: { preset: '24h' },
  kpiSummary: null,
  categoryStats: [],
  dataQualityIssues: [],
  assessmentRun: false,
  assessmentDate: null,
  isProcessing: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_INTUNE_UPLOAD':
      return { ...state, intuneUpload: { ...state.intuneUpload, ...action.payload } };
    case 'SET_MDE_UPLOAD':
      return { ...state, mdeUpload: { ...state.mdeUpload, ...action.payload } };
    case 'SET_INTUNE_DEVICES':
      return { ...state, intuneDevices: action.payload };
    case 'SET_MDE_DEVICES':
      return { ...state, mdeDevices: action.payload };
    case 'SET_ACTIVITY_WINDOW':
      return { ...state, activityWindow: action.payload };
    case 'SET_MERGED_DEVICES':
      return { ...state, mergedDevices: action.payload };
    case 'SET_KPI_SUMMARY':
      return { ...state, kpiSummary: action.payload };
    case 'SET_CATEGORY_STATS':
      return { ...state, categoryStats: action.payload };
    case 'SET_DATA_QUALITY_ISSUES':
      return { ...state, dataQualityIssues: action.payload };
    case 'SET_ASSESSMENT_RUN':
      return { ...state, assessmentRun: true, assessmentDate: action.payload.date };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

const AppStateContext = createContext<AppState>(initialState);
const AppDispatchContext = createContext<Dispatch<AppAction>>(() => {});

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  return useContext(AppStateContext);
}

export function useAppDispatch() {
  return useContext(AppDispatchContext);
}
