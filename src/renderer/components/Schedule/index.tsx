import React, {
  ChangeEventHandler,
  createRef,
  KeyboardEventHandler,
  UIEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  ScheduleInput,
  SizeReference,
  SaveScheduleButton,
  LineNumbers,
} from './styles'
import { TaskViewContainer } from '../shared/styles'
import IpcMessage from '../../../constants/ipcMessage'

const MIN_WIDTH = 400
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

  const ipcRenderer = {
    send: window.electron.send,
    on: window.electron.on,
  }

  const computeNewDim = (
    width: number,
    round: number,
    offset: number,
    min: number,
  ): number => Math.max(Math.ceil(width / round) * round + offset, min)

  const longestTaskLength = (schedule: string | null): number =>
    Math.max(
      ...(schedule || '').split('\n').map((task): number => {
        const longestTaskRaw = (task.match(/([^\t]+\t)/) || ['', ''])[0]
        return longestTaskRaw.length
      }),
    )

  const updateTabSize = useMemo(() => {
    return (schedule: string | null) => {
      const maxTaskLength = longestTaskLength(schedule)
      if (maxTaskLength > tabSize / 2 - 5 || maxTaskLength < tabSize / 2 - 20) {
        setTabsize(Math.max(maxTaskLength * 2 + 15, MIN_TAB_SIZE))
      }
    }
  }, [schedule])

  useEffect(() => {
    const element = sizeReference.current
    const observer = new ResizeObserver(onResize)
    element && observer.observe(element)
    return () => {
      let e = new Event('componentUnmount')
      document.dispatchEvent(e)
    }
  }, [])

  const onResize = (entries: ResizeObserverEntry[]) => {
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
    updateTabSize(entry.target?.textContent)
  }

  useEffect(() => {
    document.addEventListener('componentUnmount', onSaveSchedule)
    return () => {
      document.removeEventListener('componentUnmount', onSaveSchedule)
    }
  }, [schedule])

  const onScheduleChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback((event) => {
      const newSchedule = event.target.value
      const caret = event.target.selectionStart
      ipcRenderer.send({
        channel: IpcMessage.CueSetSchedule,
        param: newSchedule,
      })
      setLocalSchedule(newSchedule)
      updateTabSize(newSchedule)
      window.requestAnimationFrame(() => {
        event.target.selectionStart = caret
        event.target.selectionEnd = caret
      })
    },
    [ipcRenderer, updateTabSize],
  );

  const style = useMemo(() => {
    return {
      ['--schedule-font-size' as any]: `${fontSize}rem`,
      ['--schedule-tab-size' as any]: tabSize,
      ['--schedule-width' as any]: `${width}px`,
      ['--schedule-height' as any]: `${height}px`,
      ['--schedule-max-height' as any]: `${MAX_HEIGHT}px`,
    }
  }, [fontSize, tabSize, width, height])

  const onBlur = useCallback(() => {
    ipcRenderer.send({
      channel: IpcMessage.CueSetSchedule,
      param: localSchedule,
    })
    setIsFocused(false)
  }, [localSchedule])

  const onFocus = useCallback(() => {
    setLocalSchedule(globalSchedule)
    setIsFocused(true)
  }, [globalSchedule])

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

  const onSaveSchedule = useCallback(() => {
    ipcRenderer.send({ channel: IpcMessage.SaveSchedule, param: schedule })
  }, [schedule])

  const onKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault()
      const { currentTarget: scheduleInput } = event
      var start = scheduleInput.selectionStart
      var end = scheduleInput.selectionEnd

      // set textarea value to: text before caret + tab + text after caret
      const newValue =
        scheduleInput.value.substring(0, start) +
        '\t' +
        scheduleInput.value.substring(end)

      const setValue = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
      )?.set
      const newEvent = new Event('input', {
        bubbles: true,
      })
      setValue?.call(scheduleInput, newValue)
      scheduleInput.dispatchEvent(newEvent)

      // put caret at correct position again
      // TODO: something happens after this that moves the cursor back to the end position.
      // It triggers with a resize as well. If you set a breakpoint at this line, it's ~25 steps forward.
      scheduleInput.selectionStart = scheduleInput.selectionEnd = start + 1
    }
  }

  return (
    <TaskViewContainer style={style}>
      <ScheduleInput
        autoFocus
        spellCheck={false}
        ref={scheduleInput}
        placeholder={'task\tduration'}
        onKeyDown={onKeyDown}
        onChange={onScheduleChange}
        onScroll={onScrollSchedule}
        onFocus={onFocus}
        onBlur={onBlur}
        value={schedule}
        className="mousetrap"
      />
      {/* the added space on the following line prevents the pre tag from discarding the last line break. */}
      <LineNumbers
        ref={lineNumbers}
        scheduleEmpty={schedule.length === 0}
        value={schedule
          .split('\n')
          .map((_, i) => `${i + 1}.`)
          .join('\n')}
        disabled
        onScroll={onScrollLineNumbers}
      />
      <SizeReference ref={sizeReference}>{schedule} </SizeReference>
      <SizeReference ref={spaceWidthReference}> </SizeReference>
      {/* <SaveScheduleButton onClick={onSaveSchedule}></SaveScheduleButton> */}
    </TaskViewContainer>
  )
}

export default ScheduleView
