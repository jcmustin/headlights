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
import IpcMessage from '../../constants/ipcMessage'
import Mousetrap from 'mousetrap'
import { createIpcRendererInterface } from '../../utils/IpcInterface'

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
}> = ({ schedule: globalSchedule }) => {
  const [width, setWidth] = useState(MIN_WIDTH)
  const [height, setHeight] = useState(MIN_HEIGHT)
  const [tabSize, setTabsize] = useState(MIN_TAB_SIZE)
  const [localSchedule, setLocalSchedule] = useState(globalSchedule)
  const [isFocused, setIsFocused] = useState(false)
  const schedule = isFocused ? localSchedule : globalSchedule

  const sizeReference = createRef<HTMLPreElement>()
  const spaceWidthReference = createRef<HTMLPreElement>()
  const lineNumbers = createRef<HTMLTextAreaElement>()
  const scheduleInput = createRef<HTMLTextAreaElement>()

  const ipcRenderer = createIpcRendererInterface()

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
          '',
        ])[1]
        return longestTaskName.length
      }),
    )
  useEffect(() => {
    Mousetrap.bind(['mod+enter', 'alt+s'], (e) => {
      e.preventDefault()
      onSaveSchedule()
    })
    const element = sizeReference.current
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      const { width: newWidth, height: newHeight } = entry.contentRect
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
    return () => {
      Mousetrap.unbind('mod+enter')
      observer.disconnect()
    }
  }, [schedule, sizeReference])

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
    ipcRenderer.send({
      channel: IpcMessage.CueSetSchedule,
      param: newSchedule,
    })
    setLocalSchedule(newSchedule)
    if (maxTaskLength > tabSize / 2 || maxTaskLength < tabSize / 2 - 10) {
      setTabsize(Math.max(maxTaskLength * 2 + 10, MIN_TAB_SIZE))
    }
    window.requestAnimationFrame(() => {
      event.target.selectionStart = caret
      event.target.selectionEnd = caret
    })
  }

  const onBlur = () => {
    ipcRenderer.send({
      channel: IpcMessage.CueSetSchedule,
      param: localSchedule,
    })
    setIsFocused(false)
  }
  const onFocus = () => {
    setLocalSchedule(globalSchedule)
    setIsFocused(true)
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

  const onSaveSchedule = () => {
    ipcRenderer.send({ channel: IpcMessage.SaveSchedule, param: schedule })
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
        onFocus={onFocus}
        onBlur={onBlur}
        value={schedule}
        widthInPx={width}
        heightInPx={height}
        tabSize={tabSize}
        maxHeight={MAX_HEIGHT}
        className="mousetrap"
      />
      {/* the added space on the following line prevents the pre tag from discarding the last line break. */}
      <LineNumbers
        widthInPx={width}
        heightInPx={height}
        ref={lineNumbers}
        maxHeight={MAX_HEIGHT}
        scheduleEmpty={schedule.length === 0}
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
