# Headlights

Headlights is a pomodoro timer with a strict taskmaster component: it asks you what you want to do next and how long it will take, and covers your screen until you answer. It supports adding multiple tasks to a schedule. Once a task is started, a conspicuous overlay at the top of the screen displays the current task title and the remaining time. Once the timer completes, it covers your screen again, auto-populating the next task from the schedule if one is provided.

Lines in the schedule are parsed as tasks if they contain (a title, consisting of arbitrary non-tab characters not beginning with square brackets, more on that in a sec), followed by (a tab character), followed immediately by (a duration in minutes, as an int or float). Completed tasks begin with a set of square brackets containing the task status (`+` for successful, `-` for unsuccessful), and have the beginning and end times appended to the end. In regex form, that's `/(?:\[(?<status>.*)\])?\s*(?<name>[^\t]+)\t(?<duration>\d*\.?\d+)(?:\s+(?<startTime>\d{2}:\d{2}).(?<endTime>\d{2}:\d{2}))?/`

A warning: in its current state, this is heavily optimized for personal use, and it is very idiosyncratic. Given that it covers your screen (and is also invisible to mouse events in its timer state), errors can be annoying to deal with. I've only run it on two machines, both running OSX.

## Shortcuts

`Cmd+Opt+Q`: quit app.
`Opt+Shift+T`: complete current task
`Opt+S`: toggle schedule view
`Cmd+Enter` (task entry view): Start Task
