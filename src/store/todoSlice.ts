import {
	AnyAction,
	createAsyncThunk,
	createSlice,
	PayloadAction,
} from '@reduxjs/toolkit'
import { act } from 'react-dom/test-utils'

export type ToDo = {
	id: string
	title: string
	completed: boolean
}

type TodosState = {
	list: ToDo[]
	loading: boolean
	error: string | null
}

const initialState: TodosState = {
	list: [],
	loading: false,
	error: null,
}

export const fetchTodos = createAsyncThunk<
	ToDo[],
	undefined,
	{ rejectValue: string }
>('todos/fetchTodos', async function (_, { rejectWithValue }) {
	const response = await fetch(
		'https://jsonplaceholder.typicode.com/todos?_limit=10'
	)

	if (!response.ok) {
		return rejectWithValue('Server Error!')
	}

	const data = await response.json()

	return data
})

export const addNewTodo = createAsyncThunk<
	ToDo,
	string,
	{ rejectValue: string }
>('todos/addNewTodo', async function (text, { rejectWithValue, dispatch }) {
	const todo = {
		title: text,
		userId: 1,
		completed: false,
	}

	const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(todo),
	})

	if (!response.ok) {
		return rejectWithValue("Can't add task. Server error.")
	}
	return (await response.json()) as ToDo
})

export const toggleStatus = createAsyncThunk<
	ToDo,
	string,
	{ rejectValue: string; state: { todos: TodosState } }
>(
	'todos/toggleStatus',
	async function (id, { rejectWithValue, dispatch, getState }) {
		const todo = getState().todos.list.find(todo => todo.id === id)

		if (todo) {
			const response = await fetch(
				`https://jsonplaceholder.typicode.com/todos/${id}`,
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						completed: !todo.completed,
					}),
				}
			)
			if (!response.ok) {
				return rejectWithValue("Can't toggle status. Server error.")
			}

			return (await response.json()) as ToDo
		}
		return rejectWithValue("Can't toggle status. Server error.")
	}
)

export const deleteTodo = createAsyncThunk<
	string,
	string,
	{ rejectValue: string }
>('todos/deleteTodo', async function (id, { rejectWithValue, dispatch }) {
	const response = await fetch(
		`https://jsonplaceholder.typicode.com/todos/${id}`,
		{
			method: 'DELETE',
		}
	)

	if (!response.ok) {
		return rejectWithValue("Can't delete task. Server error.")
	}
	return id
})

const todoSlice = createSlice({
	name: 'todos',
	initialState,
	reducers: {
		addTodo(state, action: PayloadAction<string>) {
			state.list.push({
				id: new Date().toISOString(),
				title: action.payload,
				completed: false,
			})
		},
		toggleComplete(state, action: PayloadAction<string>) {
			const toggledTodo = state.list.find(todo => todo.id === action.payload)
			if (toggledTodo) {
				toggledTodo.completed = !toggledTodo.completed
			}
		},
		removeTodo(state, action: PayloadAction<string>) {
			state.list = state.list.filter(todo => todo.id !== action.payload)
		},
	},
	extraReducers: builder => {
		builder
			.addCase(fetchTodos.pending, (state, action) => {
				state.loading = true
				state.error = null
			})
			.addCase(fetchTodos.fulfilled, (state, action) => {
				state.list = action.payload
				state.loading = false
			})
			.addCase(addNewTodo.pending, (state, action) => {
				state.error = null
			})
			.addCase(addNewTodo.fulfilled, (state, action) => {
				state.list.push(action.payload)
			})
			.addCase(toggleStatus.fulfilled, (state, action) => {
				const toggledTodo = state.list.find(
					todo => todo.id === action.payload.id
				)
				if (toggledTodo) {
					toggledTodo.completed = !toggledTodo.completed
				}
			})
			.addCase(deleteTodo.fulfilled, (state, action) => {
				state.list = state.list.filter(todo => todo.id !== action.payload)
			})
			.addMatcher(isError, (state, action: PayloadAction<string>) => {
				state.error = action.payload
				state.loading = false
			})
	},
})

export const { addTodo, toggleComplete, removeTodo } = todoSlice.actions

export default todoSlice.reducer

function isError(action: AnyAction) {
	return action.type.endsWith('rejected')
}
