import styled from '@emotion/styled';

export const TaskView = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
`;

const Input = styled.input`
  border: none;
  background: #8883;
  padding: 0.25em;
  font-size: 3rem;
  display: block;
  color: white;
`;

export const NameInput = styled(Input)`
  width: 20em;
`;

export const DurationInput = styled(Input)`
  width: 5em;
`;

export const StartTaskButton = styled.button`
  font-size: 3rem;
  width: 5em;
  border: none;
  background: #8882;
  border-radius: none;
  box-shadow: none;
  &:hover {
    transform: none;
  }
`;
