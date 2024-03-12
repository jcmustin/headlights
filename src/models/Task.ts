import { DateTime } from 'luxon'

import { isStatus, Status } from '../constants/status'
import { Entry } from './Entry'

export type Task = {
  raw: string
  name: string
  duration: number
  status: Status
  startTime?: DateTime
  endTime?: DateTime
  isComplete: () => boolean
  is(entry: Entry): boolean
  toString(): string
  serialize(): TaskData
}

export type TaskData = {
  raw?: string
  name: string
  duration: number | string
  status?: Status
  startTime?: DateTime
  endTime?: DateTime
}

export const createTask = (
  {
    raw: maybeRaw,
    name,
    duration,
    status: maybeStatus,
    startTime: maybeStartTime,
    endTime: maybeEndTime,
  }: TaskData = {
      name: '',
      duration: 0,
      status: Status.Incomplete,
      startTime: undefined,
      endTime: undefined,
    },
): Task => {
  let status = isStatus(maybeStatus) ? maybeStatus : Status.Incomplete
  let startTime: DateTime | undefined = maybeStartTime
  let endTime: DateTime | undefined = maybeEndTime
  const isComplete = () => status && status !== Status.Incomplete
  const getUpdatedRaw = () =>
    `${isComplete() ? `[${status}] ` : ''}${name}\t${duration}${startTime && endTime
      ? `　${startTime.toFormat('HH:mm')}—${endTime.toFormat('HH:mm')}`
      : ''
    }`
  let raw = maybeRaw ? maybeRaw : getUpdatedRaw()
  return {
    raw,
    get name() {
      return name
    },
    set name(newName: string) {
      name = newName
      raw = getUpdatedRaw()
    },
    get duration(): number {
      duration = typeof duration === 'string' ? parseFloat(duration) : duration
      return duration
    },
    set duration(newDuration: string | number) {
      duration = typeof newDuration === 'string' ? parseFloat(newDuration) : newDuration
      raw = getUpdatedRaw()
    },
    get status() {
      return status
    },
    set status(newStatus: Status) {
      status = newStatus
      raw = getUpdatedRaw()
    },
    get startTime() {
      return startTime
    },
    set startTime(newStartTime: DateTime | undefined) {
      startTime = newStartTime
      raw = getUpdatedRaw()
    },
    get endTime() {
      return endTime
    },
    set endTime(newEndTime: DateTime | undefined) {
      endTime = newEndTime
      raw = getUpdatedRaw()
    },
    isComplete,
    is(entry: Entry) {
      return entry.raw === raw
    },
    toString() {
      return raw
    },
    serialize(): TaskData {
      return {
        raw: maybeRaw,
        name,
        duration,
        status: status,
        startTime,
        endTime,
      }
    },
  }
}
