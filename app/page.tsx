'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [words, setWords] = useState<any[]>([])
  const [current, setCurrent] = useState<any>(null)
  const [showMeaning, setShowMeaning] = useState(false)
  const [level, setLevel] = useState('A1')
  const [newWord, setNewWord] = useState('')
  const [newMeaning, setNewMeaning] = useState('')
  const [newLevel, setNewLevel] = useState('A1')
  const [newExample, setNewExample] = useState('')

  useEffect(() => {
    fetchWords(level)
  }, [level])
  
  async function fetchWords(selectedLevel: string) {
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .eq('level', selectedLevel)

  if (error) {
    console.error(error)
    return
  }

  if (data && data.length > 0) {
    setWords(data)
    pickRandomWord(data)
  } else {
    setWords([])
    setCurrent(null)
  }
}

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

  // 重新加载当前等级
  fetchWords(level)
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

  if (!newWord.trim() || 
      !newMeaning.trim() || 
      !newExample.trim()) {
    alert("请完整填写单词、释义和例句")
    return
  }

  const { error } = await supabase.from('words').insert([
    {
      word: newWord.trim(),
      meaning: newMeaning.trim(),
      level: newLevel,
      example: newExample.trim()
    }
  ])

  if (error) {
    console.error(error)
    alert("添加失败")
    return
  }

  setNewWord('')
  setNewMeaning('')
  setNewExample('')

  fetchWords(level)
}

  if (!current) {
  return (
    <main className="p-10">
      <div>暂无该等级单词</div>
    </main>
  )
}

  return (
    <main className="flex flex-col items-center justify-center h-screen">
<div className="mb-10 border p-6 rounded w-96">

  <h2 className="text-lg font-bold mb-4">添加单词</h2>

<Link
  href="/words"
  className="absolute top-4 right-4 bg-gray-200 px-3 py-1 rounded"
>
  查看词库
</Link>

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
    className="border p-2 mb-2 w-full rounded"
  />

  <select
    value={newLevel}
    onChange={(e) => setNewLevel(e.target.value)}
    className="border p-2 mb-4 w-full rounded"
  >
    <option value="A1">A1</option>
    <option value="A2">A2</option>
    <option value="B1">B1</option>
    <option value="B2">B2</option>
    <option value="C1">C1</option>
    <option value="C2">C2</option>
  </select>

  <button
    onClick={addWord}
    className="bg-purple-500 text-white px-4 py-2 rounded w-full"
  >
    添加单词
  </button>

</div>
      <select
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        className="mb-6 border p-2 rounded"
      >
        <option value="A1">A1</option>
        <option value="A2">A2</option>
        <option value="B1">B1</option>
        <option value="B2">B2</option>
        <option value="C1">C1</option>
        <option value="C2">C2</option>
      </select>

      <div className="border p-10 rounded-xl shadow-lg w-96 text-center">

        <h1 className="text-3xl font-bold mb-6">
          {current.word}
        </h1>

        {showMeaning && (
          <>
            <p className="text-xl mb-2">{current.meaning}</p>
            <p className="text-gray-500">{current.example}</p>
          </>
        )}

        <div className="mt-6 flex flex-col gap-3">

  {!showMeaning ? (
    <button
      onClick={() => setShowMeaning(true)}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      显示释义
    </button>
  ) : (
    <button
      onClick={nextWord}
      className="bg-green-500 text-white px-4 py-2 rounded"
    >
      下一个
    </button>
  )}

  <button
    onClick={() => deleteWord(current.id)}
    className="bg-red-500 text-white px-4 py-2 rounded"
  >
    删除当前单词
  </button>

</div>
      </div>
    </main>
  )
}