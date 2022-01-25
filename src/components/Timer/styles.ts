import styled from '@emotion/styled';

export const Progress = styled.progress`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 12vh;
  max-height: 120px;
  border-radius: 0;
  &::-webkit-progress-bar {
    background: transparent;
  }
  &::-webkit-progress-value {
    background: #aaa7;
  }
`;

export const TaskTitle = styled.div`
  font-family: 'Roboto Slab', sans-serif;
  font-weight: bolder;
  text-align: center;
  color: #ddd3;
  text-shadow: 0px 3px 0px #0000000f;
  font-size: 6em;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;
