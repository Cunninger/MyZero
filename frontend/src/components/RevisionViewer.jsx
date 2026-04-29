import React, { useState } from 'react'
import { Check, X, Info } from 'lucide-react'

const RevisionViewer = ({ beforeText, afterText, onAccept, onReject }) => {
  const [diffs, setDiffs] = useState([])
  const [hoveredDiff, setHoveredDiff] = useState(null)

  React.useEffect(() => {
    // Simple word-level diff
    const beforeWords = beforeText.split(/(\s+)/)
    const afterWords = afterText.split(/(\s+)/)

    const diffs = []
    let i = 0, j = 0

    while (i < beforeWords.length || j < afterWords.length) {
      if (i < beforeWords.length && j < afterWords.length && beforeWords[i] === afterWords[j]) {
        diffs.push({ type: 'same', content: beforeWords[i] })
        i++
        j++
      } else {
        // Find the next match
        let found = false
        for (let lookAhead = 1; lookAhead <= 5 && i + lookAhead < beforeWords.length; lookAhead++) {
          for (let lookAhead2 = 1; lookAhead2 <= 5 && j + lookAhead2 < afterWords.length; lookAhead2++) {
            if (beforeWords[i + lookAhead] === afterWords[j + lookAhead2]) {
              // Delete
              for (let k = 0; k < lookAhead; k++) {
                diffs.push({ type: 'delete', content: beforeWords[i + k] })
              }
              // Insert
              for (let k = 0; k < lookAhead2; k++) {
                diffs.push({ type: 'insert', content: afterWords[j + k] })
              }
              i += lookAhead
              j += lookAhead2
              found = true
              break
            }
          }
          if (found) break
        }

        if (!found) {
          if (i < beforeWords.length) {
            diffs.push({ type: 'delete', content: beforeWords[i] })
            i++
          }
          if (j < afterWords.length) {
            diffs.push({ type: 'insert', content: afterWords[j] })
            j++
          }
        }
      }
    }

    setDiffs(diffs)
  }, [beforeText, afterText])

  const getChangeStats = () => {
    const deletions = diffs.filter(d => d.type === 'delete').join('').length
    const insertions = diffs.filter(d => d.type === 'insert').join('').length
    return { deletions, insertions }
  }

  const stats = getChangeStats()

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          {stats.deletions > 0 && (
            <div className="flex items-center gap-1.5 text-red-600">
              <span className="font-medium">-{stats.deletions}</span>
              <span className="text-slate-500">字符</span>
            </div>
          )}
          {stats.insertions > 0 && (
            <div className="flex items-center gap-1.5 text-green-600">
              <span className="font-medium">+{stats.insertions}</span>
              <span className="text-slate-500">字符</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <Info className="w-3.5 h-3.5" />
          <span>悬停查看详情</span>
        </div>
      </div>

      {/* Revision view */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="prose prose-sm max-w-none">
          {diffs.map((diff, idx) => {
            if (diff.type === 'same') {
              return <span key={idx}>{diff.content}</span>
            } else if (diff.type === 'delete') {
              return (
                <span
                  key={idx}
                  className="inline relative text-red-600 line-through decoration-red-400 decoration-2 bg-red-50/50 px-0.5 rounded cursor-help"
                  onMouseEnter={() => setHoveredDiff({ type: 'delete', content: diff.content, index: idx })}
                  onMouseLeave={() => setHoveredDiff(null)}
                >
                  {diff.content}
                </span>
              )
            } else if (diff.type === 'insert') {
              return (
                <span
                  key={idx}
                  className="inline relative text-green-700 underline decoration-green-500 decoration-2 bg-green-50/50 px-0.5 rounded cursor-help"
                  onMouseEnter={() => setHoveredDiff({ type: 'insert', content: diff.content, index: idx })}
                  onMouseLeave={() => setHoveredDiff(null)}
                >
                  {diff.content}
                </span>
              )
            }
            return null
          })}
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredDiff && (
        <div className="fixed z-50 bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl max-w-xs">
          <div className="flex items-center gap-2 mb-1">
            {hoveredDiff.type === 'delete' ? (
              <>
                <X className="w-3 h-3 text-red-400" />
                <span className="font-medium text-red-400">删除</span>
              </>
            ) : (
              <>
                <Check className="w-3 h-3 text-green-400" />
                <span className="font-medium text-green-400">新增</span>
              </>
            )}
          </div>
          <div className="text-slate-300 break-words">"{hoveredDiff.content}"</div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onReject}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          拒绝变更
        </button>
        <button
          onClick={onAccept}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          接受变更
        </button>
      </div>
    </div>
  )
}

export default RevisionViewer
