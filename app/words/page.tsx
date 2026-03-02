'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function WordsPage() {
  const [words, setWords] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  useEffect(() => {
    fetchWords()
    fetchCategories()
  }, [])

  // ========================
  // 获取所有单词
  // ========================
  async function fetchWords(categoryId?: number) {

  let query = supabase
    .from('words')
    .select(`*, categories(name)`)
    .order('word', { ascending: true })

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query

  if (error) {
    console.error(error)
    return
  }

  if (data) setWords(data)
}

  // ========================
  // 获取所有分类
  // ========================
  async function fetchCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    if (data) setCategories(data)
  }

  // ========================
  // 删除单词
  // ========================
  async function deleteWord(id: number) {
    const confirmDelete = confirm("确定删除这个单词吗？")
    if (!confirmDelete) return

    const { error } = await supabase
      .from('words')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(error)
      return
    }

    fetchWords()
  }

  // ========================
  // 删除分类（有单词则不允许）
  // ========================
  async function deleteCategory(id: number) {
    const confirmDelete = confirm("确定删除这个分类吗？")
    if (!confirmDelete) return

    // 检查是否有单词
    const { count, error: countError } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)

    if (countError) {
      console.error(countError)
      return
    }

    if (count && count > 0) {
      alert(`该分类下还有 ${count} 个单词，不能删除`)
      return
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(error)
      return
    }

    fetchCategories()
  }

  return (
  <main className="min-h-screen bg-gray-50 py-12">

    <div className="flex justify-end mb-8">
      <Link
        href="/"
        className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:opacity-90 transition"
      >
        返回主页
      </Link>
    </div>

    <div className="max-w-6xl mx-auto px-6">

      {/* 页面标题 */}
      <h1 className="text-3xl font-semibold mb-12 text-gray-900">
        词库管理
      </h1>

      {/* 分类管理 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
        <h2 className="text-lg font-medium mb-6 text-gray-800">
          分类管理
        </h2>

        <div className="space-y-3">
  {categories.map((cat) => (
    <div
      key={cat.id}
      onClick={() => {
        setSelectedCategory(cat.id)
        fetchWords(cat.id)
      }}
      className={`flex justify-between items-center px-4 py-3 rounded-xl cursor-pointer transition
        ${selectedCategory === cat.id ? 'bg-gray-100' : 'hover:bg-gray-50'}
      `}
    >
      {/* 分类名称 */}
      <span className="font-medium text-gray-800">
        {cat.name}
      </span>

      {/* 删除按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation()   // 关键：阻止冒泡
          deleteCategory(cat.id)
        }}
        className="text-sm text-gray-400 hover:text-red-500 transition"
      >
        删除
      </button>
    </div>
  ))}
</div>
      </div>

      {/* 单词表格 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

        <h2 className="text-lg font-medium mb-6 text-gray-800">
          全部单词
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">

            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-sm">
                <th className="py-3">单词</th>
                <th className="py-3">释义</th>
                <th className="py-3">分类ID</th>
                <th className="py-3 text-right">操作</th>
              </tr>
            </thead>

            <tbody>
              {words.map((word) => (
                <tr
                  key={word.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="py-4 font-medium text-gray-900">
                    {word.word}
                  </td>
                  <td className="py-4 text-gray-600">
                    {word.meaning}
                  </td>
                  <td className="py-4 text-gray-400">
                    {word.categories?.name}
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => deleteWord(word.id)}
                      className="text-sm text-gray-400 hover:text-red-500 transition"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>

    </div>

  </main>
)
}