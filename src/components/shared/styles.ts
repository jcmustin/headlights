import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { opacify } from 'polished';
import { PRIMARY_COLOR } from '../../constants/constants';
import milkyWay from '../../../assets/milky-way.jpg';

const fadeInKeyframes = keyframes`
  0% {
    opacity: 0;
  }
  10% {
    opacity: .1;
  }
  90% {
    opacity: .4;
  }
  100% {
    opacity: 1;
  }
`;

export const TaskViewContainer = styled.div<{ fadeInDuration?: number }>`
  animation: ${fadeInKeyframes} ease-in
    ${({ fadeInDuration = 0 }) => fadeInDuration}s;
  position: fixed;
  box-sizing: border-box;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 10% 0;
  background-image: linear-gradient(
      ${opacify(-0.3, PRIMARY_COLOR)},
      ${opacify(-0.1, PRIMARY_COLOR)}
    ),
    url(${milkyWay});
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
`;
