const visibilityFilter = (state = {filter: 'SHOW_ALL'}, action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
};

const todo = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      };
    case 'TOGGLE_TODO':
      if (state.id !== action.id) {
        return state;
      }

      return {
        ...state,
        completed: !state.completed
      };
    default:
      return state;
  }
};

const todos = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      if (action.text) {
        return [
          ...state,
          todo(undefined, action)
        ];
      } else {
        return state;
      }
    case 'TOGGLE_TODO':
      return state.map(t => todo(t, action));
    default:
      return state;
  }
};

const { createStore, combineReducers } = Redux;
const todoApp  = combineReducers({
  todos,
  visibilityFilter
});
const store = createStore(todoApp);

const Todo = ({
  onClick,
  completed,
  text
}) => (
  <li
    style={{
      textDecoration: completed ? 'line-through' : 'none'
    }}
    onClick={onClick}>
    {text}
  </li>
);

const TodoList = ({
  todos,
  onTodoClick
}) => (
  <ul>
    {todos.map(todo => (
      <Todo
        key={todo.id}
        onClick={() => onTodoClick(todo.id)}
        {...todo} />
    ))}
  </ul>
);

const AddTodo = ({
  onAddClick
}) => {
  let input;

  return (
    <div>
      <input ref={node => {input = node}} />
      <button
        onClick={() => {
          onAddClick(input.value);
          input.value = '';
        }}>
        ADD TODO
      </button>
    </div>
  );
};

const FilterLink = ({
  current,
  filter,
  children,
  onClick
}) => {
  if (filter === current) {
    return (<span>{children}</span>);
  }
  return (
    <a
      href="#"
      onClick={e => {
        e.preventDefault();
        onClick(filter);
      }}>
      {children}
    </a>
  );
};

const Footer = ({
  visibilityFilter,
  onFilterClick
}) => (
  <p>
    Show: &nbsp;
    <FilterLink
      current={visibilityFilter}
      filter="SHOW_ALL"
      onClick={onFilterClick}
    >All</FilterLink> &nbsp;

    <FilterLink
      current={visibilityFilter}
      filter="SHOW_ACTIVE"
      onClick={onFilterClick}
    >Active</FilterLink> &nbsp;

    <FilterLink
      current={visibilityFilter}
      filter="SHOW_COMPLETED"
      onClick={onFilterClick}
    >Completed</FilterLink>
  </p>
);

const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos;
    case 'SHOW_COMPLETED':
      return todos.filter(t => t.completed);
    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed);
    default:
      return todos;
  }
};

let nextTodoId = 0;
const TodoApp = ({
  todos,
  visibilityFilter
}) => (
  <div>
    <AddTodo
      onAddClick={text =>
        store.dispatch({
          type: 'ADD_TODO',
          id: nextTodoId++,
          text
        })
      }
    />

    <TodoList
      todos={getVisibleTodos(
        todos,
        visibilityFilter
      )}
      onTodoClick={id =>
        store.dispatch({
          type: 'TOGGLE_TODO',
          id
        })
      }
    />

    <Footer
      visibilityFilter={visibilityFilter}
      onFilterClick={filter =>
        store.dispatch({
          type: 'SET_VISIBILITY_FILTER',
          filter
        })
      }
    />
  </div>
);

const render = () => {
  ReactDOM.render(
    <TodoApp {...store.getState()} />,
    document.getElementById('root')
  );
};

store.subscribe(render);
render();

/* TESTS */
const testAddTodo = () => {
  const stateBefore = [];
  const action = {
    type: 'ADD_TODO',
    id: 0,
    text: 'learn redux'
  };
  const stateAfter = [
    {
      id: 0,
      text: 'learn redux',
      completed: false
    }
  ];

  deepFreeze(stateBefore);
  deepFreeze(action);

  expect(
    todos(stateBefore, action)
  ).toEqual(stateAfter);
};

const testToggleTodo = () => {
  const stateBefore = [
    {
      id : 0,
      text: 'learn redux',
      completed: false
    },
    {
      id : 1,
      text: 'eat cheese',
      completed: false
    }
  ];

  const action = {
    type: 'TOGGLE_TODO',
    id: 1
  };

  const stateAfter = [
    {
      id : 0,
      text: 'learn redux',
      completed: false
    },
    {
      id : 1,
      text: 'eat cheese',
      completed: true
    }
  ];

  deepFreeze(stateBefore);
  deepFreeze(action);

  expect(
    todos(stateBefore, action)
  ).toEqual(stateAfter);
};

testAddTodo();
testToggleTodo();

console.log('all tests passed!');
/* END TESTS */