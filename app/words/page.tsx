'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function WordsPage() {
  const [words, setWords] = useState<any[]>([])

  useEffect(() => {
    fetchWords()
  }, [])

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

  fetchWords() // 删除后重新加载列表
}

  async function fetchWords() {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .order('level', { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    if (data) setWords(data)
  }

  return (
    <main className="p-10">

      <h1 className="text-2xl font-bold mb-6">全部单词</h1>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">单词</th>
            <th className="border p-2">释义</th>
            <th className="border p-2">等级</th>
            <th className="border p-2">错误次数</th>
            <th className="border p-2">已掌握</th>
            <th className="border p-2">操作</th>
          </tr>
        </thead>

        <tbody>
  {words.map((word) => (
    <tr key={word.id}>
      <td className="border p-2">{word.word}</td>
      <td className="border p-2">{word.meaning}</td>
      <td className="border p-2">{word.level}</td>
      <td className="border p-2">{word.wrong_count}</td>
      <td className="border p-2">
        {word.known ? '✅' : '❌'}
      </td>
      <td className="border p-2">
        <button
          onClick={() => deleteWord(word.id)}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          删除
        </button>
      </td>
    </tr>
  ))}
        </tbody>
      </table>

    </main>
  )
}