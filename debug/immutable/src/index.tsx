import React, { memo, useCallback, useState, useEffect, useRef } from 'react';
import { render } from 'react-dom';
import produce, {
  current,
  original,
  applyPatches,
  enablePatches,
} from 'immer/dist/immer.cjs.development';

// const TodoList = () => {
//   const [todos, setTodos] = useState([
//     {
//       id: 'React',
//       title: 'Learn React',
//       done: true,
//     },
//     {
//       id: 'Immer',
//       title: 'Try immer',
//       done: false,
//     },
//   ]);

//   const unfinishedTodoCount = todos.filter(
//     (todo) => todo.done === false
//   ).length;

//   const handleToggle = useCallback((id) => {
//     setTodos(
//       produce((draft) => {
//         const todo = draft.find((todo) => todo.id === id);
//         todo.done = !todo.done;
//       })
//     );
//   }, []);

//   const handleAdd = useCallback(() => {
//     setTodos(
//       produce((draft) => {
//         draft.push({
//           id: 'todo_' + Math.random(),
//           title: 'A new todo',
//           done: false,
//         });
//       })
//     );
//   }, []);

//   console.log('root render once ...');
//   return (
//     <div>
//       <button onClick={handleAdd}>Add Todo</button>
//       <ul>
//         {todos.map((todo) => (
//           <Todo todo={todo} key={todo.id} onToggle={handleToggle} />
//         ))}
//       </ul>
//       Tasks left: {unfinishedTodoCount}
//     </div>
//   );
// };

// const Todo = memo(
//   ({ todo, onToggle }) => {
//     console.log('render todo, ', todo.id);
//     return (
//       <li>
//         <input
//           type="checkbox"
//           checked={todo.done}
//           onClick={() => onToggle(todo.id)}
//         />
//         {todo.title}
//       </li>
//     );
//   },
//   (prevProps, nextProps) => prevProps.todo === nextProps.todo
// );

// render(<TodoList />, document.getElementById('root'));

let state = {
  name: 'Micheal',
  other: { count: 'hi' },
};

const nextState = produce(state, (draft) => {
  // draft.other.count = 10;
  draft.name = 'Micheal';
});

console.log('nextState', nextState);
console.log(state === nextState);
