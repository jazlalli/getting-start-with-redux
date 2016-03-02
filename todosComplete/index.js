const { createStore, combineReducers } = Redux;
const { Provider, connect } = ReactRedux;

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

let nextTodoId = 0;
const addTodo = text => {
  return {
    type: 'ADD_TODO',
    id: nextTodoId++,
    text
  };
}
const setVisibilityFilter = filter => {
  return {
    type: 'SET_VISIBILITY_FILTER',
    filter: filter
  };
};
const toggleTodo = id => {
  return {
    type: 'TOGGLE_TODO',
    id
  };
};


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

const mapStateToTodoListProps = state => {
  return {
    todos: getVisibleTodos(
      state.todos,
      state.visibilityFilter
    )
  };
};
const mapDispatchToTodoListProps = dispatch => {
  return {
    onTodoClick: id => dispatch(toggleTodo(id))
  };
};
const VisibleTodoList = connect(
  mapStateToTodoListProps,
  mapDispatchToTodoListProps
)(TodoList);

let AddTodo = ({ dispatch }) => {
  let input;
  return (
    <div>
      <input ref={node => {input = node}} />
      <button
        onClick={() => {
          dispatch(addTodo(input.value));
          input.value = '';
        }}>
        ADD TODO
      </button>
    </div>
  );
};
AddTodo = connect()(AddTodo);

const Link = ({
  active,
  children,
  onFilterClick
}) => {
  if (active) {
    return (<span>{children}</span>);
  }

  return (
    <a
      href="#"
      onClick={e => {
        e.preventDefault();
        onFilterClick();
      }}>
      {children}
    </a>
  );
};

const mapStateToLinkProps = (state, ownProps) => {
  return {
    active: ownProps.filter === state.visibilityFilter
  };
};
const mapDispatchToLinkProps = (dispatch, ownProps) => {
  return {
    onFilterClick: () => dispatch(setVisibilityFilter(ownProps.filter))
  };
};
const FilterLink = connect(
  mapStateToLinkProps,
  mapDispatchToLinkProps
)(Link);

const Footer = () => (
  <p>
    Show: &nbsp;
    <FilterLink filter="SHOW_ALL">All</FilterLink> &nbsp;
    <FilterLink filter="SHOW_ACTIVE">Active</FilterLink> &nbsp;
    <FilterLink filter="SHOW_COMPLETED">Completed</FilterLink>
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

const TodoApp = () => (
  <div>
    <AddTodo />
    <VisibleTodoList />
    <Footer />
  </div>
);

const todoAppStore  = combineReducers({
  todos,
  visibilityFilter
});

ReactDOM.render(
  <Provider store={createStore(todoAppStore)}>
    <TodoApp />
  </Provider>,
  document.getElementById('root')
);

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