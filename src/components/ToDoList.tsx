import { FC } from 'react'
import { useAppSelector } from '../hook'
import TodoItem from './ToDoItem'

const TodoList: FC = () => {
	const todos = useAppSelector(state => state.todos.list)

	return (
		<ul>
			{todos.map(todo => (
				<TodoItem key={todo.id} {...todo} />
			))}
		</ul>
	)
}

export default TodoList
