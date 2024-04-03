import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import { darken, opacify } from 'polished'
import { PRIMARY_COLOR } from '../../../constants/constants'
import milkyWay from '../../../../assets/milky-way.jpg'
import day from '../../../../assets/day.jpg'

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
    background-image: url(${day});
  }
  @media (prefers-color-scheme: dark) {
    background-image: linear-gradient(
        ${opacify(-0.55, darken(0.15, '#761240'))},
        ${opacify(-0.15, '#761240')}
      ),
      url(${milkyWay});
  }
  background-blend-mode: normal, normal;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
`
