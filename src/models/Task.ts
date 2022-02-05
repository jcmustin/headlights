import { isStatus, Status } from '../constants/status'
import { Entry } from './Entry'

export type Task = {
  raw: string
  name: string
  duration: number
  status: Status
  isComplete: () => boolean
  is(entry: Entry): boolean
  toString(): string
  serialize(): TaskData
}

export type TaskData = {
  raw?: string
  name: string
  duration: number | string
  status?: string
}

export const createTask = (
  { raw: maybeRaw, name, duration, status: maybeStatus }: TaskData = {
    name: '',
    duration: 0,
    status: Status.Incomplete,
  },
): Task => {
  let status = isStatus(maybeStatus) ? maybeStatus : Status.Incomplete
  const isComplete = () => status && status !== Status.Incomplete
  const getUpdatedRaw = () =>
    `${isComplete() ? `[${status}] ` : ''}${name}\t|　${duration}`
  let raw = maybeRaw ? maybeRaw : getUpdatedRaw()
  return {
    raw,
    name,
    duration: typeof duration === 'string' ? parseFloat(duration) : duration,
    get status() {
      return status
    },
    set status(newStatus: Status) {
      status = newStatus
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
      return { raw: maybeRaw, name, duration, status: status }
    },
  }
}
