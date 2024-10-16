import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import day from '../../../../assets/green-floral.jpg'

const fadeInKeyframes = keyframes`
  0% {
    opacity: 0;
  }
  10% {
    opacity: .18;
  }
  90% {
    opacity: .3;
  }
  100% {
    opacity: 1;
  }
`

export const TaskViewContainer = styled.div<{ fadeInDuration?: number }>`
  animation: ${fadeInKeyframes} ease-in
    ${({ fadeInDuration = 0 }) => fadeInDuration}s;
  position: fixed;
  box-sizing: border-box;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 5rem;
  @media (prefers-color-scheme: light) {
    background: linear-gradient(to bottom, #0bcd 0%, #0bcd 100%), url(${day});
    background-size: 30%;
  }
  @media (prefers-color-scheme: dark) {
    background: linear-gradient(to bottom, #301e 0%, #301e 100%), url(${day});
    background-size: 30%;
  }
  background-blend-mode: normal, normal;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
`
