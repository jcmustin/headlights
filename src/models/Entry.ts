import { DateTime } from 'luxon'
import { Status } from '../constants/status'
import { createTask, Task } from './Task'

export type TextEntryData = {}
export type TextEntry = {
  raw: string
  is: (entry: Entry) => boolean
  toString: () => string
  serialize: () => TextEntryData
}

export type Entry = TextEntry | Task

export const isTaskEntry = (entry: Entry): entry is Task => 'name' in entry

export const createEntry = (raw: string): Entry => {
  const taskPattern =
    /(?:\[(?<status>.*)\])?\s*(?<name>[^\t]+)\t(?<duration>\d*\.?\d+)(?:\s+(?<startTime>\d{2}:\d{2}).(?<endTime>\d{2}:\d{2}))?/
  const taskMatch = taskPattern.exec(raw)
  if (taskMatch && taskMatch.groups) {
    const {
      status: maybeStatus,
      name,
      duration,
      startTime: maybeStartTime,
      endTime: maybeEndTime,
    } = taskMatch.groups
    return createTask({
      name,
      duration,
      status: maybeStatus as Status | undefined,
      startTime: maybeStartTime
        ? DateTime.fromFormat(maybeStartTime, 'HH:mm')
        : undefined,
      endTime: maybeEndTime
        ? DateTime.fromFormat(maybeEndTime, 'HH:mm')
        : undefined,
    })
  }
  return {
    get raw() {
      return raw
    },
    set raw(newRaw: string) {
      raw = newRaw
    },
    is(entry: Entry) {
      return entry.raw === raw
    },
    toString: () => raw,
    serialize() {
      return { raw }
    },
  }
}
