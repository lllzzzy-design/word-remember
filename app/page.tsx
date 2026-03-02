'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [words, setWords] = useState<any[]>([])
  const [current, setCurrent] = useState<any>(null)
  const [showMeaning, setShowMeaning] = useState(false)

  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  const [newWord, setNewWord] = useState('')
  const [newMeaning, setNewMeaning] = useState('')
  const [newExample, setNewExample] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')

  // ======================
  // 加载分类
  // ======================
  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      fetchWords(selectedCategory)
    }
  }, [selectedCategory])

  async function fetchCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('id', { ascending: true })

    if (data) {
      setCategories(data)
      if (data.length > 0) {
        setSelectedCategory(data[0].id)
      }
    }
  }

  async function fetchWords(categoryId: number) {
    const { data } = await supabase
      .from('words')
      .select('*')
      .eq('category_id', categoryId)

    if (data && data.length > 0) {
      setWords(data)
      pickRandomWord(data)
    } else {
      setWords([])
      setCurrent(null)
    }
  }

  function pickRandomWord(wordList: any[]) {
    const random =
      wordList[Math.floor(Math.random() * wordList.length)]
    setCurrent(random)
    setShowMeaning(false)
  }

  function nextWord() {
    pickRandomWord(words)
  }

  async function addWord() {
    if (!newWord.trim() || !selectedCategory) {
      alert("单词和分类不能为空")
      return
    }

    await supabase.from('words').insert([
      {
        word: newWord.trim(),
        meaning: newMeaning.trim() || null,
        example: newExample.trim() || null,
        category_id: selectedCategory
      }
    ])

    setNewWord('')
    setNewMeaning('')
    setNewExample('')
    fetchWords(selectedCategory)
  }

  async function addCategory() {
    if (!newCategoryName.trim()) return

    const { error } = await supabase
      .from('categories')
      .insert([{ name: newCategoryName.trim() }])

    if (error) {
      alert("分类已存在")
      return
    }

    setNewCategoryName('')
    fetchCategories()
  }

  return (
    <main className="min-h-screen bg-gray-50 flex justify-center items-center">

      <div className="bg-white p-8 rounded-2xl shadow-md w-96">

        <h2 className="text-xl font-semibold mb-4">添加分类</h2>

        <div className="flex gap-2 mb-6">
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="新分类名称"
            className="border p-2 rounded w-full"
          />
          <button
            onClick={addCategory}
            className="bg-gray-900 text-white px-4 rounded"
          >
            添加
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-4">添加单词</h2>

        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(Number(e.target.value))}
          className="border p-2 mb-4 w-full rounded"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          placeholder="单词"
          className="border p-2 mb-2 w-full rounded"
        />

        <input
          value={newMeaning}
          onChange={(e) => setNewMeaning(e.target.value)}
          placeholder="释义"
          className="border p-2 mb-2 w-full rounded"
        />

        <input
          value={newExample}
          onChange={(e) => setNewExample(e.target.value)}
          placeholder="例句"
          className="border p-2 mb-4 w-full rounded"
        />

        <button
          onClick={addWord}
          className="bg-gray-900 text-white px-4 py-2 rounded w-full"
        >
          添加单词
        </button>

        <Link
          href="/words"
          className="block text-center mt-6 text-gray-500 hover:text-gray-700"
        >
          进入词库管理 →
        </Link>

        <Link
  href="/study"
  className="block text-center mt-4 text-gray-500 hover:text-gray-700"
>
  进入学习模式 →
</Link>

      </div>

    </main>
  )
}