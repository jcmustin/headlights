enum IpcMessage {
  StartTask = 'start-task',
  EndTask = 'end-task',
  SetActiveTask = 'set-active-task',
  CueSetSchedule = 'cue-set-schedule',
  SetSchedule = 'set-schedule',
  CueSaveSchedule = 'cue-save-schedule',
  SaveSchedule = 'save-schedule',
  CueSetView = 'cue-set-view',
  SetView = 'set-view',
  SetScheduleOpen = 'set-schedule-open',
  CueSetScheduleOpen = 'cue-set-schedule-open',
  CueHydrate = 'cue-hydrate',
  Hydrate = 'hydrate',
}

export default IpcMessage
