export interface Message {
    id: string
    text: string
    type: 'text' | 'file'
    file?: File
}
