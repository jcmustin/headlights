import React, {
  ChangeEventHandler,
  createRef,
  UIEventHandler,
  useEffect,
  useState,
} from 'react'
import {
  ScheduleInput,
  SizeReference,
  SaveScheduleButton,
  LineNumbers,
} from './styles'
import { TaskViewContainer } from '../shared/styles'
import { ipcRenderer } from 'electron'
import IpcMessages from '../../constants/ipcMessages'
import Task from '../../types/Task'

const MIN_WIDTH = 270
const MIN_HEIGHT = 220
const SIDE_MARGIN = 200
const TOP_MARGIN = 100
const MAX_WIDTH = document.body.getBoundingClientRect().width - SIDE_MARGIN
const MAX_HEIGHT = document.body.getBoundingClientRect().height - TOP_MARGIN
const EPSILON = 10
const MIN_TAB_SIZE = 40

const ROUND = 150
const ScheduleView: React.FC<{
  schedule: string
  setSchedule: (schedule: string) => void
}> = ({ schedule, setSchedule }) => {
  const [width, setWidth] = useState(MIN_WIDTH)
  const [height, setHeight] = useState(MIN_HEIGHT)
  const [tabSize, setTabsize] = useState(MIN_TAB_SIZE)

  const sizeReference = createRef<HTMLPreElement>()
  const spaceWidthReference = createRef<HTMLPreElement>()
  const lineNumbers = createRef<HTMLTextAreaElement>()
  const scheduleInput = createRef<HTMLTextAreaElement>()

  const computeNewDim = (
    width: number,
    round: number,
    offset: number,
    min: number,
  ): number => Math.max(Math.ceil(width / round) * round + offset, min)

  const longestTaskNameLength = (schedule: string): number =>
    Math.max(
      ...schedule.split('\n').map((task): number => {
        const longestTaskName = (task.match(/([^\|]+)(?:\s\|.*)?/) || [
          '',
          'a',
        ])[1]
        return longestTaskName.length
      }),
    )
  useEffect(() => {
    const element = sizeReference.current
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      const { width: newWidth, height: newHeight } = entry.contentRect
      console.log(newWidth)
      const computedNewWidth = computeNewDim(newWidth, ROUND, 0, MIN_WIDTH)
      const computedNewHeight = computeNewDim(newHeight, ROUND, 0, MIN_WIDTH)
      if (width - computedNewWidth < EPSILON) {
        setWidth(Math.min(computedNewWidth, MAX_WIDTH))
      }
      if (height - computedNewHeight < EPSILON) {
        setHeight(computedNewHeight)
      }
    })
    element && observer.observe(element)
  }, [sizeReference])

  const onScheduleChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    const newSchedule = event.target.value
      .split('\n')
      .map((task) =>
        (/\t\|/.test(task) ? task : task.replace(/[^\S\t]\|/, '\t|'))
          .replaceAll('| ', '|　')
          .replaceAll(/\t([^\|])/g, ' $1'),
      )
      .join('\n')
    const caret = event.target.selectionStart
    const maxTaskLength = longestTaskNameLength(newSchedule)
    setSchedule(newSchedule)
    if (maxTaskLength > tabSize / 2 || maxTaskLength < tabSize / 2 - 10) {
      setTabsize(Math.max(maxTaskLength * 2 + 10, MIN_TAB_SIZE))
    }
    window.requestAnimationFrame(() => {
      event.target.selectionStart = caret
      event.target.selectionEnd = caret
    })
  }

  const onScrollSchedule: UIEventHandler<HTMLTextAreaElement> = (event) => {
    window.requestAnimationFrame(() => {
      lineNumbers.current &&
        lineNumbers.current.scrollTo({
          top: (event.target as HTMLTextAreaElement).scrollTop,
        })
    })
  }

  const onScrollLineNumbers: UIEventHandler<HTMLTextAreaElement> = (event) => {
    window.requestAnimationFrame(() => {
      scheduleInput.current &&
        scheduleInput.current.scrollTo({
          top: (event.target as HTMLTextAreaElement).scrollTop,
        })
    })
  }

  const getNextTask = () => {
    return schedule.split('\n').filter((task) => !/^\[x\]/.test(task))[0]
  }

  const onSaveSchedule = () => {
    const { name, duration } = getNextTask()
    ipcRenderer.send(IpcMessages.CueSetSchedule, schedule)
    ipcRenderer.send(IpcMessages.SetActiveTask, { name, duration })
  }

  return (
    <TaskViewContainer>
      <ScheduleInput
        autoFocus
        spellCheck={false}
        ref={scheduleInput}
        placeholder="task | duration"
        onChange={onScheduleChange}
        onScroll={onScrollSchedule}
        value={schedule}
        widthInPx={width}
        heightInPx={height}
        tabSize={tabSize}
        maxHeight={MAX_HEIGHT}
      />
      {/* the added space on the following line prevents the pre tag from discarding the last line break. */}
      <LineNumbers
        widthInPx={width}
        heightInPx={height}
        ref={lineNumbers}
        maxHeight={MAX_HEIGHT}
        value={schedule
          .split('\n')
          .map((_, i) => `${i + 1}. `)
          .join('\n')}
        disabled
        onScroll={onScrollLineNumbers}
      />
      <SizeReference tabSize={tabSize} ref={sizeReference}>
        {schedule}{' '}
      </SizeReference>
      <SizeReference ref={spaceWidthReference}> </SizeReference>
      <SaveScheduleButton onClick={onSaveSchedule}></SaveScheduleButton>
    </TaskViewContainer>
  )
}

export default ScheduleView
