import React, {
  ChangeEventHandler,
  createRef,
  UIEventHandler,
  useCallback,
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
import { createIpcRendererInterface } from '../../utils/IpcInterface'

const MIN_WIDTH = 270
const MIN_HEIGHT = 220
const SIDE_MARGIN = 200
const TOP_MARGIN = 100
const MAX_WIDTH = document.documentElement.clientWidth - SIDE_MARGIN
const MAX_HEIGHT = document.documentElement.clientHeight - TOP_MARGIN
const EPSILON = 10
const MIN_TAB_SIZE = 40
const DEFAULT_FONT_SIZE = 2
const MIN_FONT_SIZE = 1.3

const ROUND = 150
const ScheduleView: React.FC<{
  schedule: string
}> = ({ schedule: globalSchedule }) => {
  const [width, setWidth] = useState(MIN_WIDTH)
  const [height, setHeight] = useState(MIN_HEIGHT)
  const [tabSize, setTabsize] = useState(MIN_TAB_SIZE)
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE)
  const [localSchedule, setLocalSchedule] = useState(globalSchedule)
  const [isFocused, setIsFocused] = useState(false)
  const schedule = isFocused ? localSchedule : globalSchedule

  const sizeReference = createRef<HTMLPreElement>()
  const spaceWidthReference = createRef<HTMLPreElement>()
  const lineNumbers = createRef<HTMLTextAreaElement>()
  const scheduleInput = createRef<HTMLTextAreaElement>()

  const ipcRenderer = createIpcRendererInterface()

  const computeNewDim = useCallback(
    (width: number, round: number, offset: number, min: number): number =>
      Math.max(Math.ceil(width / round) * round + offset, min),
    [],
  )

  const longestTaskLength = useCallback(
    (schedule: string): number =>
      Math.max(
        ...schedule.split('\n').map((task): number => {
          const longestTaskRaw = (task.match(/([^\|]+)(?:\s\|.*)?/) || [
            '',
            '',
          ])[0]
          return longestTaskRaw.length
        }),
      ),
    [],
  )

  const updateTabSize = useCallback(() => {
    const maxTaskLength = longestTaskLength(schedule)
    if (maxTaskLength > tabSize / 2 || maxTaskLength < tabSize / 2 - 10) {
      setTabsize(Math.max(maxTaskLength * 2 + 10, MIN_TAB_SIZE))
    }
  }, [schedule, tabSize])

  useEffect(() => {
    return () => {
      let e = new Event('componentUnmount')
      document.dispatchEvent(e)
    }
  }, [])

  useEffect(() => {
    const element = sizeReference.current
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      const { width: newWidth, height: newHeight } = entry.contentRect
      const computedNewWidth = computeNewDim(newWidth, ROUND, 0, MIN_WIDTH)
      const computedNewHeight = computeNewDim(newHeight, ROUND, 0, MIN_WIDTH)
      if (Math.abs(width - computedNewWidth) > EPSILON) {
        setWidth(Math.min(computedNewWidth, MAX_WIDTH))
      }
      if (Math.abs(height - computedNewHeight) > EPSILON) {
        setHeight(Math.min(computedNewHeight, MAX_HEIGHT))
      }
      if (
        (newHeight > MAX_HEIGHT || newWidth > MAX_WIDTH) &&
        fontSize !== MIN_FONT_SIZE
      ) {
        setFontSize(Math.max(fontSize * 0.95, MIN_FONT_SIZE))
      } else if (
        newHeight < MAX_HEIGHT * 0.75 &&
        newWidth < MAX_WIDTH * 0.75 &&
        fontSize !== DEFAULT_FONT_SIZE
      ) {
        setFontSize(Math.min(fontSize / 0.95, DEFAULT_FONT_SIZE))
      }
      updateTabSize()
    })
    element && observer.observe(element)
    document.addEventListener('componentUnmount', onSaveSchedule)
    return () => {
      document.removeEventListener('componentUnmount', onSaveSchedule)
    }
  }, [schedule])

  const onScheduleChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      const newSchedule = event.target.value
        .split('\n')
        .map((task) =>
          (/\t\|/.test(task) ? task : task.replace(/[^\S\t]\|/, '\t|'))
            .replaceAll('| ', '|　')
            .replaceAll(/\t([^\|])/g, ' $1'),
        )
        .join('\n')
      const caret = event.target.selectionStart
      ipcRenderer.send({
        channel: IpcMessage.CueSetSchedule,
        param: newSchedule,
      })
      setLocalSchedule(newSchedule)
      updateTabSize()
      window.requestAnimationFrame(() => {
        event.target.selectionStart = caret
        event.target.selectionEnd = caret
      })
    },
    [],
  )

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

  const onScrollSchedule: UIEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      window.requestAnimationFrame(() => {
        lineNumbers.current &&
          lineNumbers.current.scrollTo({
            top: (event.target as HTMLTextAreaElement).scrollTop,
          })
      })
    },
    [lineNumbers],
  )

  const onScrollLineNumbers: UIEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      window.requestAnimationFrame(() => {
        scheduleInput.current &&
          scheduleInput.current.scrollTo({
            top: (event.target as HTMLTextAreaElement).scrollTop,
          })
      })
    },
    [scheduleInput],
  )

  const onSaveSchedule = useCallback(() => {
    ipcRenderer.send({ channel: IpcMessage.SaveSchedule, param: schedule })
  }, [schedule])

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
        fontSize={fontSize}
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
        fontSize={fontSize}
      />
      <SizeReference tabSize={tabSize} ref={sizeReference} fontSize={fontSize}>
        {schedule}{' '}
      </SizeReference>
      <SizeReference ref={spaceWidthReference} fontSize={fontSize}>
        {' '}
      </SizeReference>
      <SaveScheduleButton onClick={onSaveSchedule}></SaveScheduleButton>
    </TaskViewContainer>
  )
}

export default ScheduleView
