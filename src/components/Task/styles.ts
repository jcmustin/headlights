import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import { lighten, darken } from 'polished'
import {
  FADE_IN_DURATION,
  FONT_STYLE,
  SECONDARY_COLOR,
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

export const InputContainer = styled.div`
  animation: ${fadeInKeyframes} ease-out ${FADE_IN_DURATION}s;
  ::after {
    content: '';
    width: 200px;
    left: 50%;
    transform: translateX(-50%);
    display: inline-block;
    position: absolute;
    height: 4px;
    background: ${UI_COLOR};
    border-radius: 3px;
    box-shadow: 0 2.3px 0 ${darken(0.1, UI_COLOR)}, ${SHADOW_STYLE};
  }
`

export const Input = styled.input`
  animation: ${fadeInKeyframes} ease-out ${FADE_IN_DURATION}s;
  &::selection {
    background: #fff7;
    color: ${UI_COLOR};
  }
  border: none;
  border-radius: 2px;
  outline: none;
  background: transparent;
  text-align: center;
  ${FONT_STYLE};
  font-size: 3rem;
  display: block;
  width: 100vw;
  line-height: 2;
`

export const StartTaskButton = styled.button`
  animation: ${fadeInKeyframes} ease-out ${FADE_IN_DURATION}s;
  font-size: 3rem;
  ${FONT_STYLE};
  text-shadow: 0px -2px 0px ${lighten(0.4, SECONDARY_COLOR)};
  box-shadow: 0px 3px 0px ${darken(0.1, UI_COLOR)}, ${SHADOW_STYLE};
  padding: 1.5rem 3rem;
  color: ${lighten(0.1, SECONDARY_COLOR)};
  border: none;
  background: ${UI_COLOR};
  border-radius: 0.2rem;
  &:hover {
    transform: none;
  }
  user-select: none;
  outline: none;
`
