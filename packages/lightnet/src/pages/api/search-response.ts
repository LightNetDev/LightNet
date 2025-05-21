export type SearchItem = {
  title: string
  id: string
  type: string
  authors?: string[] | null
  categories?: string[] | null
  description?: string
  language: string
  image: { src: string; width: number; height: number }
}

export type SearchResponse = {
  items: SearchItem[]
}
