# Headlights

Headlights is a tool for staying focused. It's a pomodoro timer with a strict taskmaster component: it asks you what you want to do next and how long it will take, and fills your computer screen until you answer. Once you've decided on a task, a timer overlay helps you rememeber what you're working on. Once the timer completes, it asks again, and the cycle repeats.

## Shortcuts

`Cmd+Opt+Q`: quit app.
`Cmd+Opt+T`: complete current task.
`Cmd+Enter` (task entry view): Start Task
`Cmd+Enter` (schedule entry view): Save Schedule

## To Dos

### High
- Fix schedule bug on timer view
- Fix slowdown issue
- Fix 0.1 =/= .1 issue
- Fix "StartTime.toFormat is not a function"

### Med

- Add electron-store
- Focus window on task/schedule view on mac
- Modify style of completed tasks (strikethrough?)
- reconsider [ ] notation. I don't know that it's needed.
- Allow modifying schedule while task running
- Save to file
- disable `nodeIntegration`, enable `contextIsolation`, add `preload.js`
- profile performance: <https://www.electronjs.org/docs/latest/tutorial/performance>
- `yarn add use-error-boundary`: <https://github.com/JoschuaSchneider/use-error-boundary>
- Show on all spaces in Mac
- Allow switching between daysß
- Specify successful vs unsuccessful
  - add two shortcuts
- Refactor ipc message code
- Remove task view? You maybe only need schedule view.
- if possible, find a way to dim upper section on hover.
- Fix app close command
- fix bug: adding displays can delete schedule

### Low

- Allow switching between schedule tasks in task view.
- Show next task on task entry view
- schedule doesn't resize width down on delete.

### Maybeß

- Add task priorities + sort by priority?
- Allow time-of-day tasks?
- Allow task tags? just after time maybe?
- vim?
- Add actual task duration on complete, also separated by | (used for early completion)
- task categories via first letter, or two letter code?

### Done

- ~~Add schedule parser~~
- ~~Wire up schedule to task entry view~~
- ~~Add factory for schedule entry~~
- ~~Add factory for schedule?~~
- ~~Add factory for task~~
- ~~Interpolate on-the-fly tasks into schedule~~
- ~~Update task status in schedule on completion~~
- ~~Fix active task update on task end~~
- ~~task start should add to schedule~~
- ~~bug: task end checks off next task~~
- ~~Fix time erasure~~
- Fix Type Error

## User Journey

- user starts application.
  - > AppState `activeDay` set to today.
  - > schedule loaded from file for `activeDay`'s date.
- user writes a task name and entry.
  - > task gets submitted to schedule with status `Incomplete`.
  - > AppState updates activeTask.
- task starts.
- either:
  - task ends.
    - user prompted for success / failure.
    - > AppState saves task to schedule with given status.
    - > AppState gets next task from schedule, updates activeTask.
  - user completes task.
    - > Shortcut encodes task status.
    - ~~two possible implementations:~~
      - > ~~User prompted for task status~~
- user changes schedule.
  - > global and local raw schedule state auto-updated on change.
  - > local state replaced with global on blur.
- user saves shedule.
  - > raw schedule parsed to AppState.schedule, replacing existing schedule.
  - > activeTask updated.
  - > view changed to task.
- user updates schedule entry via shortcut.
  - > local and global schedule interpolate matching schedule val,
  - > caret position moves by +3 / -3 accordingly.
- user closes application.
  - > schedule saved to file.
- user jumps back a day.
  - from schedule view:
    - > AppSchedule schedule updated from raw as needed. Schedule saved to file for current day.
    - > AppState updated to reflect new schedule.
- user jumps back/forward a day.
  - from schedule view:
    - > User prompted to save changes.
      - y:
        - > AppSchedule schedule updated from raw.
  - from any view:
    - > Schedule saved to file for current day.
    - > AppState `activeDay` updated to previous/next day.
    - > AppState initialized.
- user inputs a date.
  - > ditto for jump back/forward, but input date
