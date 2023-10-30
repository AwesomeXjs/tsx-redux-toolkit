import { FC } from 'react'
import { useAppDispatch } from '../hook'
import { toggleComplete, removeTodo, ToDo } from '../store/todoSlice'

const TodoItem: FC<ToDo> = ({ id, title, completed }) => {
	const dispatch = useAppDispatch()

	return (
		<li>
			<input
				type='checkbox'
				checked={completed}
				onChange={() => dispatch(toggleComplete(id))}
			/>
			<span>{title}</span>
			<span onClick={() => dispatch(removeTodo(id))}>&times;</span>
		</li>
	)
}

export default TodoItem
