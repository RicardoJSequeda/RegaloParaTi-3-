export type MessageRow = {
	id: string
	title: string
	content: string
	date: string
	category: string
	is_read: boolean
	is_favorite: boolean
	created_at: string
	updated_at: string | null
}

export type InsertMessage = Omit<MessageRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }
export type UpdateMessage = Partial<Omit<MessageRow, 'id' | 'created_at'>> & { id: string }
