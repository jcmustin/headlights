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
    // Move the selection caret to the end of the schedule text area when component loads
    if (scheduleInput.current) {
      scheduleInput.current.focus();
      scheduleInput.current.setSelectionRange(scheduleInput.current.value.length, scheduleInput.current.value.length);
    }
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
    if (event.key === 'ArrowDown' && event.altKey) {
      console.log('DOWN')
      event.preventDefault()
      const { currentTarget: scheduleInput } = event
      const lines = scheduleInput.value.split('\n')
      const currentLineIndex = lines.findIndex((_, index, array) => 
        array.slice(0, index + 1).join('\n').length >= scheduleInput.selectionStart
      )
      
      if (currentLineIndex < lines.length - 1) {
        // Swap lines
        const temp = lines[currentLineIndex]
        lines[currentLineIndex] = lines[currentLineIndex + 1]
        lines[currentLineIndex + 1] = temp

        // Calculate new cursor position
        const prevLinesLength = lines.slice(0, currentLineIndex + 1).join('\n').length
        const newValue = lines.join('\n')
        
        setLocalSchedule(newValue)
        scheduleInput.value = newValue
        
        // Position cursor at same offset in moved line
        const oldLineStart = scheduleInput.value.split('\n').slice(0, currentLineIndex).join('\n').length + (currentLineIndex > 0 ? 1 : 0)
        const cursorOffset = scheduleInput.selectionStart - oldLineStart
        scheduleInput.selectionStart = scheduleInput.selectionEnd = prevLinesLength + cursorOffset
      }
    }
    else if (event.key === 'ArrowUp' && event.altKey) {
      console.log('UP')
      event.preventDefault()
      const { currentTarget: scheduleInput } = event
      const lines = scheduleInput.value.split('\n')
      const currentLineIndex = lines.findIndex((_, index, array) => 
        array.slice(0, index + 1).join('\n').length >= scheduleInput.selectionStart
      )
      
      if (currentLineIndex > 0) {
        // Swap lines
        const temp = lines[currentLineIndex]
        lines[currentLineIndex] = lines[currentLineIndex - 1]
        lines[currentLineIndex - 1] = temp

        // Calculate new cursor position
        const prevLinesLength = lines.slice(0, currentLineIndex - 1).join('\n').length
        const newValue = lines.join('\n')
        
        setLocalSchedule(newValue)
        scheduleInput.value = newValue
        
        // Position cursor at same offset in moved line
        const oldLineStart = scheduleInput.value.split('\n').slice(0, currentLineIndex).join('\n').length + (currentLineIndex > 0 ? 1 : 0)
        const cursorOffset = scheduleInput.selectionStart - oldLineStart
        scheduleInput.selectionStart = scheduleInput.selectionEnd = prevLinesLength + cursorOffset
      }
    }
    else if (event.key === 'Tab') {
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
