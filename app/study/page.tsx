'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function StudyPage() {

  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  const [words, setWords] = useState<any[]>([])
  const [current, setCurrent] = useState<any>(null)
  const [showMeaning, setShowMeaning] = useState(false)

  // 加载分类
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

  async function deleteWord(id: number) {
    const confirmDelete = confirm("确定删除这个单词吗？")
    if (!confirmDelete) return

    await supabase
      .from('words')
      .delete()
      .eq('id', id)

    if (selectedCategory) {
      fetchWords(selectedCategory)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center pt-20">

     <div className="w-full max-w-4xl flex justify-end mb-8">
  <Link
    href="/"
    className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:opacity-90 transition"
  >
    返回主页
  </Link>
    </div>

      {/* 分类选择 */}
      <div className="mb-8">
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(Number(e.target.value))}
          className="border border-gray-300 px-4 py-2 rounded-lg bg-white"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* 单词卡片 */}
      {current ? (
        <div className="bg-white rounded-2xl shadow-md w-96 p-8 text-center">

          <h1 className="text-3xl font-semibold mb-6">
            {current.word}
          </h1>

          {showMeaning && (
            <div className="mb-6">
              <p className="text-lg text-gray-700">
                {current.meaning}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {current.example}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4">

            {!showMeaning ? (
              <button
                onClick={() => setShowMeaning(true)}
                className="bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition"
              >
                显示释义
              </button>
            ) : (
              <button
                onClick={nextWord}
                className="bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition"
              >
                下一个
              </button>
            )}

            <button
              onClick={() => deleteWord(current.id)}
              className="text-sm text-gray-400 hover:text-red-500 transition"
            >
              删除单词
            </button>

          </div>

        </div>
      ) : (
        <div className="text-gray-400">
          当前分类还没有单词
        </div>
      )}

    </main>
  )
}