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
    /(?:\[(?<status>.*)\])?\s*(?<name>[^\|]+)\s+\|\s+(?<duration>\d*\.?\d+)/
  const taskMatch = taskPattern.exec(raw)
  if (taskMatch && taskMatch.groups) {
    const { status: maybeStatus, name, duration } = taskMatch.groups
    return createTask({ name, duration, status: maybeStatus })
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
