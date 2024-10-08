import React, {
  ChangeEventHandler,
  createRef,
  KeyboardEventHandler,
  UIEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  ScheduleInput,
  LineNumbers,
} from './styles'
import { TaskViewContainer } from '../shared/styles'
import IpcMessage from '../../../constants/ipcMessage'

const ScheduleView: React.FC<{
  schedule: string
}> = ({ schedule: globalSchedule }) => {
  const [localSchedule, setLocalSchedule] = useState(globalSchedule)
  const [isFocused, setIsFocused] = useState(false)
  const schedule = isFocused ? localSchedule : globalSchedule

  const lineNumbers = createRef<HTMLTextAreaElement>()
  const scheduleInput = createRef<HTMLTextAreaElement>()
  const scheduleRef = useRef(schedule);

  const ipcRenderer = {
    send: window.electron.send,
    on: window.electron.on,
  }

  useEffect(() => {
    scheduleRef.current = schedule
  }, [schedule])

  useEffect(() => {
    return () => {
      ipcRenderer.send({ channel: IpcMessage.SaveSchedule, param: scheduleRef.current })
    }
  }, [])

  const onScheduleChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback((event) => {
      const newSchedule = event.target.value
      const caret = event.target.selectionStart
      ipcRenderer.send({
        channel: IpcMessage.CueSetSchedule,
        param: newSchedule,
      })
      setLocalSchedule(newSchedule)
      window.requestAnimationFrame(() => {
        event.target.selectionStart = caret
        event.target.selectionEnd = caret
      })
    },
    [ipcRenderer],
  );

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

  const onKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault()
      const { currentTarget: scheduleInput } = event
      const start = scheduleInput.selectionStart
      const end = scheduleInput.selectionEnd
      const currentLine = scheduleInput.value.split('\n').find((_, index, array) => 
        array.slice(0, index + 1).join('\n').length >= start
      ) || ''
      
      if (!currentLine.includes('\t')) {
        const newValue = scheduleInput.value.substring(0, start) + '\t' + scheduleInput.value.substring(end)
        setLocalSchedule(newValue)
        scheduleInput.value = newValue
        scheduleInput.selectionStart = scheduleInput.selectionEnd = start + 1
      }
      else if(scheduleInput.value[start] === '\t') {
        scheduleInput.selectionStart = scheduleInput.selectionEnd = start + 1
      }
    }
  }
  return (
    <TaskViewContainer>
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
        value={useMemo(() => schedule
          .split('\n')
          .map((_, i) => `${i + 1}.`)
          .join('\n'), [schedule])}
        disabled
        onScroll={onScrollLineNumbers}
      />
    </TaskViewContainer>
  )
}

export default ScheduleView
