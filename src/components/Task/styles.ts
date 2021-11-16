import styled from '@emotion/styled';

export const TaskView = styled.div`
  position: fixed;
  box-sizing: border-box;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 10% 0;
  background: #231830dd;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
`;

const Input = styled.input`
  border: none;
  outline: none;
  border-radius: 0.25rem;
  background: #8883;
  padding: 0.5em;
  font-family: 'Roboto Slab', sans-serif;
  font-size: 3rem;
  display: block;
  color: white;
`;

export const NameInput = styled(Input)`
  width: 20em;
`;

export const DurationInput = styled(Input)`
  text-align: center;
  width: 1em;
`;

export const StartTaskButton = styled.button`
  font-size: 3rem;
  font-family: 'Roboto Slab', sans-serif;
  text-shadow: 0px -1.5px 0px #0002;
  box-shadow: 0px 3px 0px #0002;
  padding: 1.5rem 3rem;
  color: #0007;
  border: none;
  background: #fff3;
  border-radius: 0.25rem;
  &:hover {
    transform: none;
  }
`;
