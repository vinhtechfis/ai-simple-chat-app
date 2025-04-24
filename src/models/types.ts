export interface Message {
    id: number
    text: string
    type: 'text' | 'file'
    file?: File
}
