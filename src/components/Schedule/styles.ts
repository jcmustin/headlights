import { css, keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import { darken, opacify } from 'polished'
import {
  FADE_IN_DURATION,
  FONT_STYLE,
  SHADOW_STYLE,
  UI_COLOR,
} from '../../constants/constants'

const fadeInKeyframes = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`

const sharedStyles = css`
  line-height: 1.5;
  font-size: 2rem;
  ${FONT_STYLE};
`

const textAreaStyles = css`
  ${sharedStyles};
  position: absolute;
  left: 50%;
  right: 50%;
  transform: translateX(-50%);
  transition: width 0.2s, height 0.2s;
  animation: ${fadeInKeyframes} ease-out ${FADE_IN_DURATION}s;
  box-sizing: border-box;
  border: none;
  outline: none;
  scrollbar-width: none;
  white-space: nowrap;
  background: transparent;
  resize: none;
  &::selection {
    background: #fff7;
    color: ${UI_COLOR};
  }
  ::-webkit-scrollbar {
    display: none;
  }
`

export const SizeReference = styled.pre<{ tabSize?: number }>`
  ${sharedStyles};
  display: inline-block;
  tab-size: ${({ tabSize = 0 }) => tabSize};
  visibility: hidden;
`

export const ScheduleInput = styled.textarea<{
  tabSize: number
  widthInPx: number
  heightInPx: number
  maxHeight: number
}>`
  ${textAreaStyles};
  tab-size: ${({ tabSize }) => tabSize};
  width: ${(props) => props.widthInPx}px;
  height: ${(props) => props.heightInPx}px;
  max-height: ${({ maxHeight }) => maxHeight}px;
  &::placeholder {
    -webkit-text-stroke: 1px #fff7;
    color: ${opacify(-0.7, UI_COLOR)};
    text-shadow: 0px 1.4px 0px ${opacify(-0.6, darken(0.4, UI_COLOR))};
  }
`

export const SaveScheduleButton = styled.button`
  position: absolute;
  bottom: calc(5rem + 5px);
  right: calc(5rem + 5px);
  width: 5rem;
  height: 5rem;
  transform: translate(50%, 50%);
  animation: ${fadeInKeyframes} ease-out ${FADE_IN_DURATION}s;
  font-size: 2.5rem;
  ${FONT_STYLE};
  box-shadow: 0px 3px 0px ${darken(0.1, UI_COLOR)}, ${SHADOW_STYLE};
  border: none;
  background: ${UI_COLOR};
  border-radius: 50%;
  &:hover {
    transform: translate(50%, 45%);
  }
  user-select: none;
  outline: none;
`

export const LineNumbers = styled.textarea<{
  widthInPx: number
  heightInPx: number
  maxHeight: number
}>`
  ${textAreaStyles};
  user-select: none;
  transform: translateX(calc(-50% - 220px));
  transition: width 0.2s, height 0.2s;
  z-index: -1;
  text-align: right;
  white-space: pre-wrap;
  padding-right: ${(props) => props.widthInPx}px;
  height: ${(props) => props.heightInPx}px;
  max-height: ${({ maxHeight }) => maxHeight}px;
  ::-webkit-scrollbar {
    display: none;
  }
`